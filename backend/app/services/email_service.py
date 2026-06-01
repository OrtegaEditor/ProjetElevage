import os
import smtplib
from email.mime.text import MIMEText
from app.core.config import settings

def send_real_invite_email(to_email: str, temp_password: str):
    # Idéalement, mets ces infos dans ton fichier .env plus tard
    sender = settings.EMAIL_SENDER
    app_password = settings.EMAIL_APP_PASSWORD
    
    msg = MIMEText(f"Bienvenue ! Voici votre mot de passe temporaire : {temp_password}\nVous pouvez maintenant vous connecter à la ferme.")
    msg['Subject'] = 'Invitation à rejoindre une ferme'
    msg['From'] = sender
    msg['To'] = to_email

    # Utilisation de Gmail comme exemple (port 465 pour SSL)
    with smtplib.SMTP_SSL('smtp.gmail.com', 465) as server:
        server.login(sender, app_password)
        server.send_message(msg)