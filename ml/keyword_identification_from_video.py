from dotenv import load_dotenv
from langchain_core.prompts import ChatPromptTemplate
from langchain_groq import ChatGroq
import os
from transcripts_from_yt_final import get_transcript_text

load_dotenv()
GROQ_API_KEY = os.getenv("GROQ_API_KEY")



def generate_keywords(transcript_text):
    # transcript_text = get_transcript_text(youtube_url)
    prompt = """
    You are an expert at identifying key concepts from the transcripts i have provided you of the video.
    Give me only 3 key concepts from the entire transcript that you think are important to study more about.
    I will use those 3 concepts to generate questions for a quiz, and study more about them.
    Give only 3 key concepts, and keep it strictly comma separated.
    Keep the output in this format-
    atomic structure, periodic table, chemical bonding
    or
    Diffusion, osmosis, active transport
    or
    Photosynthesis, cellular respiration, fermentation
    
    """

    llm = ChatGroq(temperature=0.2, groq_api_key=GROQ_API_KEY, model_name="llama-3.1-8b-instant")

    # Build the full prompt with the transcript text
    actual_prompt = ChatPromptTemplate.from_messages([
        ("system", prompt + transcript_text),
        ("human", "{input}")
    ])

    chain = actual_prompt | llm
    response = chain.invoke({"input": "generate 3 key concepts as comma separated from the information provided. Dont give anthing else"})
    
    # Return the keywords content
    return response.content

# if __name__ == "__main__":
#     youtube_url = "https://www.youtube.com/watch?v=FMtayizdFiw"
#     keywords = generate_keywords(youtube_url)
#     print(keywords)