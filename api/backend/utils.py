import pdfplumber
from transformers import pipeline
import requests

# Função para baixar o PDF
def download_pdf(url, local_path):
    response = requests.get(url)
    with open(local_path, 'wb') as file:
        file.write(response.content)

# Função para extrair o texto do PDF
def extract_text_from_pdf(pdf_path):
    with pdfplumber.open(pdf_path) as pdf:
        text = ""
        for page in pdf.pages:
            text += page.extract_text()
    return text

# Função para gerar o resumo usando BART
def generate_summary(text):
    summarizer = pipeline("summarization", model="facebook/bart-large-cnn")
    summary = summarizer(text, max_length=300, min_length=100, do_sample=False)
    return summary[0]['summary_text']
