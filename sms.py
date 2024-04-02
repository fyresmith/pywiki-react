import os
import smtplib
from email.message import EmailMessage

from dotenv import load_dotenv

PROVIDERS = {
    "AT&T": {"sms": "txt.att.net", "mms": "mms.att.net", "mms_support": True},
    "Verizon": {"sms": "vtext.com", "mms": "vzwpix.com", "mms_support": True},
    "T-Mobile": {"sms": "tmomail.net", "mms_support": True},
    "Sprint": {"sms": "messaging.sprintpcs.com", "mms": "pm.sprint.com", "mms_support": True},
    "Metro PCS": {"sms": "mymetropcs.com", "mms_support": True},
    "Cricket Wireless": {"sms": "sms.cricketwireless.net", "mms": "mms.cricketwireless.net", "mms_support": True},
    "U.S. Cellular": {"sms": "email.uscc.net", "mms": "mms.uscc.net", "mms_support": True},
    "Boost Mobile": {"sms": "sms.myboostmobile.com", "mms": "myboostmobile.com", "mms_support": True},
    "Straight Talk": {"sms": "vtext.com", "mms": "mypixmessages.com", "mms_support": True},
    "Virgin Mobile": {"sms": "vmobl.com", "mms": "vmpix.com", "mms_support": True},
    "Xfinity Mobile": {"sms": "vtext.com", "mms": "mypixmessages.com", "mms_support": True},
    "Google Project Fi": {"sms": "msg.fi.google.com", "mms_support": True},
    "Tracfone": {"sms": "", "mms": "mmst5.tracfone.com", "mms_support": True},
    "Consumer Cellular": {"sms": "mailmymobile.net", "mms_support": False},
    "Mint Mobile": {"sms": "mailmymobile.net", "mms_support": False},
    "C-Spire": {"sms": "cspire1.com", "mms_support": False},
    "Page Plus": {"sms": "vtext.com", "mms": "mypixmessages.com", "mms_support": True},
    "Republic Wireless": {"sms": "text.republicwireless.com", "mms_support": False},
    "Ting": {"sms": "message.ting.com", "mms_support": False},
}

load_dotenv()

EMAIL = os.getenv('SMS_EMAIL')
PASSWORD = os.getenv('SMS_APP_PASSWORD')


def send_sms(phone_number, carrier, message):
    recipient = phone_number + "@" + carrier
    msg = EmailMessage()
    msg.set_content(message)
    msg["Subject"] = ""
    msg["From"] = EMAIL
    msg["To"] = recipient

    try:
        with smtplib.SMTP("smtp.gmail.com", 587) as server:
            server.starttls()
            server.login(EMAIL, PASSWORD)
            server.send_message(msg)
        return True  # Message sent successfully
    except Exception as e:
        print(f"Failed to send SMS via {carrier}: {e}")
        return False  # Message sending failed


def send_universal_sms(phone_number, message):
    for carrier, data in PROVIDERS.items():
        if data.get("sms"):
            result = send_sms(phone_number, data["sms"], message)
            if result:
                print(f"SMS sent via {carrier}: {message}")
            else:
                print(f"Failed to send SMS via {carrier}")
        else:
            print(f"SMS sending not supported for {carrier}")
