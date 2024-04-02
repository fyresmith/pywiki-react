import { toast } from 'react-toastify';

export const API_BASE_URL = '/api';

export const verifyUser = async () => {
    try {
        const response = await fetch(API_BASE_URL + '/verify-user', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({}),
            credentials: 'include',
        });

        if (!response.ok) {
            throw new Error('Network response was not ok.');
        }
        
        const data = await response.json();
        console.log(data)

        if (data.success) {
            console.log('User is signed in.');
            console.log(data.data.user);
            return true;
        } else {
            console.log('User is not signed in.');
            return false;
        }
    } catch (error) {
        console.error('There was a problem with the fetch operation:', error);
        return false;
    }
};

export const fetchUserData = async () => {
    try {
        const response = await fetch(API_BASE_URL + '/verify-user', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({}),
            credentials: 'include',
        });

        if (!response.ok) {
            throw new Error('Network response was not ok.');
        }
        
        const data = await response.json();

        if (data.success) {
            console.log('Returning user data.');
            return data.data.user;
        } else {
            console.log('User is not signed in.');
            return null;
        }
    } catch (error) {
        console.error('There was a problem with the fetch operation:', error);
        return null;
    }
};

export const setGlobalTheme = (theme) => {
    const validThemes = ['light', 'dark'];
  
    if (!validThemes.includes(theme)) {
      console.error('Invalid theme. Please provide "light" or "dark" as the theme.');
      return;
    }
  
    const storedTheme = localStorage.getItem('theme');
    if (storedTheme !== theme) {
      localStorage.setItem('theme', theme);
      document.documentElement.setAttribute('data-bs-theme', theme);
    }
};

export const getTheme = () => {
    const storedTheme = localStorage.getItem('theme');
    return storedTheme === 'dark' ? 'dark' : 'light';
};

export function linkify(inputString, base_url) {
    const regex = /\[\[([^[\]]+)\]\]/g;

    function replaceDoubleBracket(match, subtext) {
        const link = `<a href="/page/${subtext.toLowerCase().replace(/\s+/g, '-')}">${subtext}</a>`;
        return link;
    }

    let modifiedString = inputString;
    let match;
    while ((match = regex.exec(inputString)) !== null) {
        modifiedString = modifiedString.replace(match[0], replaceDoubleBracket(match[0], match[1]));
    }

    return modifiedString;
}

export const toastSuccess = (message) => toast.success(message);
export const toastFailure = (message) => toast.warning(message);