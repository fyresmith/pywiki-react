import logging
import os
import time
from datetime import datetime, timezone, timedelta
from functools import wraps
from typing import List

from mailer import send_email
from backup import backup_db

import markdown_engine
from markdown_engine import to_html

from db import Access

import jwt

from flask import Flask, redirect, request, jsonify, make_response, send_from_directory
from flask_cors import CORS, cross_origin
import random
from dotenv import load_dotenv

# load environment variables
load_dotenv()

# flask app configuration
app = Flask(__name__)

cors = CORS(app, supports_credentials=True)
app.secret_key = os.getenv('SECRET_KEY')
app.config['CORS_HEADERS'] = 'Content-Type'
app.static_folder = 'pywiki-react/build'

# logging configuration
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s [%(levelname)s] %(message)s',
    handlers=[
        logging.FileHandler(os.getenv('ROOT_FOLDER') + 'logs/app.log'),
        logging.StreamHandler()
    ]
)

log = logging.getLogger("app")

# global variables
react_folder = 'pywiki-react'
build_folder = os.getcwd() + f'/{react_folder}/build'
last_backup = time.time()
code = {}
pages_being_edited = {}
last_update_times = {}


# helper functions
def unlock_page(page: str, email=None):
    """
    Unlocks a page if this server has not received a ping from an editor in twenty seconds.

    :param email: Optional email address
    :param page: The name of the page to be checked as a string
    :return: nothing
    """

    if page not in pages_being_edited.keys():
        log.info(f'"{page}" not locked.')
        return True

    current_time = time.time()
    last_update_time = last_update_times.get(page, 0)

    if pages_being_edited[page] == email:
        log.info(f'Page: {page} unlocked due identity match.')
        del pages_being_edited[page]
        return True
    elif current_time - last_update_time >= 20:
        log.info(f'Page: {page} unlocked due to inactivity.')
        del pages_being_edited[page]
        return True
    else:
        return False


def lock_page(page: str, email: str):
    """
    Locks a page for a user to edit.

    :param page: Name of the page to be locked.
    :param email: User's email address.
    :return: None.
    """

    log.info(f'"{page}" locked')
    pages_being_edited[page] = email
    last_update_times[page] = time.time()


def get_page_list() -> List[dict]:
    """
    Retrieves a list of recent pages based on their titles and dates.

    :return: A list of recent page titles.
    :rtype: list
    """
    # create an Access instance for the 'pages' collection
    access = Access('pages')

    # select 'title' and 'date' fields from the 'pages' collection
    select = access.select(['title', 'date'])

    # sort the list of tuples based on both date and time in descending order
    sorted_tuples = sorted(select, key=lambda item: (datetime.strptime(item[1], "%b %d, %Y - %I:%M %p"), item),
                           reverse=True)

    # extract page titles from the sorted tuples
    page_list = [subtuple[0] for subtuple in sorted_tuples]

    page_data_list = []

    for page in page_list:
        select = access.select(['editor', 'date'], f'title="{page}"')

        page_data_list.append({
            'page': page,
            'editor': select[0][0],
            'date': select[0][1]
        })

    return page_data_list


def response(status: bool, data: dict):
    return {'success': status, 'data' if status else 'error': data}


def generate_random_code() -> str:
    """
    Generates a random 6-digit code.

    :return: A randomly generated 6-digit code.
    :rtype: str
    """
    # generate a random integer between 100000 and 999999
    random_code = str(random.randint(100000, 999999))

    # return the generated code as a string
    return random_code


def get_user_info(email: str) -> list or None:
    access = Access('users')

    users = access.select(['email', 'firstName', 'lastName', 'role'])

    for user in users:
        if email == user[0]:
            log.info('User updated.')
            return user

    return None


def get_pages() -> List[str]:
    """
    Retrieves a list of every page.

    :return: A list of every page title.
    :rtype: list
    """
    # create an Access instance for the 'pages' collection
    access = Access('pages')

    # select 'title' and 'date' fields from the 'pages' collection
    select = access.select(['title'])

    page_list = []

    for tup in select:
        page_list.append(tup[0])

    return page_list


