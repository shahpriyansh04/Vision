from flask import Flask, request, jsonify
from flask_cors import CORS
from viva_tool_final import generate_viva_questions_and_answer, generate_feedback
from dotenv import load_dotenv
from quiz import generate_quiz  # Import the generate_quiz function
# from video_extraction import get_transcription  # Import the get_transcription function
from yt_notes import generate_notes_from_yt_in  # Import the generate_notes_from_yt_in function
from transcripts_from_yt_final import get_transcript_with_timestamps, get_transcript_text  # Import the functions
from keyword_identification_from_video import generate_keywords  # Import the generate_keywords function
import os
import warnings
import tempfile
import requests
import json
from collections import defaultdict
from datetime import datetime

from qna_using_pinecone import store_embeddings, query_pinecone  # Import the functions
warnings.filterwarnings("ignore")

load_dotenv()
viva_chat_history = []  # Global variable to store chat history for viva_tool_final.py
app = Flask(__name__)
CORS(app)
HUGGINGFACE_API_KEY = os.getenv("HUGGINGFACE_API_KEY")
API_URL = "https://api-inference.huggingface.co/models/ehcalabres/wav2vec2-lg-xlsr-en-speech-emotion-recognition"
headers = {"Authorization": f"Bearer {HUGGINGFACE_API_KEY}"}

def query(filename):
    print("starting query")
    with open(filename, "rb") as f:
        data = f.read()
    response = requests.post(API_URL, headers=headers, data=data)
    print("end query")
    return response.json()

@app.route('/')
def home():
    return "Welcome to the Linear Depression Prediction API!"

