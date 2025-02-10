import os
import pdfplumber
import requests
from transformers import pipeline
from django.core.management.base import BaseCommand
from concurrent.futures import ThreadPoolExecutor

# Initialize Hugging Face summarizer
summarizer = pipeline("summarization", model="facebook/bart-large-cnn")

# Function to extract text from a PDF
def extract_pdf_text(pdf_path):
    with pdfplumber.open(pdf_path) as pdf:
        text = ""
        for page in pdf.pages:
            text += page.extract_text()
    return text

# Function to split text into smaller chunks
def split_text_into_chunks(text, chunk_size=500):
    # Split the text into chunks of size `chunk_size`
    chunks = []
    while len(text) > chunk_size:
        chunk = text[:chunk_size]
        text = text[chunk_size:]
        chunks.append(chunk)
    if text:
        chunks.append(text)
    return chunks

# Function to summarize text using Hugging Face
def summarize_text(text):
    try:
        # Use Hugging Face summarization pipeline
        summary = summarizer(text, max_length=150, min_length=30, do_sample=False)
        return summary[0]['summary_text']
    except Exception as e:
        return f"Error during summarization: {str(e)}"

# Function to update the DRF object with the new description
def update_drf_object(api_url, object_id, new_description):
    data = {"description": new_description}
    response = requests.patch(f"{api_url}/{object_id}/", json=data)
    
    if response.status_code == 200:
        print(f"Object {object_id} updated successfully.")
    else:
        print(f"Failed to update object {object_id}. Status code: {response.status_code}")
        print(response.text)

# Function to download the PDF from a URL
def download_pdf(pdf_url, temp_path='temp_pdf.pdf'):
    response = requests.get(pdf_url)
    if response.status_code == 200:
        with open(temp_path, 'wb') as f:
            f.write(response.content)
        print(f"Downloaded PDF to {temp_path}")
        return temp_path
    else:
        print(f"Failed to download PDF. Status code: {response.status_code}")
        return None

# Function to process chunks concurrently
def process_chunks_concurrently(chunks):
    with ThreadPoolExecutor() as executor:
        results = list(executor.map(summarize_text, chunks))
    return " ".join(results)

class Command(BaseCommand):
    help = 'Process a PDF from a DRF object, summarize it, and update the description field'

    def add_arguments(self, parser):
        parser.add_argument('api_url', type=str, help='The base URL of the DRF API')
        parser.add_argument('object_id', type=int, help='The ID of the object to update')

    def handle(self, *args, **kwargs):
        api_url = kwargs['api_url']
        object_id = kwargs['object_id']
        
        self.stdout.write(self.style.SUCCESS(f'Fetching object {object_id} from the API'))

        # Fetch the object from the DRF API
        response = requests.get(f"{api_url}/{object_id}/")
        
        if response.status_code != 200:
            self.stdout.write(self.style.ERROR(f"Failed to fetch object {object_id}. Status code: {response.status_code}"))
            return

        object_data = response.json()
        pdf_url = object_data.get('link')  # Assuming 'link' contains the PDF URL
        
        if not pdf_url:
            self.stdout.write(self.style.ERROR(f"PDF link not found in object {object_id}."))
            return
        
        # Download the PDF
        temp_pdf_path = download_pdf(pdf_url)
        
        if not temp_pdf_path:
            self.stdout.write(self.style.ERROR(f"Failed to download PDF for object {object_id}."))
            return

        # Extract text from the PDF
        pdf_text = extract_pdf_text(temp_pdf_path)
        
        # Split the text into smaller chunks
        text_chunks = split_text_into_chunks(pdf_text)
        
        # Process the chunks concurrently
        combined_summary = process_chunks_concurrently(text_chunks)
        
        # Update the object in the DRF API
        update_drf_object(api_url, object_id, combined_summary.strip())

        # Clean up the downloaded PDF
        os.remove(temp_pdf_path)

        self.stdout.write(self.style.SUCCESS(f'Updated object {object_id} with the new description'))
