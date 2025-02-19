from django.core.management.base import BaseCommand
from backend.models import ProjetoLei
from backend.utils import download_pdf, extract_text_from_pdf, generate_summary

class Command(BaseCommand):
    help = 'Sumariza todas as iniciativas e atualiza o campo descrição'

    def handle(self, *args, **kwargs):
        # Pega todas as iniciativas da base de dados (pode ajustar a quantidade conforme necessário)
        iniciativas = ProjetoLei.objects.all()[:1]  # Atualizei para pegar todas as iniciativas
        
        total_iniciativas = len(iniciativas)
        self.stdout.write(f"Iniciando o processamento de {total_iniciativas} iniciativas...")
        
        for idx, iniciativa in enumerate(iniciativas, start=1):
            self.stdout.write(f"Processando a iniciativa {idx}/{total_iniciativas} - ID: {iniciativa.id}...")

            # Pega o URL do PDF vinculado à iniciativa
            url_pdf = iniciativa.link  
            
            if not url_pdf:
                self.stdout.write(f"Projeto {iniciativa.id} não possui URL do PDF.")
                continue
            
            # Baixar o PDF para um arquivo temporário
            local_pdf_path = f"/tmp/iniciativa_{iniciativa.id}.pdf"
            self.stdout.write(f"Baixando PDF para: {local_pdf_path}...")
            download_pdf(url_pdf, local_pdf_path)
            
            # Extrair o texto do PDF
            self.stdout.write(f"Extraindo texto do PDF para a iniciativa {iniciativa.id}...")
            text = extract_text_from_pdf(local_pdf_path)
            
            if not text:
                self.stdout.write(f"Falha ao extrair texto do PDF para a iniciativa {iniciativa.id}.")
                continue
            
            # Gerar o resumo a partir do texto extraído
            self.stdout.write(f"Gerando resumo para a iniciativa {iniciativa.id}...")
            resumo = generate_summary(text)
            
            if not resumo:
                self.stdout.write(f"Falha ao gerar resumo para a iniciativa {iniciativa.id}.")
                continue
            
            # Atualizar o campo 'descricao' com o resumo gerado
            iniciativa.description = resumo
            iniciativa.save()
            
            self.stdout.write(f"Projeto {iniciativa.id} atualizado com sucesso.")
        
        self.stdout.write("Processamento concluído!")
