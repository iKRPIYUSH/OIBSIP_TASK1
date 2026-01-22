# Voice Assistant

import openai  # Import the OpenAI module
import pyttsx3
import speech_recognition as sr
import smtplib
import ssl
import re
from email.message import EmailMessage
from typing import Optional, Tuple

# Set your OpenAI API key
openai.api_key = 'YOUR_OPENAI_API_KEY'  # Replace with your actual OpenAI API key

# Set your email credentials
email_sender = 'YOUR_EMAIL@gmail.com'  # Replace with your email address
email_password = 'YOUR_EMAIL_PASSWORD'  # Replace with your email password
smtp_server = 'smtp.gmail.com'  # Change based on your email provider
smtp_port = 465  # Change based on your email provider

# Initialize the text-to-speech engine
def init_tts_engine():
    """Initialize and configure the text-to-speech engine with error handling."""
    try:
        engine = pyttsx3.init()
        voices = engine.getProperty('voices')
        # Change the index to select a different voice (if available)
        # Fixed: Added check to prevent IndexError if no voices are available
        if voices and len(voices) > 0:
            engine.setProperty('voice', voices[0].id)
        new_rate = 180  # Adjust the rate as needed
        engine.setProperty('rate', new_rate)
        return engine
    except Exception as e:
        print(f"Error initializing TTS engine: {str(e)}")
        return None

# Initialize the speech recognizer
def init_speech_recognizer():
    """Initialize the speech recognizer with error handling."""
    try:
        recognizer = sr.Recognizer()
        # Fixed: Added error handling for microphone initialization
        try:
            with sr.Microphone() as source:
                recognizer.adjust_for_ambient_noise(source, duration=1)
        except (OSError, AttributeError) as e:
            print(f"Warning: Could not initialize microphone: {str(e)}")
        return recognizer
    except Exception as e:
        print(f"Error initializing speech recognizer: {str(e)}")
        return None

# Function to validate email address
def is_valid_email(email: str) -> bool:
    """Validate email address format."""
    pattern = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
    return re.match(pattern, email) is not None

# Function to send an email
def send_email(subject: str, body: str, recipient: str) -> bool:
    """
    Send an email with validation and error handling.
    Fixed: Added email validation and better error handling.
    """
    # Fixed: Added email validation
    if not is_valid_email(recipient):
        print(f"Error: Invalid recipient email address: {recipient}")
        return False
    
    if not is_valid_email(email_sender):
        print(f"Error: Invalid sender email address: {email_sender}")
        return False
    
    try:
        context = ssl.create_default_context()
        with smtplib.SMTP_SSL(smtp_server, smtp_port, context=context) as server:
            server.login(email_sender, email_password)
            message = EmailMessage()
            message.set_content(body)
            message['Subject'] = subject
            message['From'] = email_sender
            message['To'] = recipient
            server.send_message(message)
            print("Email sent successfully.")
            return True
    except smtplib.SMTPAuthenticationError:
        print("Error sending email: Authentication failed. Check your email credentials.")
        return False
    except smtplib.SMTPException as e:
        print(f"Error sending email (SMTP error): {str(e)}")
        return False
    except Exception as e:
        print(f"Error sending email: {str(e)}")
        return False

