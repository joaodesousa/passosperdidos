import requests
from xml.etree import ElementTree
from django.core.management.base import BaseCommand
from backend.models import ProjetoLei, Phase  # Replace with your actual model import path

class Command(BaseCommand):
    help = 'Fetches proposals from an XML URL and stores them in the database'

    def handle(self, *args, **kwargs):
        # URL to the XML data
        XML_URL = 'https://app.parlamento.pt/webutils/docs/doc.xml?path=O4uyzCUsQVk6insAUCFzyFMRmoG4RweIo3K3%2fM3zUpIiHTWMhb2e1gOfRfM7Pmsy8bC%2bYule%2fD254TpnBwazUvp%2fkmmrqqX3mQn2pGX3QZAYGUI1TBjCDI0TJ%2fF5Wyuc8g9BYSg%2fAvLyxNB4pQvYoeuAaS4H176hUyk3qxVPpex71nSoWzpXV3Z6la177FiMTYPFAkmqeLY70LgtuDrgS%2blgzSJSfqvPmntW5ppKEC11WmWGFc%2bSfBaV3zmALmmV%2bDZVFsCXslwqCe0qWIF6fZkdn1w5RKquIcwPxm3x2w9dwNU3FVHaQMegjfegtuAJ7u5fFwnh90kMRX8lbEUScP%2bP76mKNw9E99UlbGYYcOUjU2rh%2b1EqfRXn%2fLz7o3tT&fich=IniciativasXVI.xml&Inline=true'

        # Fetch the XML data
        response = requests.get(XML_URL)

        # Check if the request was successful
        if response.status_code != 200:
            self.stdout.write(self.style.ERROR(f"Failed to fetch XML data. Status code: {response.status_code}"))
            return

        # Handle BOM characters by ensuring the content is correctly decoded
        xml_data = response.content.decode('utf-8-sig')

        # Try to parse the XML
        try:
            root = ElementTree.fromstring(xml_data)
        except ElementTree.ParseError as e:
            self.stdout.write(self.style.ERROR(f"XML parsing error: {str(e)}"))
            return

        # Print XML structure for debugging (optional)
        self.stdout.write(self.style.SUCCESS(f"XML Structure (partial): {ElementTree.tostring(root, encoding='unicode', method='xml')[:500]}"))

        # Adjust XPath to match the structure
        iniciativasArray = root.findall('.//Pt_gov_ar_objectos_iniciativas_DetalhePesquisaIniciativasOut')
        if not iniciativasArray:
            self.stdout.write(self.style.ERROR("Failed to find 'Pt_gov_ar_objectos_iniciativas_DetalhePesquisaIniciativasOut' in the XML"))
            return

        # Filter for proposals from the XVI legislature
        propostas_de_lei = [item for item in iniciativasArray if item.find('.//IniLeg') is not None and item.find('.//IniLeg').text == 'XVI']

        # Process each proposal
        for proposal in propostas_de_lei:
            # Extract the necessary fields from the XML
            data = {
                'title': proposal.find('.//IniTitulo').text if proposal.find('.//IniTitulo') is not None else 'No title',
                'type': proposal.find('.//IniDescTipo').text if proposal.find('.//IniDescTipo') is not None else 'No type',
                'legislature': proposal.find('.//IniLeg').text if proposal.find('.//IniLeg') is not None else 'Unknown',
                'date': proposal.find('.//IniEventos/Pt_gov_ar_objectos_iniciativas_EventosOut/DataFase').text if proposal.find('.//IniEventos/Pt_gov_ar_objectos_iniciativas_EventosOut/DataFase') is not None else 'No date',
                'link': proposal.find('.//IniLinkTexto').text if proposal.find('.//IniLinkTexto') is not None else 'No link',
                'description': proposal.find('.//IniDescricao').text if proposal.find('.//IniDescricao') is not None else 'No description available.',
                'external_id': proposal.find('.//IniId').text if proposal.find('.//IniId') is not None else 'No ID',
            }

            # Handle the author
            author = 'Unknown'
            # Check if IniAutorGruposParlamentares exists and is not null
            autor_grupos_parlamentares = proposal.find('.//IniAutorGruposParlamentares')
            if autor_grupos_parlamentares is not None:
                # Extract GP information, assuming it's a list
                author_list = [gp.text for gp in autor_grupos_parlamentares.findall('.//GP') if gp.text]
                if author_list:
                    author = ', '.join(author_list)
            else:
                # Fallback to IniAutorOutros if no GP info
                autor_outros = proposal.find('.//IniAutorOutros')
                if autor_outros is not None:
                    nome = autor_outros.find('.//nome').text if autor_outros.find('.//nome') is not None else 'Unknown'
                    sigla = autor_outros.find('.//sigla').text if autor_outros.find('.//sigla') is not None else 'Unknown'
                    author = f"{nome} ({sigla})"

            # Handle phases
            phases = []
            for event in proposal.findall('.//IniEventos/Pt_gov_ar_objectos_iniciativas_EventosOut'):
                fase = event.find('Fase').text if event.find('Fase') is not None else 'No phase'
                data_fase = event.find('DataFase').text if event.find('DataFase') is not None else None
                phase_instance = Phase.objects.create(name=fase, date=data_fase)
                phases.append(phase_instance)

            # Add the extracted author info to the data dictionary
            data['author'] = author

            # Check if the proposal already exists based on external_id
            existing_proposal = ProjetoLei.objects.filter(external_id=data['external_id']).first()

            if existing_proposal:
                # Update the existing proposal
                for field, value in data.items():
                    setattr(existing_proposal, field, value)
                existing_proposal.save()
                existing_proposal.phases.set(phases)  # Update phases
                self.stdout.write(self.style.SUCCESS(f"Updated proposal: {data['title']}"))
            else:
                # Create a new proposal
                new_proposal = ProjetoLei.objects.create(**data)
                new_proposal.phases.set(phases)  # Associate phases
                self.stdout.write(self.style.SUCCESS(f"Created proposal: {data['title']}"))
