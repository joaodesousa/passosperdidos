import pdfplumber
import requests
import os

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
            page_text = page.extract_text()
            if page_text:  # Evita páginas vazias
                text += page_text + " "  # Adiciona espaço para evitar palavras coladas
    return text.strip()

# Função para interagir com a API do Together.AI
def together_ai_request(prompt):
    TOGETHER_API_URL = "https://api.together.xyz/v1/chat/completions"
    HEADERS = {"Authorization": f"Bearer {os.getenv('TOGETHER_API_KEY')}", "Content-Type": "application/json"}
    payload = {
        "model": "mistralai/Mistral-7B-Instruct-v0.1",
        "messages": [
            {"role": "system", "content": "Você é um assistente que resume textos."},
            {"role": "user", "content": prompt}
        ],
        "max_tokens": 200
    }
    response = requests.post(TOGETHER_API_URL, headers=HEADERS, json=payload)
    if response.status_code == 200:
        return response.json()["choices"][0]["message"]["content"]
    print("Erro na API:", response.status_code, response.text)  # Debugging
    return "Erro ao processar a resposta."

# Função para gerar o resumo usando a API do Together.AI
def generate_summary(text):
    # Limitar o tamanho do texto para evitar erro
    max_input_length = 30000  # Número de caracteres para evitar erro
    truncated_text = text[:max_input_length]

    prompt_summary = f"Explica de forma simples o conteúdo desta proposta para ser de fácil entendimento pelo público: {truncated_text}. Não dês opinião sobre o conteúdo, sumariza apenas o objectivo."
    summary = together_ai_request(prompt_summary)
    
    # Traduzir para Português de Portugal, se necessário
    prompt_translation = f"Traduza o seguinte texto para Português de Portugal: {summary}. Não utilizes Português do Brasil."
    translated_summary = together_ai_request(prompt_translation)
    
    return translated_summary