# Function to get OpenAI response with error handling
def get_openai_response(prompt: str, max_tokens: int = 50) -> Optional[str]:
    """
    Get response from OpenAI API with comprehensive error handling.
    Fixed: Added proper error handling and updated API usage.
    """
    if not prompt or not prompt.strip():
        return None
    
    try:
        # Fixed: Updated to use ChatCompletion API (newer API)
        # Note: If using older OpenAI library, this may need to be adjusted
        try:
            # Try new API format first
            response = openai.ChatCompletion.create(
                model="gpt-3.5-turbo",
                messages=[{"role": "user", "content": prompt}],
                max_tokens=max_tokens
            )
            # Fixed: Added check to prevent IndexError
            if response.choices and len(response.choices) > 0:
                return response.choices[0].message.content.strip()
        except AttributeError:
            # Fallback to older API format if ChatCompletion not available
            response = openai.Completion.create(
                engine="text-davinci-003",
                prompt=prompt,
                max_tokens=max_tokens
            )
            # Fixed: Added check to prevent IndexError
            if response.choices and len(response.choices) > 0:
                return response.choices[0].text.strip()
        
        return None
    except Exception as e:
        # Fixed: Handle OpenAI API errors (compatible with both old and new library versions)
        error_msg = str(e).lower()
        if 'authentication' in error_msg or 'api key' in error_msg or 'invalid' in error_msg:
            print("Error: Invalid OpenAI API key. Please check your API key.")
        elif 'rate limit' in error_msg or 'quota' in error_msg:
            print("Error: OpenAI API rate limit exceeded. Please try again later.")
        elif hasattr(openai, 'error'):
            # Try to catch specific OpenAI errors if available
            try:
                if isinstance(e, openai.error.AuthenticationError):
                    print("Error: Invalid OpenAI API key. Please check your API key.")
                elif isinstance(e, openai.error.RateLimitError):
                    print("Error: OpenAI API rate limit exceeded. Please try again later.")
                elif isinstance(e, openai.error.APIError):
                    print(f"Error: OpenAI API error: {str(e)}")
                else:
                    print(f"Error getting OpenAI response: {str(e)}")
            except (AttributeError, TypeError):
                print(f"Error getting OpenAI response: {str(e)}")
        else:
            print(f"Error getting OpenAI response: {str(e)}")
        return None

# Function to extract email details from user input
def extract_email_details(user_input: str) -> Tuple[Optional[str], str, str]:
    """
    Extract recipient, subject, and message from user input.
    Fixed: Added basic extraction logic (can be improved with NLP).
    """
    # Basic extraction - can be enhanced with better NLP
    recipient = None
    subject = "Chatbot Email"
    message = user_input
    
    # Try to find email address in input
    email_pattern = r'\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b'
    emails = re.findall(email_pattern, user_input)
    if emails:
        recipient = emails[0]
    
    # Try to extract subject if mentioned
    if 'subject:' in user_input.lower():
        parts = user_input.lower().split('subject:')
        if len(parts) > 1:
            subject_part = parts[1].split('message:')[0].strip()
            if subject_part:
                subject = subject_part
    
    # Try to extract message if mentioned
    if 'message:' in user_input.lower():
        parts = user_input.lower().split('message:')
        if len(parts) > 1:
            message = parts[1].strip()
    
    return recipient, subject, message

