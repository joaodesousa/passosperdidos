import requests
from xml.etree import ElementTree
from django.core.management.base import BaseCommand
from backend.models import ProjetoLei, Phase, Author, Attachment, Vote, Legislature
from datetime import datetime


class Command(BaseCommand):
    help = 'Fetches proposals from an XML URL and stores them in the database'

    def handle(self, *args, **kwargs):
        self.stdout.write("Starting import process...")
        
        # URL to the XML data
        XML_URL = 'https://app.parlamento.pt/webutils/docs/doc.xml?path=O4uyzCUsQVk6insAUCFzyFMRmoG4RweIo3K3%2fM3zUpIiHTWMhb2e1gOfRfM7Pmsy8bC%2bYule%2fD254TpnBwazUvp%2fkmmrqqX3mQn2pGX3QZAYGUI1TBjCDI0TJ%2fF5Wyuc8g9BYSg%2fAvLyxNB4pQvYoeuAaS4H176hUyk3qxVPpex71nSoWzpXV3Z6la177FiMTYPFAkmqeLY70LgtuDrgS%2blgzSJSfqvPmntW5ppKEC11WmWGFc%2bSfBaV3zmALmmV%2bDZVFsCXslwqCe0qWIF6fZkdn1w5RKquIcwPxm3x2w9dwNU3FVHaQMegjfegtuAJ7u5fFwnh90kMRX8lbEUScP%2bP76mKNw9E99UlbGYYcOUjU2rh%2b1EqfRXn%2fLz7o3tT&fich=IniciativasXVI.xml&Inline=true'

        # Fetch the XML data
        self.stdout.write("Fetching XML data...")
        response = requests.get(XML_URL)

        if response.status_code != 200:
            self.stdout.write(self.style.ERROR(f"Failed to fetch XML data. Status code: {response.status_code}"))
            return

        # Handle BOM characters by ensuring correct decoding
        xml_data = response.content.decode('utf-8-sig')

        # Parse the XML
        try:
            self.stdout.write("Parsing XML data...")
            root = ElementTree.fromstring(xml_data)
        except ElementTree.ParseError as e:
            self.stdout.write(self.style.ERROR(f"XML parsing error: {str(e)}"))
            return

        # Locate initiatives
        iniciativasArray = root.findall('.//Pt_gov_ar_objectos_iniciativas_DetalhePesquisaIniciativasOut')
        if not iniciativasArray:
            self.stdout.write(self.style.ERROR("Failed to find initiatives in the XML"))
            return

        self.stdout.write(f"Found {len(iniciativasArray)} initiatives to process")

        # Process each proposal
        for index, proposal in enumerate(iniciativasArray, 1):
            self.stdout.write(f"\nProcessing proposal {index} of {len(iniciativasArray)}")
            
            external_id_elem = proposal.find('.//IniId')
            external_id = external_id_elem.text if external_id_elem is not None else 'No ID'
            self.stdout.write(f"Processing proposal ID: {external_id}")

            # Retrieve Legislature information
            leg_number_elem = proposal.find('.//IniLeg')
            leg_number = leg_number_elem.text if leg_number_elem is not None else 'Unknown'
            start_date_elem = proposal.find('.//DataInicioleg')
            start_date = start_date_elem.text if start_date_elem is not None else None
            end_date_elem = proposal.find('.//DataFimleg')
            end_date = end_date_elem.text if end_date_elem is not None else None

            self.stdout.write(f"Found legislature: {leg_number}")
            legislature, created = Legislature.objects.get_or_create(
                number=leg_number,
                defaults={'start_date': start_date, 'end_date': end_date}
            )
            self.stdout.write(f"Legislature {'created' if created else 'retrieved'}")

            # Prepare basic proposal data
            title_elem = proposal.find('.//IniTitulo')
            title = title_elem.text if title_elem is not None else 'No title'
            self.stdout.write(f"Processing proposal: {title}")

            data = {
                'title': title,
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
            self.stdout.write("\nProcessing authors...")
            authors = set()

            # Handle Deputados (legislators)
            deputados = proposal.findall('.//IniAutorDeputados/pt_gov_ar_objectos_iniciativas_AutoresDeputadosOut')
            self.stdout.write(f"Found {len(deputados)} Deputados")

            for author_elem in deputados:
                name_elem = author_elem.find('nome')  # Changed from './/nome'
                party_elem = author_elem.find('GP')   # Changed from './/GP'
                
                if name_elem is None:
                    self.stdout.write(self.style.WARNING("Found Deputado without name element"))
                    continue
                    
                name = name_elem.text.strip() if name_elem.text else 'Unknown'
                party = party_elem.text.strip() if party_elem is not None and party_elem.text else 'Independent'
                
                self.stdout.write(f"Creating Deputado: {name} ({party})")
                try:
                    author_obj, created = Author.objects.get_or_create(
                        name=name,
                        party=party,
                        author_type='Deputado'
                    )
                    self.stdout.write(f"Deputado {'created' if created else 'retrieved'}: {author_obj.id}")
                    authors.add(author_obj)
                except Exception as e:
                    self.stdout.write(self.style.ERROR(f"Error creating Deputado: {str(e)}"))

            # Handle Grupos Parlamentares (party groups)
            grupos = proposal.findall('.//IniAutorGruposParlamentares/pt_gov_ar_objectos_AutoresGruposParlamentaresOut')
            self.stdout.write(f"Found {len(grupos)} Grupos Parlamentares")

            for gp_elem in grupos:
                gp_name_elem = gp_elem.find('GP')  # Changed from './/GP'
                if gp_name_elem is None:
                    self.stdout.write(self.style.WARNING("Found Grupo without GP element"))
                    continue
                    
                name = gp_name_elem.text.strip() if gp_name_elem.text else 'Unknown'
                
                self.stdout.write(f"Creating Grupo: {name}")
                try:
                    author_obj, created = Author.objects.get_or_create(
                        name=name,
                        author_type='Grupo'
                    )
                    self.stdout.write(f"Grupo {'created' if created else 'retrieved'}: {author_obj.id}")
                    authors.add(author_obj)
                except Exception as e:
                    self.stdout.write(self.style.ERROR(f"Error creating Grupo: {str(e)}"))

            # Handle Outros (other entities)
            try:
                outros_elem = proposal.find('.//IniAutorOutros')
                if outros_elem is not None:
                    name_elem = outros_elem.find('nome')
                    sigla_elem = outros_elem.find('sigla')
                    
                    if name_elem is not None:
                        name = name_elem.text.strip() if name_elem.text else 'Unknown'
                        sigla = sigla_elem.text.strip() if sigla_elem is not None and sigla_elem.text else 'Unknown'

                        self.stdout.write(f"Creating Outro: {name} ({sigla})")
                        try:
                            author_obj, created = Author.objects.get_or_create(
                                name=name,
                                party=sigla,
                                author_type='Outro'
                            )
                            self.stdout.write(f"Outro {'created' if created else 'retrieved'}: {author_obj.id}")
                            authors.add(author_obj)
                        except Exception as e:
                            self.stdout.write(self.style.ERROR(f"Error creating Outro: {str(e)}"))
            except Exception as e:
                self.stdout.write(self.style.ERROR(f"Error processing Outros: {str(e)}"))

            # Debug final authors set
            self.stdout.write(f"\nTotal authors found: {len(authors)}")
            for author in authors:
                self.stdout.write(f"Author in set: {author.name} ({author.author_type})")

            # Handle attachments
            self.stdout.write("\nProcessing attachments...")
            attachments = []
            for anexo in proposal.findall('.//IniAnexos/Pt_gov_ar_objectos_iniciativas_AnexosOut'):
                anexo_name_elem = anexo.find('.//anexoNome')
                anexo_url_elem = anexo.find('.//anexoFich')
                anexo_name = anexo_name_elem.text if anexo_name_elem is not None else 'Unnamed'
                anexo_url = anexo_url_elem.text if anexo_url_elem is not None else None
                if anexo_url:
                    try:
                        attachment_obj, created = Attachment.objects.get_or_create(
                            name=anexo_name,
                            file_url=anexo_url
                        )
                        attachments.append(attachment_obj)
                        self.stdout.write(f"Attachment {'created' if created else 'retrieved'}: {anexo_name}")
                    except Exception as e:
                        self.stdout.write(self.style.ERROR(f"Error creating attachment: {str(e)}"))

            # Handle phases
            self.stdout.write("\nProcessing phases...")
            phases = []
            for event in proposal.findall('.//IniEventos/Pt_gov_ar_objectos_iniciativas_EventosOut'):
                phase_name_elem = event.find('Fase')
                phase_date_elem = event.find('DataFase')
                phase_name = phase_name_elem.text if phase_name_elem is not None else 'No phase'
                phase_date = phase_date_elem.text if phase_date_elem is not None else None
                try:
                    phase_obj, created = Phase.objects.get_or_create(
                        name=phase_name,
                        date=phase_date
                    )
                    phases.append(phase_obj)
                    self.stdout.write(f"Phase {'created' if created else 'retrieved'}: {phase_name}")
                except Exception as e:
                    self.stdout.write(self.style.ERROR(f"Error creating phase: {str(e)}"))

            # Handle votes
            self.stdout.write("\nProcessing votes...")
            votes = []
            for vote in proposal.findall('.//Votacao'):
                vote_date_elem = vote.find('data')
                vote_result_elem = vote.find('resultado')
                vote_details_elem = vote.find('detalhe')
                vote_date = vote_date_elem.text if vote_date_elem is not None else None
                vote_result = vote_result_elem.text if vote_result_elem is not None else 'Unknown'
                vote_details = vote_details_elem.text if vote_details_elem is not None else None
                try:
                    vote_obj, created = Vote.objects.get_or_create(
                        date=vote_date,
                        result=vote_result,
                        details=vote_details
                    )
                    votes.append(vote_obj)
                    self.stdout.write(f"Vote {'created' if created else 'retrieved'}: {vote_result}")
                except Exception as e:
                    self.stdout.write(self.style.ERROR(f"Error creating vote: {str(e)}"))

            # Handle related initiatives
            self.stdout.write("\nProcessing related initiatives...")
            related_initiatives = []
            for related in proposal.findall('.//IniciativasConjuntas/Pt_gov_ar_objectos_iniciativas_IniciativasConjuntasOut'):
                related_id_elem = related.find('id')
                related_title_elem = related.find('titulo')
                related_id = related_id_elem.text if related_id_elem is not None else None
                related_title = related_title_elem.text if related_title_elem is not None else 'No Title'
                if related_id:
                    try:
                        related_proposal, created = ProjetoLei.objects.get_or_create(
                            external_id=related_id,
                            defaults={'title': related_title, 'legislature': legislature}
                        )
                        related_initiatives.append(related_proposal)
                        self.stdout.write(f"Related initiative {'created' if created else 'retrieved'}: {related_title}")
                    except Exception as e:
                        self.stdout.write(self.style.ERROR(f"Error creating related initiative: {str(e)}"))

            try:
                # Check if proposal exists
                existing_proposal = ProjetoLei.objects.filter(external_id=external_id).first()

                if existing_proposal:
                    # Update existing proposal
                    self.stdout.write("\nUpdating existing proposal...")
                    for field, value in data.items():
                        setattr(existing_proposal, field, value)
                    existing_proposal.save()

                    # Update relations
                    existing_proposal.authors.set(authors)
                    existing_proposal.attachments.set(attachments)
                    existing_proposal.phases.set(phases)
                    existing_proposal.votes.set(votes)
                    existing_proposal.related_initiatives.set(related_initiatives)
                    
                    self.stdout.write(self.style.SUCCESS(f"Updated proposal: {data['title']}"))
                else:
# Create a new proposal
                    self.stdout.write("\nCreating new proposal...")
                    new_proposal = ProjetoLei.objects.create(**data)

                    # Set relations for new proposal
                    new_proposal.authors.set(authors)
                    new_proposal.attachments.set(attachments)
                    new_proposal.phases.set(phases)
                    new_proposal.votes.set(votes)
                    new_proposal.related_initiatives.set(related_initiatives)
                    
                    self.stdout.write(self.style.SUCCESS(f"Created proposal: {data['title']}"))
            except Exception as e:
                self.stdout.write(self.style.ERROR(f"Error saving proposal: {str(e)}"))

        self.stdout.write(self.style.SUCCESS("\nImport process completed!"))