@app.route('/viva', methods=['POST']) #Route for viva_tool_final.py
def viva():
    try:
        global viva_chat_history
        data = request.get_json()
        topics = data.get("topics", "")

        if not topics:
            return jsonify({"error": "No topics provided"}), 400

        question, answer = generate_viva_questions_and_answer(topics, viva_chat_history)
        return jsonify({"question": question, "answer": answer}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/viva/feedback', methods=['POST']) #Route for viva_tool_final.py
def viva_feedback():
    print("Feedback endpoint called")
    global viva_chat_history
    try:
        data = request.form
        print("Received data:", data)
        question = data.get("question", "")
        answer = data.get("answer", "")
        user_answer = data.get("user_answer", "")

        if not question or not answer or not user_answer:
            print("Missing required fields")
            return jsonify({"error": "Missing required fields"}), 400

        if 'audio_file' not in request.files:
            print("No audio file provided")
            return jsonify({"error": "No audio file provided"}), 400
        audio_file = request.files['audio_file']
        print("Received audio file:", audio_file.filename)

        # Save the audio file locally
        with tempfile.NamedTemporaryFile(delete=False, suffix=".webm") as temp_audio_file:
            audio_file.save(temp_audio_file.name)
            temp_audio_file_path = temp_audio_file.name
        print("Saved audio file to:", temp_audio_file_path)
        
        # Send the filename to the query function
        # sentiment_scores = query(temp_audio_file_path)
        # print("Sentiment scores:", sentiment_scores)
        
        # Remove the locally stored audio file
        os.remove(temp_audio_file_path)
        print("Removed audio file:", temp_audio_file_path)
        
        feedback = generate_feedback(question, answer, user_answer, viva_chat_history)
        print("Feedback generated:", feedback)
        
        return jsonify({"feedback": feedback}), 200
    except Exception as e:
        print("Error:", str(e))
        return jsonify({"error": str(e)}), 500


@app.route('/quiz', methods=['POST']) # New route for generating quiz questions
def quiz():
    try:
        data = request.get_json()
        topic = data.get("topic", "")
        num_questions = data.get("num_questions", 5)

        if not topic:
            return jsonify({"error": "No topic provided"}), 400

        quiz_questions = generate_quiz(topic, num_questions)
        return jsonify({"quiz_questions": quiz_questions}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500
    
# @app.route('/transcribe', methods=['POST'])
# def transcribe():
#     try:
#         data = request.get_json()
#         input_file = data.get("input_file", "")

#         if not input_file:
#             return jsonify({"error": "No input path or URL provided"}), 400

#         transcript = get_transcription(input_file)
        
#         # Clear the transcripts list before adding the new transcript
#         globals.transcripts.clear()
#         globals.transcripts.append(transcript)
        
#         # Write the transcript to globals.py
#         with open('globals.py', 'w') as f:
#             f.write(f"transcripts = {globals.transcripts}\n") #can comment later
        
#         return jsonify({"transcript": transcript}), 200
#     except Exception as e:
#         return jsonify({"error": str(e)}), 500


@app.route('/transcribe_with_timestamps', methods=['POST'])
def transcribe_with_timestamps():
    try:
        data = request.get_json()
        youtube_url = data.get("youtube_url", "")

        if not youtube_url:
            return jsonify({"error": "No YouTube URL provided"}), 400

        transcript_with_timestamps = get_transcript_with_timestamps(youtube_url)
        return jsonify({"transcript_with_timestamps": transcript_with_timestamps}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500
    
    

    
    


@app.route('/transcribe_text', methods=['POST'])
def transcribe_text():
    try:
        data = request.get_json()
        youtube_url = data.get("youtube_url", "")

        if not youtube_url:
            return jsonify({"error": "No YouTube URL provided"}), 400

        transcript_text = get_transcript_text(youtube_url)
        return jsonify({"transcript_text": transcript_text}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

    
@app.route('/yt_notes', methods=['POST']) #Route for yt_notes.py
def yt_notes():
    try:
        data = request.get_json()
        youtube_url = data.get("youtube_url", "")

        if not youtube_url:
            return jsonify({"error": "No YouTube URL provided"}), 400

        notes = generate_notes_from_yt_in(youtube_url)
        return jsonify({"notes": notes}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500
    

@app.route('/generate_keywords', methods=['POST']) # New route for generating keywords
def generate_keywords_route():
    try:
        data = request.get_json()
        youtube_url = data.get("youtube_url", "")

        if not youtube_url:
            return jsonify({"error": "No YouTube URL provided"}), 400

        keywords = generate_keywords(youtube_url)
        return jsonify({"keywords": keywords}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500
    

@app.route('/all', methods=['POST'])
def all():
    try:
        data = request.get_json()
        youtube_url = data.get("youtube_url", "")

        if not youtube_url:
            return jsonify({"error": "No YouTube URL provided"}), 400

        transcript_with_timestamps = get_transcript_with_timestamps(youtube_url)
        notes = generate_notes_from_yt_in(youtube_url)
        keywords = generate_keywords(youtube_url)

        # Store embeddings
        store_embeddings()

        return jsonify({"transcript_with_timestamps": transcript_with_timestamps, "notes": notes, "keywords": keywords}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500
    
@app.route('/query', methods=['POST', 'OPTIONS'])
def query_route():
    if request.method == 'OPTIONS':  # Handle preflight request
        return '', 200

    try:
        data = request.get_json()
        query_text = data.get("query", "")

        if not query_text:
            return jsonify({"error": "No query provided"}), 400

        response = query_pinecone(query_text)
        return jsonify({"response": response}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500
    
def load_data(filepath): 
    data=[]
    with open(filepath, 'r') as file:
        for line in file:
            data.append(json.loads(line))
    return data

def filter_and_group_data(data, keyword):
    filtered_data = [post for post in data if keyword.lower() in post['data']['selftext'].lower() or keyword.lower() in post['data']['title'].lower()]
    grouped_data = defaultdict(int)
    
    for post in filtered_data:
        date = datetime.utcfromtimestamp(post['data']['created_utc']).strftime('%Y-%m-%d')
        grouped_data[date] += 1
    
    return grouped_data

data = load_data('C:/Users/admin/Downloads/data.jsonl')

@app.route('/filter_posts', methods=['GET'])
def filter_posts():
    keyword = request.args.get('keyword')
    if not keyword:
        return jsonify({"error": "Keyword is required"}), 400
    
    grouped_data = filter_and_group_data(data, keyword)
    return jsonify(grouped_data)

if __name__ == '__main__':
    app.run(debug=False, port=5001)