if __name__ == '__main__':
    print('Chatbot')
    engine = init_tts_engine()
    recognizer = init_speech_recognizer()

    # Fixed: Added check for failed initialization
    if engine is None:
        print("Error: Could not initialize TTS engine. Exiting.")
        exit(1)
    
    if recognizer is None:
        print("Error: Could not initialize speech recognizer. Exiting.")
        exit(1)

    print("Hello, I am Chatbot. How can I assist you today?")
    engine.say("Hello, I am Chatbot. How can I assist you today?")
    engine.runAndWait()

    conversation_history = []  # Initialize conversation history
    # Fixed: Store both user inputs and chatbot responses

    voice_command_mode = False  # Initialize voice command mode

    while True:
        if not voice_command_mode:
            user_input_text = input("You (Text): ").strip()
            
            # Fixed: Added validation for empty input
            if not user_input_text:
                print("Please enter a command or message.")
                continue
            
            user_input_text_lower = user_input_text.lower()

            if user_input_text_lower == 'exit' or user_input_text_lower == 'quit':
                # Fixed: Store last message before exiting
                conversation_history.append(f"You (Text): {user_input_text}")
                # Send the conversation history via email
                subject = 'Chatbot Conversation Summary'
                body = '\n'.join(conversation_history) if conversation_history else "No conversation history."
                if send_email(subject, body, email_sender):
                    engine.say("Goodbye! Conversation summary sent via email.")
                    print("Chatbot: Goodbye! Conversation summary sent via email.")
                else:
                    engine.say("Goodbye!")
                    print("Chatbot: Goodbye!")
                engine.runAndWait()
                break

            # Check for other commands or handle user inputs
            if 'voice mode' in user_input_text_lower:
                voice_command_mode = True
                print("Chatbot is now listening for voice commands...")
                engine.say("Chatbot is now listening for voice commands.")
                engine.runAndWait()
                # Fixed: Store command in history
                conversation_history.append(f"You (Text): {user_input_text}")
                continue
            elif 'text mode' in user_input_text_lower:
                # Fixed: Added command to switch back to text mode
                voice_command_mode = False
                print("Chatbot is now in text mode.")
                engine.say("Chatbot is now in text mode.")
                engine.runAndWait()
                conversation_history.append(f"You (Text): {user_input_text}")
                continue
            elif 'send an email' in user_input_text_lower or 'email' in user_input_text_lower:
                # Fixed: Extract recipient, subject, and message from the text input
                recipient, subject, message = extract_email_details(user_input_text)
                
                if recipient is None:
                    recipient = input("Please enter recipient email address: ").strip()
                    if not recipient or not is_valid_email(recipient):
                        print("Error: Invalid email address. Email not sent.")
                        engine.say("Error: Invalid email address. Email not sent.")
                        engine.runAndWait()
                        conversation_history.append(f"You (Text): {user_input_text}")
                        conversation_history.append("Chatbot: Error - Invalid email address.")
                        continue
                
                # Send the email using the extracted information
                if send_email(subject, message, recipient):
                    engine.say("Email sent successfully!")
                    print("Chatbot: Email sent successfully!")
                else:
                    engine.say("Failed to send email. Please check the error message.")
                    print("Chatbot: Failed to send email. Please check the error message above.")
                engine.runAndWait()
                # Fixed: Store conversation in history
                conversation_history.append(f"You (Text): {user_input_text}")
                conversation_history.append(f"Chatbot: Email sent to {recipient}")
            else:
                # Fixed: Use centralized OpenAI response function with error handling
                chatbot_response = get_openai_response(user_input_text, max_tokens=50)
                
                if chatbot_response:
                    print(f"Chatbot: {chatbot_response}")
                    # Speak the chatbot response
                    engine.say(chatbot_response)
                    engine.runAndWait()
                    # Fixed: Store both user input and chatbot response
                    conversation_history.append(f"You (Text): {user_input_text}")
                    conversation_history.append(f"Chatbot: {chatbot_response}")
                else:
                    print("Chatbot: Sorry, I couldn't generate a response. Please try again.")
                    engine.say("Sorry, I couldn't generate a response. Please try again.")
                    engine.runAndWait()
                    conversation_history.append(f"You (Text): {user_input_text}")
                    conversation_history.append("Chatbot: Error - Could not generate response.")

        else:
            print("You can start speaking your command:")

            # Fixed: Added error handling for microphone access
            try:
                with sr.Microphone() as source:
                    print("Listening...")
                    if engine:
                        engine.say("Listening...")
                        engine.runAndWait()
                    recognizer.adjust_for_ambient_noise(source, duration=1)
                    # Fixed: Added timeout to prevent indefinite waiting
                    audio = recognizer.listen(source, timeout=5, phrase_time_limit=10)
            except OSError:
                print("Error: Could not access microphone. Switching back to text mode.")
                voice_command_mode = False
                continue
            except sr.WaitTimeoutError:
                print("You (Voice): (Timeout - no speech detected)")
                voice_command_mode = False
                continue

            try:
                user_input_voice = recognizer.recognize_google(audio, language="en-in")
                print(f"You (Voice): {user_input_voice}")
                
                user_input_voice_lower = user_input_voice.lower()

                # Fixed: Added exit command for voice mode
                if 'exit' in user_input_voice_lower or 'quit' in user_input_voice_lower:
                    conversation_history.append(f"You (Voice): {user_input_voice}")
                    subject = 'Chatbot Conversation Summary'
                    body = '\n'.join(conversation_history) if conversation_history else "No conversation history."
                    if send_email(subject, body, email_sender):
                        engine.say("Goodbye! Conversation summary sent via email.")
                        print("Chatbot: Goodbye! Conversation summary sent via email.")
                    else:
                        engine.say("Goodbye!")
                        print("Chatbot: Goodbye!")
                    engine.runAndWait()
                    break

                # Fixed: Added text mode command for voice mode
                if 'text mode' in user_input_voice_lower:
                    voice_command_mode = False
                    print("Chatbot is now in text mode.")
                    engine.say("Chatbot is now in text mode.")
                    engine.runAndWait()
                    conversation_history.append(f"You (Voice): {user_input_voice}")
                    conversation_history.append("Chatbot: Switched to text mode.")
                    continue

                if 'email' in user_input_voice_lower:
                    # Fixed: Extract recipient, subject, and message from the voice command
                    recipient, subject, message = extract_email_details(user_input_voice)
                    
                    if recipient is None:
                        print("Please enter recipient email address:")
                        recipient = input("Recipient email: ").strip()
                        if not recipient or not is_valid_email(recipient):
                            print("Error: Invalid email address. Email not sent.")
                            engine.say("Error: Invalid email address. Email not sent.")
                            engine.runAndWait()
                            conversation_history.append(f"You (Voice): {user_input_voice}")
                            conversation_history.append("Chatbot: Error - Invalid email address.")
                            voice_command_mode = False
                            continue
                    
                    # Send the email using the extracted information
                    if send_email(subject, message, recipient):
                        engine.say("Email sent successfully!")
                        print("Chatbot: Email sent successfully!")
                        conversation_history.append(f"You (Voice): {user_input_voice}")
                        conversation_history.append(f"Chatbot: Email sent to {recipient}")
                    else:
                        engine.say("Failed to send email. Please check the error message.")
                        print("Chatbot: Failed to send email. Please check the error message above.")
                        conversation_history.append(f"You (Voice): {user_input_voice}")
                        conversation_history.append("Chatbot: Error - Failed to send email.")
                    engine.runAndWait()
                else:
                    # Fixed: Use centralized OpenAI response function with error handling
                    chatbot_response = get_openai_response(user_input_voice, max_tokens=50)
                    
                    if chatbot_response:
                        print(f"Chatbot: {chatbot_response}")
                        # Speak the chatbot response
                        engine.say(chatbot_response)
                        engine.runAndWait()
                        # Fixed: Store both user input and chatbot response
                        conversation_history.append(f"You (Voice): {user_input_voice}")
                        conversation_history.append(f"Chatbot: {chatbot_response}")
                    else:
                        print("Chatbot: Sorry, I couldn't generate a response. Please try again.")
                        engine.say("Sorry, I couldn't generate a response. Please try again.")
                        engine.runAndWait()
                        conversation_history.append(f"You (Voice): {user_input_voice}")
                        conversation_history.append("Chatbot: Error - Could not generate response.")

            except sr.UnknownValueError:
                print("You (Voice): (Could not understand audio)")
                conversation_history.append("You (Voice): (Could not understand audio)")
            except sr.RequestError as e:
                error_msg = f"Sorry, there was an issue connecting to Google's servers: {str(e)}"
                print(f"You (Voice): {error_msg}")
                if engine:
                    engine.say("Sorry, there was an issue connecting to Google's servers.")
                    engine.runAndWait()
                conversation_history.append(f"You (Voice): Error - {error_msg}")
            except Exception as e:
                print(f"Unexpected error in voice recognition: {str(e)}")
                conversation_history.append(f"You (Voice): Error - {str(e)}")

            voice_command_mode = False  # Exit voice command mode after processing the command