import pdfplumber
import requests
import os
import time

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

# Função para interagir com a API do DeepSeek

def deepseek_ai_request(prompt, max_retries=5):
    DEEPSEEK_API_URL = "https://api.together.xyz/v1/chat/completions"
    HEADERS = {
        "Authorization": f"Bearer {os.getenv('TOGETHER_API_KEY')}",
        "Content-Type": "application/json"
    }
    payload = {
        "model": "deepseek-ai/DeepSeek-R1-Distill-Llama-70B-free",
        "messages": [
            {"role": "system", "content": "Você é um assistente que resume textos. Forneça apenas o resumo, sem pensamentos adicionais."},
            {"role": "user", "content": prompt}
        ],
        "max_tokens": 1000
    }

    retries = 0
    while retries < max_retries:
        response = requests.post(DEEPSEEK_API_URL, headers=HEADERS, json=payload)
        if response.status_code == 200:
            summary = response.json()["choices"][0]["message"]["content"]
            if "</think>" in summary:
                return summary.split("</think>")[-1].strip()
            return summary.strip()

        elif response.status_code == 429:  # Rate limit hit
            retry_after = int(response.headers.get("Retry-After", 5))  # Default wait time if not provided
            print(f"Rate limit reached. Retrying after {retry_after} seconds...")
            time.sleep(retry_after)
            retries += 1
        else:
            print("Erro na API:", response.status_code, response.text)
            break  # Stop on other errors

    return "Erro ao processar a resposta após várias tentativas."

# Função para gerar o resumo usando a API do DeepSeek
def generate_summary(text):
    # Limitar o tamanho do texto para evitar erro
    max_input_length = 1000  # Número de caracteres para evitar erro
    truncated_text = text[:max_input_length]

    prompt_summary = f"Resume de forma simples o conteúdo desta proposta: {truncated_text}. Não dês opinião sobre o conteúdo, resume apenas. Utiliza um tom imparcial, claro, e sucinto."
    summary = deepseek_ai_request(prompt_summary)

    return summary
