from django.core.management.base import BaseCommand
from backend.models import ProjetoLei
from backend.utils import download_pdf, extract_text_from_pdf, generate_summary
import os

class Command(BaseCommand):
    help = 'Testa a geração de resumos para iniciativas sem alterar o banco de dados'

    def handle(self, *args, **kwargs):
        # Pega todas as iniciativas da base de dados (limite de 1 para testes)
        iniciativas = ProjetoLei.objects.all()[:1]

        for iniciativa in iniciativas:
            url_pdf = iniciativa.link  

            if not url_pdf:
                self.stdout.write(f"Projeto {iniciativa.id} não possui URL do PDF.")
                continue

            local_pdf_path = f"/tmp/iniciativa_{iniciativa.id}.pdf"
            self.stdout.write(f"Baixando PDF para: {local_pdf_path}...")

            download_pdf(url_pdf, local_pdf_path)

            self.stdout.write(f"Extraindo texto do PDF para a iniciativa {iniciativa.id}...")
            text = extract_text_from_pdf(local_pdf_path)

            if not text.strip():
                self.stdout.write(f"Erro: Nenhum texto extraído do PDF {local_pdf_path}.")
                continue

            self.stdout.write(f"Gerando resumo para a iniciativa {iniciativa.id}...")
            resumo = generate_summary(text)

            # Exibir o resumo no terminal
            self.stdout.write("\n======================================")
            self.stdout.write(f"Resumo para Projeto {iniciativa.id}:")
            self.stdout.write(resumo)
            self.stdout.write("======================================\n")