def get_page_categories() -> list:
    """
    Retrieves unique categories from the 'pages' collection.

    :return: A list of unique categories.
    :rtype: list
    """
    retries = 0

    access = Access('pages')

    select = access.select(['category'])

    categories = []

    for item_list in select:
        category = item_list[0]

        if ',' in category:
            string = category.split(',')
        else:
            string = [category]

        for item in string:
            if item.strip() not in categories:
                # if not, add it to the list of categories
                categories.append(item.strip())

    return categories


def get_organized_pages():
    """
    Retrieves pages organized by categories from the 'pages' collection.

    :return: A dictionary of pages organized by categories.
    :rtype: dict
    """
    # obtain a list of unique categories using the get_categories function
    categories = get_page_categories()

    # initialize a dictionary where each category is a key mapped to an empty list
    pages = {key: [] for key in categories}

    # create an Access instance for the 'pages' collection
    access = Access('pages')

    select = access.select(['title', 'category'])

    for page in select:
        for category in categories:
            if category in page[1] and category != '':
                pages[category].append(page[0])
            elif category == '' and page[1] == '':
                pages[category].append(page[0])

    # return the dictionary of pages organized by categories
    return pages


def authenticate_user(email: str, password: str) -> list or None:
    """
    Authenticates a user based on email and password.

    :param email: The email of the user attempting to authenticate.
    :type email: str
    :param password: The password of the user attempting to authenticate.
    :type password: str

    :return: True if authentication is successful, False otherwise.
    :rtype: bool
    """
    access = Access('users')

    users = access.select(['email', 'password', 'firstName', 'lastName', 'role', 'phoneNumber'])

    for user in users:
        if email == user[0] and password == user[1]:
            log.info('User retrieved.')
            return user

    return None


def is_valid_page(page: str):
    return not ('_' in page or len(page) < 3 or '-' in page or '/' in page)


def find_closest_title(page_name):
    pages = get_pages()

    for page in pages:
        if page_name.lower() == page.lower():
            return page

    return None


def generate_token(user: List[str]) -> str:
    """
    Generates a JWT (JSON Web Token) for the given username.

    :param user: The username for which the token is generated.
    :type user: list

    :return: The generated JWT token.
    :rtype: str
    """

    payload = {
        'email': user[0],
        'first_name': user[1],
        'last_name': user[2],
        'role': user[3]
    }

    token = jwt.encode(payload, app.secret_key, algorithm='HS256')

    return token


def token_required(f):
    """
    Decorator function to enforce token authentication for a given route.

    :param f: The route function to be decorated.
    :type f: function

    :return: The decorated route function.
    :rtype: function
    """

    @wraps(f)
    def decorated(*args, **kwargs):
        token = request.cookies.get('token')

        if not token:
            log.warning('Token is missing. Redirecting to sign-in page.')
            return redirect('/invalid-user', 302)

        try:
            data = jwt.decode(token, app.secret_key, algorithms=['HS256'])

            user = {
                'email': data['email'],
                'role': data['role'],
                'first_name': data['first_name'],
                'last_name': data['last_name']
            }

        except jwt.ExpiredSignatureError:
            log.warning('Token has expired. Redirecting to sign-in page.')
            return redirect('/invalid-user', 302)

        except jwt.InvalidTokenError:
            log.warning('Invalid token. Redirecting to sign-in page.')
            return redirect('/invalid-user', 302)

        return f(user, *args, **kwargs)

    return decorated


@app.after_request
def after_request(response):
    response.headers.add('Access-Control-Allow-Origin', 'http://localhost:3000')
    response.headers.add('Access-Control-Allow-Headers', 'Content-Type,Authorization')
    response.headers.add('Access-Control-Allow-Credentials', 'true')
    response.headers.add('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS')
    return response


@app.route('/api/verify-user', methods=['GET', 'POST'])
@cross_origin(supports_credentials=True)
@token_required
def verify(user):
    global last_backup

    current_time = time.time()

    if current_time - last_backup >= 86400:
        try:
            backup_db()
            last_backup = time.time()
        except Exception as e:
            log.warning(e)

    return response(True, {'user': user})


@app.route('/api/invalid-user')
def failure():
    return response(False, {
        'code': 403,
        'message': 'Access Denied: User is not signed in.'
    })


