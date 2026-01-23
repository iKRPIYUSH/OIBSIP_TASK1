# Setup Instructions for Task1.py Voice Assistant

## Prerequisites

1. **Python 3.7 or higher** installed on your system
2. **Internet connection** (required for OpenAI API and Google Speech Recognition)
3. **Microphone** (optional, for voice mode functionality)
4. **OpenAI API Key** (get one from https://platform.openai.com/api-keys)
5. **Email credentials** (Gmail or other SMTP-compatible email)

## Installation Steps

### 1. Install Required Packages

Open your terminal/command prompt in the project directory and run:

```bash
pip install -r requirements.txt
```

**Note for Windows users:** If `pyaudio` installation fails, you may need to install it separately:
```bash
pip install pipwin
pipwin install pyaudio
```

Or download the appropriate wheel file from: https://www.lfd.uci.edu/~gohlke/pythonlibs/#pyaudio

### 2. Configure API Keys and Credentials

Edit `Task1.py` and update the following lines:

**Line 13:** Replace with your OpenAI API key
```python
openai.api_key = 'YOUR_OPENAI_API_KEY'  # Replace with your actual OpenAI API key
```

**Lines 16-17:** Replace with your email credentials
```python
email_sender = 'YOUR_EMAIL@gmail.com'  # Replace with your email address
email_password = 'YOUR_EMAIL_PASSWORD'  # Replace with your email password
```

**Important for Gmail users:**
- You need to use an **App Password**, not your regular Gmail password
- Enable 2-factor authentication first
- Generate an app password: https://myaccount.google.com/apppasswords
- Use the 16-character app password in the code

**For other email providers:**
- Update `smtp_server` and `smtp_port` (line 18-19) if not using Gmail
- Common SMTP settings:
  - Outlook: `smtp-mail.outlook.com`, port 587
  - Yahoo: `smtp.mail.yahoo.com`, port 587

### 3. Run the Script

Simply run:
```bash
python Task1.py
```

Or if you're using Python 3 specifically:
```bash
python3 Task1.py
```

## Usage

### Text Mode (Default)
- Type your messages and press Enter
- Commands:
  - `voice mode` - Switch to voice input mode
  - `send an email` or `email` - Send an email
  - `exit` or `quit` - Exit the program

### Voice Mode
- Say "voice mode" in text mode to switch
- Speak your commands clearly
- Commands:
  - `text mode` - Switch back to text mode
  - `email` - Send an email
  - `exit` or `quit` - Exit the program

### Email Functionality
- The chatbot will try to extract email details from your input
- If recipient email is not found, you'll be prompted to enter it
- Format: "send email to recipient@example.com subject: Hello message: This is a test"

## Troubleshooting

### Microphone Issues
- If microphone doesn't work, the program will automatically switch to text mode
- Make sure your microphone is connected and enabled in system settings

### OpenAI API Errors
- Check that your API key is correct and has credits
- Verify you have internet connection
- Check OpenAI service status: https://status.openai.com/

### Email Sending Errors
- For Gmail: Use App Password, not regular password
- Check that 2FA is enabled on your Google account
- Verify SMTP server and port settings for your email provider
- Some email providers may require enabling "Less secure app access" (not recommended)

### Import Errors
- Make sure all packages are installed: `pip install -r requirements.txt`
- If using a virtual environment, activate it first

## Features

✅ Text and Voice input modes
✅ OpenAI GPT integration for intelligent responses
✅ Email sending functionality
✅ Conversation history tracking
✅ Automatic email summary on exit
✅ Comprehensive error handling
✅ Input validation

## Notes

- The script runs in your terminal/command prompt (not a web browser)
- It requires an active internet connection
- Voice mode requires a working microphone
- All conversation history is saved and emailed when you exit
