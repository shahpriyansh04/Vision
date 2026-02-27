from dotenv import load_dotenv
from langchain_core.prompts import ChatPromptTemplate
from langchain_groq import ChatGroq
load_dotenv()
import os
GROQ_API_KEY = os.getenv("GROQ_API_KEY")

from youtube_transcript_api import YouTubeTranscriptApi
from transcripts_from_yt_final import get_transcript_text
    
# Example usage
# youtube_video_url = "https://www.youtube.com/watch?v=oW7USk5x4do"
# transcript_text = extract_transcript(youtube_video_url)
# print(transcript_text)

def generate_notes_from_yt_in(transcript_text):
    # transcript_text = get_transcript_text(youtube_url)
    prompt = """
    You are an expert at making notes for exam purposes from YouTube videos. I will provide you with a transcript of a YouTube video, 
    and you need to generate detailed notes based on the content of the video.
    The notes should be structured and cover all the key points discussed in the video.
    Identify which subject the video is about and generate notes accordingly.
    Include-
    - Key concepts and theories discussed in the video.
    - Any formulas, equations, or diagrams that were explained.
    - Definitions of important terms and concepts.
    - Any chemical reactions, equations, or mechanisms discussed.
    - Real-world applications or examples of the concepts.
    - At the last keep definitions or important points with heading summary(very short)
    The notes should be such that help the student prepare for an exam or understand the topic better.
    Make sure that the notes are clear, concise, and well-organized.
    The notes should be in the form of headings,subheadings, bullet points, and paragraphs.
    The notes should be in markdown format strictly.
    """


    llm = ChatGroq(temperature=0, groq_api_key=GROQ_API_KEY, model_name="llama-3.1-8b-instant")

    # Build the full prompt with the transcript text
    actual_prompt = ChatPromptTemplate.from_messages([
        ("system", prompt + transcript_text),
        ("human", "{input}")
    ])

    chain = actual_prompt | llm
    response = chain.invoke({"input": "generate notes from the information provided"})
    
    # Return the notes content
    return response.content

# a = generate_notes_from_yt_in("https://www.youtube.com/watch?v=FMtayizdFiw") 
# print(a)
# generate_notes_from_yt_in("https://www.youtube.com/watch?v=5iTOphGnCtg&t")