@app.route('/api/sign-in', methods=['POST'])
def sign_in():
    if request.method == 'POST' and request.is_json:
        form_data = request.json
        email = form_data.get('email')
        password = form_data.get('password')

        user = authenticate_user(email, password)

        if user:
            log.info(f'Beginning verification check on user: {user[0]}')
            code[user[0]] = generate_random_code()
            send_email(email, code[user[0]])
            # send_universal_sms(user[-1], f'\nYour verification code is: {code[user[0]]}')

            return response(True, {'user': user})
        else:
            log.info('Incorrect sign in.')
            return response(False, {'code': 404, 'message': 'User not found.'})
    else:
        return response(False, {'code': 422, 'message': 'Unprocessable JSON Content'})


@app.route('/api/verify-code', methods=['POST'])
@cross_origin()
def verify_code():
    if request.method == 'POST' and request.is_json:
        form_data = request.json
        email = form_data.get('email')
        user_given_code = str(form_data.get('code'))
        server_code = code.get(email)

        if user_given_code == server_code:
            log.info('Code matches.')
            user = get_user_info(email)
            token = generate_token(user)
            expiration_time = datetime.now(timezone.utc) + timedelta(days=1)
            resp = make_response(response(True, {'user': user}), 200)
            resp.set_cookie('token', token, httponly=True, expires=expiration_time)
            return resp
        else:
            return response(False, {'code': 403, 'message': 'Access denied! Codes did not match.'})
    else:
        return response(False, {'code': 422, 'message': 'Unprocessable JSON Content.'})


@app.route('/api/save-page', methods=['POST'])
@token_required
def save_page(user: dict):
    if user['role'] not in {'admin', 'editor'}:
        log.info('Access denied due to privileges.')
        return response(False, {'code': 403, 'message': 'Access Denied: User is not privileged enough to access page.'})

    if request.method == 'POST' and request.is_json:
        form_data = request.json
        log.info(form_data)
        old_title = form_data.get('oldTitle')
        new_title = form_data.get('newTitle')
        category = form_data.get('category')
        markdown = form_data.get('markdown')

        access = Access('pages')
        pages = get_pages()

        if old_title in pages:
            update = access.update(['title', 'category', 'markdown', 'date', 'editor'],
                                   [new_title, category, markdown, datetime.now().strftime('%b %d, %Y - %I:%M %p'), user['first_name']],
                                   f'title="{old_title}"')

            if update:
                return response(True, {'message': f'{new_title} updated successfully!'})
            else:
                return response(False, {'code': 500, 'message': 'There was an internal server error.'})
        else:
            return response(False, {'code': 404, 'message': f'{old_title} was not found.'})
    else:
        return response(False, {'code': 422, 'message': 'Unprocessable JSON Content.'})


@app.route('/api/delete-page', methods=['POST'])
@token_required
def delete_page(user: dict):
    if user['role'] not in {'admin', 'editor'}:
        log.info('Access denied due to privileges.')
        return response(False, {'code': 403, 'message': 'Access Denied: User is not privileged enough to access page.'})

    if request.method != 'POST' or not request.is_json:
        return response(False, {'code': 400, 'message': 'Invalid JSON data in request.'})

    form_data = request.json
    log.info(form_data)
    title = form_data.get('pageName')
    server_title = form_data.get('serverPageName')

    if title != server_title:
        log.info('Titles do not match.')
        return response(False, {'code': 406, 'message': 'Titles do not match!'})

    access = Access('pages')
    deletion = access.delete(f'title="{title}"')

    if deletion:
        return response(True, {'message': f'"{title}" deleted!'})
    else:
        return response(False, {'code': 500, 'message': 'There was an internal server error.'})


