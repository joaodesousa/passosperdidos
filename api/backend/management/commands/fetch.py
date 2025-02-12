import json
import requests
from django.core.management.base import BaseCommand
from backend.models import Legislature, ProjetoLei, Phase, Attachment, Author, Vote  # Update 'myapp' with your actual app name

DATA_URL = "https://app.parlamento.pt/webutils/docs/doc.txt?path=HLkKvn6LvI%2bvNVEbW%2bZzCU4sMZI9PTzjtCsdZLRri%2bqzgb2kVZs2vSHew1uump5fsxSjBaKb%2b95nRH9HUODO%2bY6zp2cz6FegcjPtVVZ3SfKMxE7RKVRCBudyEl9iipB7aW%2fhqYy0WyfdcLTwlvVQ1aBrT7zPK8s4qCfHWoggAuxUiuayxIccls8xaU%2bpfB5qe2K6gQ3hOIr%2bjzJHXS9yHrdWyNs5HuAtkrYtPP6duhD3k2r%2bZtzbh6yJp3BWye3h5DlJwdQ%2bxU%2fexIbWtqneuwAVaGpgIIIcndrtHM1kFUOSdpH2WVFJqy4snRmaCv9VuKT8I8TedxDga3ZFnNB%2bXLp5snlBC65LAazteT7CnCswbL4ajrg4Guml4W47KFyd&fich=IniciativasXVI_json.txt&Inline=true"

class Command(BaseCommand):
    help = "Fetch and store legislation data from a remote JSON source"

    def handle(self, *args, **kwargs):
        response = requests.get(DATA_URL)
        if response.status_code != 200:
            self.stderr.write(self.style.ERROR("Failed to fetch data"))
            return
        
        data = response.json()  # Parse JSON

        for item in data:
            # Legislature
            legislature, _ = Legislature.objects.get_or_create(
                number=item["IniLeg"],
                defaults={"start_date": item.get("DataInicioleg"), "end_date": item.get("DataFimleg")}
            )

            # Check if ProjetoLei exists
            projeto_lei = ProjetoLei.objects.filter(external_id=item["IniId"]).first()
            if not projeto_lei:
                projeto_lei = ProjetoLei(
                    external_id=item["IniId"],
                    title=item["IniTitulo"],
                    type=item["IniDescTipo"],
                    legislature=legislature,
                    date=item.get("DataInicioleg"),
                    link=item["IniLinkTexto"],
                    description=None,  # No direct mapping for description
                )
            else:
                # Only update fields if they are missing or different
                fields_to_update = {}
                if not projeto_lei.title or projeto_lei.title != item["IniTitulo"]:
                    fields_to_update["title"] = item["IniTitulo"]
                if not projeto_lei.type or projeto_lei.type != item["IniDescTipo"]:
                    fields_to_update["type"] = item["IniDescTipo"]
                if not projeto_lei.date and item.get("DataInicioleg"):
                    fields_to_update["date"] = item.get("DataInicioleg")
                if not projeto_lei.link or projeto_lei.link != item["IniLinkTexto"]:
                    fields_to_update["link"] = item["IniLinkTexto"]
                
                for field, value in fields_to_update.items():
                    setattr(projeto_lei, field, value)

            projeto_lei.save()

            # Attachments
            for anexo in item.get("IniAnexos", []):
                attachment_name = anexo["anexoNome"][:200] if anexo.get("anexoNome") else "Unknown"
                attachment, _ = Attachment.objects.get_or_create(
                    file_url=anexo["anexoFich"],
                    defaults={"name": attachment_name}, 
                )
                projeto_lei.attachments.add(attachment)

            # Authors - Deputados
            for deputado in item.get("IniAutorDeputados", []):
                author, _ = Author.objects.get_or_create(
                    name=deputado["nome"],
                    defaults={"party": deputado["GP"], "author_type": "Deputado"},
                )
                projeto_lei.authors.add(author)

            # Authors - Grupos Parlamentares
            for grupo in item.get("IniAutorGruposParlamentares", []):
                author, _ = Author.objects.get_or_create(
                    name=f"Grupo Parlamentar {grupo['GP']}",
                    defaults={"party": grupo["GP"], "author_type": "Grupo"},
                )
                projeto_lei.authors.add(author)

            # Authors - Outros
            if item.get("IniAutorOutros"):
                author, _ = Author.objects.get_or_create(
                    name=item["IniAutorOutros"]["nome"],
                    defaults={"party": item["IniAutorOutros"].get("sigla"), "author_type": "Outro"},
                )
                projeto_lei.authors.add(author)

            # Phases
            for evento in item.get("IniEventos", []):
                phase, _ = Phase.objects.get_or_create(
                    name=evento["Fase"], date=evento.get("DataFase")
                )
                projeto_lei.phases.add(phase)

            # Votes
            for evento in item.get("IniEventos", []):
                for votacao in evento.get("Votacao", []):
                    vote, _ = Vote.objects.get_or_create(
                        date=votacao["data"],
                        defaults={"result": votacao["resultado"], "details": votacao.get("detalhe")},
                    )
                    projeto_lei.votes.add(vote)

            projeto_lei.save()
            self.stdout.write(self.style.SUCCESS(f'Successfully processed {projeto_lei.title}'))

        self.stdout.write(self.style.SUCCESS("Data import complete!"))
