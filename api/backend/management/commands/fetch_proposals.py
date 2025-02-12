import requests
from xml.etree import ElementTree
from django.core.management.base import BaseCommand
from backend.models import ProjetoLei, Phase, Author, Attachment, Vote, Legislature  # Ensure correct import path
from datetime import datetime


class Command(BaseCommand):
    help = 'Fetches proposals from an XML URL and stores them in the database'

    def handle(self, *args, **kwargs):
        # URL to the XML data
        XML_URL = 'https://app.parlamento.pt/webutils/docs/doc.xml?path=O4uyzCUsQVk6insAUCFzyFMRmoG4RweIo3K3%2fM3zUpIiHTWMhb2e1gOfRfM7Pmsy8bC%2bYule%2fD254TpnBwazUvp%2fkmmrqqX3mQn2pGX3QZAYGUI1TBjCDI0TJ%2fF5Wyuc8g9BYSg%2fAvLyxNB4pQvYoeuAaS4H176hUyk3qxVPpex71nSoWzpXV3Z6la177FiMTYPFAkmqeLY70LgtuDrgS%2blgzSJSfqvPmntW5ppKEC11WmWGFc%2bSfBaV3zmALmmV%2bDZVFsCXslwqCe0qWIF6fZkdn1w5RKquIcwPxm3x2w9dwNU3FVHaQMegjfegtuAJ7u5fFwnh90kMRX8lbEUScP%2bP76mKNw9E99UlbGYYcOUjU2rh%2b1EqfRXn%2fLz7o3tT&fich=IniciativasXVI.xml&Inline=true'

        # Fetch the XML data
        response = requests.get(XML_URL)

        if response.status_code != 200:
            self.stdout.write(self.style.ERROR(f"Failed to fetch XML data. Status code: {response.status_code}"))
            return

        # Handle BOM characters by ensuring correct decoding
        xml_data = response.content.decode('utf-8-sig')

        # Parse the XML
        try:
            root = ElementTree.fromstring(xml_data)
        except ElementTree.ParseError as e:
            self.stdout.write(self.style.ERROR(f"XML parsing error: {str(e)}"))
            return

        # Locate initiatives
        iniciativasArray = root.findall('.//Pt_gov_ar_objectos_iniciativas_DetalhePesquisaIniciativasOut')
        if not iniciativasArray:
            self.stdout.write(self.style.ERROR("Failed to find initiatives in the XML"))
            return

        # Process each proposal
        for proposal in iniciativasArray:
            external_id_elem = proposal.find('.//IniId')
            external_id = external_id_elem.text if external_id_elem is not None else 'No ID'

            # Retrieve Legislature information
            leg_number_elem = proposal.find('.//IniLeg')
            leg_number = leg_number_elem.text if leg_number_elem is not None else 'Unknown'
            start_date_elem = proposal.find('.//DataInicioleg')
            start_date = start_date_elem.text if start_date_elem is not None else None
            end_date_elem = proposal.find('.//DataFimleg')
            end_date = end_date_elem.text if end_date_elem is not None else None

            legislature, _ = Legislature.objects.get_or_create(
                number=leg_number, defaults={'start_date': start_date, 'end_date': end_date}
            )

            data = {
                'title': proposal.find('.//IniTitulo').text if proposal.find('.//IniTitulo') is not None else 'No title',
                'type': proposal.find('.//IniDescTipo').text if proposal.find('.//IniDescTipo') is not None else 'No type',
                'legislature': legislature,
                'date': proposal.find('.//IniEventos/Pt_gov_ar_objectos_iniciativas_EventosOut/DataFase').text if proposal.find('.//IniEventos/Pt_gov_ar_objectos_iniciativas_EventosOut/DataFase') is not None else None,
                'link': proposal.find('.//IniLinkTexto').text if proposal.find('.//IniLinkTexto') is not None else 'No link',
                'description': proposal.find('.//IniDescricao').text if proposal.find('.//IniDescricao') is not None else 'No description available.',
                'external_id': external_id,
                'publication_url': proposal.find('.//PublicacaoFase/URLDiario').text if proposal.find('.//PublicacaoFase/URLDiario') is not None else None,
                'publication_date': proposal.find('.//PublicacaoFase/pubdt').text if proposal.find('.//PublicacaoFase/pubdt') is not None else None,
            }

            # Handle authors
            authors = []
            # Handle Deputados (legislators)
            for author_elem in proposal.findall('.//IniAutorDeputados/Pt_gov_ar_objectos_iniciativas_AutorDeputadosOut'):
                name_elem = author_elem.find('.//nome')
                name = name_elem.text if name_elem is not None else 'Unknown'
                party_elem = author_elem.find('.//GP')
                party = party_elem.text if party_elem is not None else 'Independent'
                author_obj, _ = Author.objects.get_or_create(name=name, party=party, author_type='Deputado')
                authors.append(author_obj)

            # Handle Grupos Parlamentares (party groups)
            for gp_elem in proposal.findall('.//IniAutorGruposParlamentares/Pt_gov_ar_objectos_iniciativas_AutorGruposParlamentaresOut'):
                gp_name_elem = gp_elem.find('.//GP')
                name = gp_name_elem.text if gp_name_elem is not None else 'Unknown'
                author_obj, _ = Author.objects.get_or_create(name=name, author_type='Grupo')
                authors.append(author_obj)

            # Handle Outros (other entities)
            autor_outros = proposal.find('.//IniAutorOutros')
            if autor_outros is not None:
                name_elem = autor_outros.find('.//nome')
                name = name_elem.text if name_elem is not None else 'Unknown'
                sigla_elem = autor_outros.find('.//sigla')
                sigla = sigla_elem.text if sigla_elem is not None else 'Unknown'
                author_obj, _ = Author.objects.get_or_create(name=name, party=sigla, author_type='Outro')
                authors.append(author_obj)

            # Handle attachments
            attachments = []
            for anexo in proposal.findall('.//IniAnexos/Pt_gov_ar_objectos_iniciativas_AnexosOut'):
                anexo_name_elem = anexo.find('.//anexoNome')
                anexo_name = anexo_name_elem.text if anexo_name_elem is not None else 'Unnamed'
                anexo_url_elem = anexo.find('.//anexoFich')
                anexo_url = anexo_url_elem.text if anexo_url_elem is not None else None
                if anexo_url:
                    attachment_obj, _ = Attachment.objects.get_or_create(name=anexo_name, file_url=anexo_url)
                    attachments.append(attachment_obj)

            # Handle phases
            phases = []
            for event in proposal.findall('.//IniEventos/Pt_gov_ar_objectos_iniciativas_EventosOut'):
                phase_name_elem = event.find('Fase')
                phase_name = phase_name_elem.text if phase_name_elem is not None else 'No phase'
                phase_date_elem = event.find('DataFase')
                phase_date = phase_date_elem.text if phase_date_elem is not None else None
                phase_obj, _ = Phase.objects.get_or_create(name=phase_name, date=phase_date)
                phases.append(phase_obj)

            # Handle votes
            votes = []
            for vote in proposal.findall('.//Votacao'):
                vote_date_elem = vote.find('data')
                vote_date = vote_date_elem.text if vote_date_elem is not None else None
                vote_result_elem = vote.find('resultado')
                vote_result = vote_result_elem.text if vote_result_elem is not None else 'Unknown'
                vote_details_elem = vote.find('detalhe')
                vote_details = vote_details_elem.text if vote_details_elem is not None else None
                vote_obj, _ = Vote.objects.get_or_create(date=vote_date, result=vote_result, details=vote_details)
                votes.append(vote_obj)

            # Handle related initiatives
            related_initiatives = []
            for related in proposal.findall('.//IniciativasConjuntas/Pt_gov_ar_objectos_iniciativas_IniciativasConjuntasOut'):
                related_id_elem = related.find('id')
                related_id = related_id_elem.text if related_id_elem is not None else None
                related_title_elem = related.find('titulo')
                related_title = related_title_elem.text if related_title_elem is not None else 'No Title'
                if related_id:
                    related_proposal, _ = ProjetoLei.objects.get_or_create(external_id=related_id, defaults={'title': related_title, 'legislature': legislature})
                    related_initiatives.append(related_proposal)

            # Check if proposal exists
            existing_proposal = ProjetoLei.objects.filter(external_id=external_id).first()

            if existing_proposal:
                # Update existing proposal
                for field, value in data.items():
                    setattr(existing_proposal, field, value)
                existing_proposal.save()

                # Add missing authors
                for author_obj in authors:
                    if author_obj not in existing_proposal.authors.all():
                        existing_proposal.authors.add(author_obj)

                # Set relations for existing proposal
                existing_proposal.attachments.set(attachments)
                existing_proposal.phases.set(phases)
                existing_proposal.votes.set(votes)
                existing_proposal.related_initiatives.set(related_initiatives)
                self.stdout.write(self.style.SUCCESS(f"Updated proposal: {data['title']}"))
            else:
                # Create a new proposal
                new_proposal = ProjetoLei.objects.create(**data)

                # Add authors to the new proposal
                new_proposal.authors.set(authors)

                # Set relations for new proposal
                new_proposal.attachments.set(attachments)
                new_proposal.phases.set(phases)
                new_proposal.votes.set(votes)
                new_proposal.related_initiatives.set(related_initiatives)
                self.stdout.write(self.style.SUCCESS(f"Created proposal: {data['title']}"))