@app.route('/api/create-page', methods=['POST'])
@token_required
def create_page(user: dict):
    if user['role'] not in {'admin', 'editor'}:
        log.info('Access denied due to privileges.')
        return response(False, {'code': 403, 'message': 'Access Denied: User is not privileged enough to access page.'})

    if request.method != 'POST' or not request.is_json:
        return response(False, {'code': 400, 'message': 'Invalid JSON data in request.'})

    form_data = request.json
    log.info(form_data)
    title = form_data.get('pageName')

    access = Access('pages')
    pages = [page.lower().strip() for page in get_pages()]

    if title.lower().strip() in pages:
        return response(False, {'code': 406, 'message': f'{title} already exists.'})

    if not is_valid_page(title.lower().strip()):
        return response(False, {'code': 422, 'message': f'{title} invalid.'})

    insert = access.insert(['title', 'markdown', 'date', 'editor', 'category'],
                           [title.strip(), markdown_engine.DEFAULT_MARKDOWN,
                            datetime.now().strftime('%b %d, %Y - %I:%M %p'), user['first_name'], ''])

    if insert:
        return response(True, {'message': f'Page "{title}" created!'})
    else:
        return response(False, {'code': 500, 'message': 'There was an internal server error.'})


@app.route('/api/log-out', methods=['POST'])
@cross_origin()
def log_out():
    expiration_time = datetime.now(timezone.utc) + timedelta(days=0)
    resp = make_response(response(True, {}), 200)
    resp.set_cookie('token', '', httponly=True, expires=expiration_time)
    return resp, 200


@app.route('/api/pages', methods=['GET'])
@token_required
def page_list(user: dict):
    pages = get_organized_pages()

    return response(True, {
        'user': user,
        'pages': pages
    })


@app.route('/api/recent-pages', methods=['GET'])
@token_required
def get_recent_pages(user: dict):
    pages = get_page_list()
    final_pages = []

    for i in range(0, 6):
        final_pages.append(pages[i])

    return response(True, {
        'user': user,
        'pages': final_pages
    })


@app.route('/api/closest-page/<page_name>', methods=['GET'])
@token_required
def get_closest_page(user: dict, page_name):
    log.info(page_name)
    title = page_name.replace('-', ' ').title()
    page = find_closest_title(title)

    if page:
        return response(True, {
            'page': page
        })
    else:
        return response(False, {
            'code': 404,
            'message': 'Page not found!'
        })


@app.route('/api/page/<page_name>', methods=['GET'])
@token_required
def get_page(user: dict, page_name):
    log.info(page_name)

    title = page_name.replace('-', ' ').title()

    page = find_closest_title(title)

    if not page:
            return response(False, {'code': 404, 'message': f'{title} could not be found.'})

    access = Access('pages')
    select = access.select(['markdown'], f'title="{page}"')

    if not select:
        return response(False, {'code': 500, 'message': 'The markdown was not translated correctly.'})

    html, toc, infobox = to_html(select[0][0])

    return response(True, {'title': page, 'html': html, 'user': user, 'tableOfContents': toc, 'infoBox': infobox})


@app.route('/api/editor/<page_name>', methods=['GET'])
@token_required
def get_editor(user: dict, page_name):
    log.info(page_name)

    title = page_name.replace('-', ' ').title()

    page = find_closest_title(title)

    if user['role'] not in {'admin', 'editor'}:
        log.info('Access denied due to privileges.')
        return response(False, {'code': 403, 'message': 'Access Denied: User is not privileged enough to access page.'})

    if not unlock_page(page, email=user['email']):
        log.info('Access denied due to page lock.')
        return response(False, {'code': 423, 'message': 'Access Denied: Page is currently locked.'})

    lock_page(page, user['email'])

    if not page:
        return response(False, {'code': 404, 'message': f'{title} could not be found.'})

    access = Access('pages')
    select = access.select(['markdown', 'category'], f'title="{page}"')

    if not select:
        return response(False, {'code': 500, 'message': 'The markdown was unable to be retrieved.'})

    return response(True, {'title': page, 'markdown': select[0][0], 'category': select[0][1], 'user': user})


@app.route('/')
def index():
    path = os.getcwd() + f'/{react_folder}/build'
    return send_from_directory(directory=path, path='index.html')


@app.route('/<path:path>')
def serve_react_app(path):
    if path.startswith('api/'):
        pass
    elif path.startswith('static/'):
        log.info('STATIC' + path)
    else:
        return send_from_directory(app.static_folder, 'index.html')


if __name__ == '__main__':
    app.run()



