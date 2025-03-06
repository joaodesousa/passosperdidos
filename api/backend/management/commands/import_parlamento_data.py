import json
import logging
import requests
import traceback
from datetime import datetime
from django.core.management.base import BaseCommand
from django.db import transaction
from django.db.utils import IntegrityError, DataError
from ...models import (
    ProjetoLei, Legislature, Phase, Attachment, Author, Vote, 
    Publication, Commission, CommissionDocument, Rapporteur, 
    Opinion, OpinionRequest, Hearing, Audience, CommissionVote, 
    FinalDraftSubmission, Forwarding, Debate, VideoLink, 
    DeputyDebate, GovernmentMemberDebate, GuestDebate, 
    ApprovedText, DeputyAppeal, PartyAppeal, RelatedInitiative
)

# Set up logging
logger = logging.getLogger(__name__)
handler = logging.StreamHandler()
formatter = logging.Formatter('%(asctime)s - %(name)s - %(levelname)s - %(message)s')
handler.setFormatter(formatter)
logger.addHandler(handler)
logger.setLevel(logging.INFO)

# Maximum text lengths
MAX_TEXT_LENGTH = 5000
MAX_URL_LENGTH = 2000
MAX_NAME_LENGTH = 250
MAX_TITLE_LENGTH = 1000

class Command(BaseCommand):
    help = 'Import initiatives from Parlamento API'

    def add_arguments(self, parser):
        parser.add_argument(
            '--url',
            default="https://app.parlamento.pt/webutils/docs/doc.txt?path=IK8XlcmBKOX6xnhcFVPCXpEICixqGUkFgz9%2btevXoUXGDowQjN5BeHhk9MjVfm7DjoLOsgOeGnXDVQSIaSFWjDPiRf3pRiZYdOHYXUyHa5%2fQRXFH7yER5Vx18ur979A%2fK%2bVKw3fho5768TcQ4dcEtJ7iNutgbqLMzcMlbhoCYdMQqbBnOKSb1hWu0fib060aqVlyJqNX%2bEZNYIpVUSNUanqo8nst1Xavx9nOhX7OED%2bPb%2fCZKluzXtrNRFVaWyApKbKC8Qj%2bgdPKD9WbFDz9fpuyXXqKcjNT6dzt5a0h35Y%2bOtcEYG99OCCiHS%2fsnGf%2b%2bKemDRoC7MAO8HSN09Vp83Ed5ehNtDIauO1nGYPbdYs%3d&fich=IniciativasXVI_json.txt&Inline=true",
            help='URL to fetch initiatives from'
        )
        parser.add_argument(
            '--limit',
            type=int,
            default=None,
            help='Limit the number of items to process (for testing)'
        )
        parser.add_argument(
            '--file',
            default=None,
            help='Path to local JSON file instead of URL'
        )
        parser.add_argument(
            '--skip_phases',
            action='store_true',
            help='Skip processing phases (faster import, but less data)'
        )
        parser.add_argument(
            '--skip_to',
            default=None,
            help='Skip to a specific initiative ID'
        )

    def handle(self, *args, **options):
        url = options['url']
        limit = options['limit']
        file_path = options['file']
        skip_phases = options['skip_phases']
        skip_to = options['skip_to']
        
        if file_path:
            logger.info(f"Loading data from local file: {file_path}")
            with open(file_path, 'r', encoding='utf-8') as f:
                data = json.load(f)
        else:
            logger.info(f"Fetching data from URL: {url}")
            response = requests.get(url)
            response.raise_for_status()
            data = response.json()
        
        logger.info(f"Fetched {len(data)} initiatives")
        
        if limit:
            logger.info(f"Limiting to {limit} initiatives")
            data = data[:limit]
        
        if skip_to:
            logger.info(f"Skipping to initiative ID: {skip_to}")
            start_index = 0
            for i, item in enumerate(data):
                if item.get('IniId') == skip_to:
                    start_index = i
                    break
            data = data[start_index:]
            logger.info(f"Starting from index {start_index}, {len(data)} initiatives remaining")
        
        self.import_initiatives(data, skip_phases)
        
    def import_initiatives(self, data, skip_phases=False):
        """Import all initiatives from the data"""
        successfully_imported = 0
        errors = 0
        
        for initiative_data in data:
            ini_id = initiative_data.get('IniId', 'unknown')
            
            try:
                with transaction.atomic():
                    self.import_single_initiative(initiative_data, skip_phases)
                successfully_imported += 1
                if successfully_imported % 10 == 0:
                    logger.info(f"Successfully imported {successfully_imported} initiatives so far")
            except Exception as e:
                errors += 1
                logger.error(f"Error importing initiative {ini_id}: {str(e)}")
                logger.error(traceback.format_exc())
                
        logger.info(f"Import completed. Successfully imported: {successfully_imported}. Errors: {errors}")
    
    def import_single_initiative(self, data, skip_phases=False):
        """Import a single initiative and its related data"""
        # Get or create legislature
        legislature_number = data.get('IniLeg')
        
        legislature, _ = Legislature.objects.get_or_create(
            number=legislature_number,
        )
        
        # Check if projeto already exists before creating a new one
        existing_projeto = None
        try:
            existing_projeto = ProjetoLei.objects.get(external_id=data.get('IniId', ''))
            # Update fields that might have changed
            existing_projeto.title = self.truncate_text(data.get('IniTitulo', ''), MAX_TEXT_LENGTH)
            existing_projeto.type = self.truncate_text(data.get('IniDescTipo', ''), MAX_NAME_LENGTH)
            existing_projeto.legislature = legislature
            existing_projeto.date = self.parse_date(data.get('DataInicioleg'))
            existing_projeto.link = self.truncate_text(data.get('IniLinkTexto', ''), MAX_URL_LENGTH)
            existing_projeto.observation = data.get('IniObs')
            existing_projeto.epigraph = data.get('IniEpigrafe')
            existing_projeto.text_link = self.truncate_text(data.get('IniLinkTexto', ''), MAX_URL_LENGTH)
            existing_projeto.save()
            projeto_lei = existing_projeto
            
            # Clear existing relationships to rebuild them
            projeto_lei.authors.clear()
            if not skip_phases:
                projeto_lei.phases.clear()
            
        except ProjetoLei.DoesNotExist:
            # Create the main ProjetoLei record
            projeto_lei = ProjetoLei(
                title=self.truncate_text(data.get('IniTitulo', ''), MAX_TEXT_LENGTH),
                type=self.truncate_text(data.get('IniDescTipo', ''), MAX_NAME_LENGTH),
                legislature=legislature,
                date=self.parse_date(data.get('DataInicioleg')),
                link=self.truncate_text(data.get('IniLinkTexto', ''), MAX_URL_LENGTH),
                external_id=data.get('IniId', ''),
                initiative_id=data.get('IniId'),
                initiative_legislature=data.get('IniLeg'),
                initiative_number=data.get('IniNr'),
                initiative_type_code=data.get('IniTipo'),
                initiative_selection=data.get('IniSel'),
                substitute_text=data.get('IniTextoSubst'),
                substitute_text_field=data.get('IniTextoSubstCampo'),
                observation=data.get('IniObs'),
                epigraph=data.get('IniEpigrafe'),
                text_link=self.truncate_text(data.get('IniLinkTexto', ''), MAX_URL_LENGTH)
            )
            projeto_lei.save()
        
        # Process authors
        self.process_authors(data, projeto_lei)
        
        # Process phases
        if not skip_phases:
            self.process_phases(data, projeto_lei)
    
    def process_authors(self, data, projeto_lei):
        """Process author data and link to ProjetoLei"""
        # Process deputy authors
        if data.get('IniAutorDeputados'):
            for deputy in data.get('IniAutorDeputados', []):
                if not isinstance(deputy, dict):
                    logger.warning(f"Unexpected deputy author data type: {type(deputy)}")
                    continue
                    
                name = self.truncate_text(deputy.get('nome', ''), MAX_NAME_LENGTH)
                party = self.truncate_text(deputy.get('GP', ''), MAX_NAME_LENGTH)
                id_cadastro = deputy.get('idCadastro')
                
                if not name:  # Skip if name is empty
                    logger.warning("Skipping deputy author with empty name")
                    continue
                    
                # Try to find existing author first
                try:
                    author = Author.objects.filter(
                        name=name,
                        party=party,
                        author_type='Deputado'
                    ).first()
                    
                    if not author:
                        # Create a new author if not found
                        author = Author(
                            name=name,
                            party=party,
                            author_type='Deputado',
                            id_cadastro=id_cadastro
                        )
                        author.save()
                    
                    projeto_lei.authors.add(author)
                except Exception as e:
                    logger.error(f"Error processing deputy author {name}: {str(e)}")
        
        # Process party authors
        if data.get('IniAutorGruposParlamentares'):
            for party_data in data.get('IniAutorGruposParlamentares', []):
                if not isinstance(party_data, dict):
                    logger.warning(f"Unexpected party author data type: {type(party_data)}")
                    continue
                    
                party_name = self.truncate_text(party_data.get('GP', ''), MAX_NAME_LENGTH)
                
                if not party_name:  # Skip if party name is empty
                    logger.warning("Skipping party author with empty name")
                    continue
                    
                try:
                    # Try to find existing author first
                    author = Author.objects.filter(
                        name=party_name,
                        party=party_name,
                        author_type='Grupo'
                    ).first()
                    
                    if not author:
                        # Create a new author if not found
                        author = Author(
                            name=party_name,
                            party=party_name,
                            author_type='Grupo'
                        )
                        author.save()
                    
                    projeto_lei.authors.add(author)
                except Exception as e:
                    logger.error(f"Error processing party author {party_name}: {str(e)}")
        
        # Process other authors
        if data.get('IniAutorOutros'):
            other = data.get('IniAutorOutros')
            if other and isinstance(other, dict):
                name = self.truncate_text(other.get('nome', ''), MAX_NAME_LENGTH)
                sigla = self.truncate_text(other.get('sigla', ''), MAX_NAME_LENGTH)
                
                if name:  # Only proceed if name is not empty
                    try:
                        # Try to find existing author first
                        author = Author.objects.filter(
                            name=name,
                            party=sigla,
                            author_type='Outro'
                        ).first()
                        
                        if not author:
                            # Create a new author if not found
                            author = Author(
                                name=name,
                                party=sigla,
                                author_type='Outro'
                            )
                            author.save()
                        
                        projeto_lei.authors.add(author)
                    except Exception as e:
                        logger.error(f"Error processing other author {name}: {str(e)}")
    
    def process_phases(self, data, projeto_lei):
        """Process phase data and link to ProjetoLei"""
        # Process each phase
        if not data.get('IniEventos'):
            return
            
        for phase_data in data.get('IniEventos', []):
            if not isinstance(phase_data, dict):
                logger.warning(f"Unexpected phase data type: {type(phase_data)}")
                continue
                
            # Create unique identifier for phase using evt_id and oev_id
            evt_id = phase_data.get('EvtId')
            oev_id = phase_data.get('OevId')
            
            # Check if phase already exists
            existing_phase = None
            if evt_id and oev_id:
                try:
                    existing_phase = Phase.objects.filter(
                        evt_id=evt_id,
                        oev_id=oev_id
                    ).first()
                except Exception:
                    pass
            
            if existing_phase:
                # Update existing phase
                phase = existing_phase
                phase.name = self.truncate_text(phase_data.get('Fase', ''), MAX_NAME_LENGTH)
                phase.date = self.parse_date(phase_data.get('DataFase'))
                phase.code = phase_data.get('CodigoFase')
                phase.observation = phase_data.get('ObsFase')
                phase.oev_text_id = phase_data.get('OevTextId')
                phase.act_id = phase_data.get('ActId')
                phase.save()
                
                # To avoid complexity with updating nested relations, 
                # just delete existing ones and recreate them
                # This is safer but slower - for large datasets you might
                # want to use a more targeted approach
                phase.attachments.all().delete()
                phase.publications.all().delete()
                phase.commissions.all().delete()
                try:
                    # These may cause issues if there are a lot of nested relations
                    phase.debates.all().delete()
                    phase.approved_texts.all().delete()
                    phase.deputy_appeals.all().delete()
                    phase.party_appeals.all().delete()
                    phase.related_initiatives.all().delete()
                except Exception as e:
                    logger.warning(f"Error deleting phase relations: {str(e)}")
            else:
                # Create new phase
                phase = Phase(
                    name=self.truncate_text(phase_data.get('Fase', ''), MAX_NAME_LENGTH),
                    date=self.parse_date(phase_data.get('DataFase')),
                    code=phase_data.get('CodigoFase'),
                    observation=phase_data.get('ObsFase'),
                    oev_id=oev_id,
                    oev_text_id=phase_data.get('OevTextId'),
                    evt_id=evt_id,
                    act_id=phase_data.get('ActId')
                )
                phase.save()
            
            # Process attachments
            self.process_attachments(phase_data.get('AnexosFase', []), phase)
            
            # Process publications
            self.process_publications(phase_data.get('PublicacaoFase', []), phase)
            
            # Process commissions
            self.process_commissions(phase_data.get('Comissao', []), phase)
            
            # Process debates
            self.process_debates(phase_data.get('Intervencoesdebates', []), phase)
            
            # Process approved texts
            self.process_approved_texts(phase_data.get('TextosAprovados', []), phase)
            
            # Process deputy appeals
            self.process_deputy_appeals(phase_data.get('RecursoDeputados', []), phase)
            
            # Process party appeals
            self.process_party_appeals(phase_data.get('RecursoGP', []), phase)
            
            # Process votes
            self.process_votes(phase_data.get('Votacao', []), phase, projeto_lei)
            
            # Process related initiatives
            self.process_related_initiatives(phase_data.get('IniciativasConjuntas', []), phase)
            
            # Link phase to projeto_lei
            projeto_lei.phases.add(phase)

    def process_attachments(self, attachments_data, phase):
        """Process attachments for a phase"""
        if not attachments_data:
            return
        
        for attachment_data in attachments_data:
            if not isinstance(attachment_data, dict):
                logger.warning(f"Unexpected attachment data type: {type(attachment_data)}")
                continue
                
            try:
                attachment = Attachment(
                    name=self.truncate_text(attachment_data.get('anexoNome', '') or 'Untitled Attachment', MAX_NAME_LENGTH),
                    file_url=self.truncate_text(attachment_data.get('anexoFich', '') or '', MAX_URL_LENGTH),
                    phase=phase
                )
                attachment.save()
            except Exception as e:
                logger.warning(f"Error saving attachment: {str(e)}")

    def process_publications(self, publications_data, phase):
        """Process publications for a phase"""
        if not publications_data:
            return
        
        for pub_data in publications_data:
            if not isinstance(pub_data, dict):
                logger.warning(f"Unexpected publication data type: {type(pub_data)}")
                continue
                
            try:
                publication = Publication(
                    date=self.parse_date(pub_data.get('pubdt')),
                    legislature_code=self.truncate_text(pub_data.get('pubLeg', ''), 50),
                    number=self.truncate_text(pub_data.get('pubNr', ''), 50),
                    session=self.truncate_text(pub_data.get('pubSL', ''), 50),
                    publication_type=self.truncate_text(pub_data.get('pubTipo', ''), 100),
                    publication_tp=self.truncate_text(pub_data.get('pubTp', ''), 50),
                    supplement=self.truncate_text(pub_data.get('supl', ''), 50),
                    pages=pub_data.get('pag'),
                    url=self.truncate_text(pub_data.get('URLDiario', ''), MAX_URL_LENGTH),
                    id_page=self.truncate_text(pub_data.get('idPag', ''), 50),
                    observation=pub_data.get('obs'),
                    id_debate=self.truncate_text(pub_data.get('idDeb', ''), 50),
                    id_intervention=self.truncate_text(pub_data.get('idInt', ''), 50),
                    id_act=self.truncate_text(pub_data.get('idAct', ''), 50),
                    final_diary_supplement=self.truncate_text(pub_data.get('pagFinalDiarioSupl', ''), 100),
                    phase=phase
                )
                publication.save()
            except Exception as e:
                logger.warning(f"Error saving publication: {str(e)}")

    def process_commissions(self, commissions_data, phase):
        """Process commissions for a phase"""
        if not commissions_data:
            return
        
        for comm_data in commissions_data:
            if not isinstance(comm_data, dict):
                logger.warning(f"Unexpected commission data type: {type(comm_data)}")
                continue
                
            try:
                commission = Commission(
                    name=self.truncate_text(comm_data.get('Nome', ''), 500),
                    number=self.truncate_text(comm_data.get('Numero', ''), 50),
                    id_commission=self.truncate_text(comm_data.get('IdComissao', ''), 50),
                    acc_id=self.truncate_text(comm_data.get('AccId', ''), 50),
                    competent=self.truncate_text(comm_data.get('Competente', ''), 10),
                    observation=comm_data.get('Observacao'),
                    distribution_date=self.parse_date(comm_data.get('DataDistribuicao')),
                    subcommission_distribution=comm_data.get('DistribuicaoSubcomissao'),
                    subcommission_distribution_date=self.parse_date(comm_data.get('DataDistruibuicaoSubcomissao')),
                    entry_date=self.parse_date(comm_data.get('DataEntrada')),
                    public_appreciation_start_date=self.parse_date(comm_data.get('DatainicioApreciacaoPublica')),
                    public_appreciation_end_date=self.parse_date(comm_data.get('DatafimApreciacaoPublica')),
                    no_opinion_reason_date=self.parse_date(comm_data.get('DataMotivoNaoParecer')),
                    report_date=self.parse_date(comm_data.get('DataRelatorio')),
                    forwarding_date=self.parse_date(comm_data.get('DataRemessa')),
                    plenary_scheduling_request_date=self.parse_date(comm_data.get('DataReqAgendamentoPlenario')),
                    awaits_plenary_scheduling=self.truncate_text(comm_data.get('AguardaAgendamentoPlenario', ''), 50),
                    plenary_scheduling_date=self.parse_date(comm_data.get('DataAgendamentoPlenario')),
                    discussion_scheduling_date=self.parse_date(comm_data.get('DataAgendamentoDiscussao')),
                    plenary_scheduling_gp=self.truncate_text(comm_data.get('GpAgendamentoPlenario', ''), 50),
                    no_opinion_reason=comm_data.get('MotivoNaoParecer'),
                    extended=self.truncate_text(comm_data.get('Prorrogado', ''), 10),
                    sigla=self.truncate_text(comm_data.get('Sigla', ''), 50),
                    legislature_ref=self.truncate_text(comm_data.get('Legislatura', ''), 50),
                    session_ref=self.truncate_text(comm_data.get('Sessao', ''), 50),
                    phase=phase
                )
                commission.save()
                
                # Process commission documents
                if comm_data.get('Documentos'):
                    for doc_data in comm_data.get('Documentos', []):
                        if not isinstance(doc_data, dict):
                            logger.warning(f"Unexpected commission document data type: {type(doc_data)}")
                            continue
                            
                        try:
                            doc = CommissionDocument(
                                title=self.truncate_text(doc_data.get('TituloDocumento', ''), MAX_TITLE_LENGTH),
                                document_type=self.truncate_text(doc_data.get('TipoDocumento', ''), 100),
                                date=self.parse_date(doc_data.get('DataDocumento')),
                                url=self.truncate_text(doc_data.get('URL', ''), MAX_URL_LENGTH),
                                commission=commission
                            )
                            doc.save()
                        except Exception as e:
                            logger.warning(f"Error saving commission document: {str(e)}")
                        
                # Process rapporteurs
                if comm_data.get('Relatores'):
                    for rel_data in comm_data.get('Relatores', []):
                        if not isinstance(rel_data, dict):
                            logger.warning(f"Unexpected rapporteur data type: {type(rel_data)}")
                            continue
                            
                        try:
                            rapporteur = Rapporteur(
                                name=self.truncate_text(rel_data.get('nome', ''), MAX_NAME_LENGTH),
                                party=self.truncate_text(rel_data.get('GP', ''), 100),
                                date=self.parse_date(rel_data.get('data')),
                                commission=commission
                            )
                            rapporteur.save()
                        except Exception as e:
                            logger.warning(f"Error saving rapporteur: {str(e)}")
                    
                # Process received opinions
                if comm_data.get('PareceresRecebidos'):
                    for op_data in comm_data.get('PareceresRecebidos', []):
                        if not isinstance(op_data, dict):
                            logger.warning(f"Unexpected opinion data type: {type(op_data)}")
                            continue
                            
                        try:
                            opinion = Opinion(
                                entity=self.truncate_text(op_data.get('entidade', ''), MAX_NAME_LENGTH),
                                date=self.parse_date(op_data.get('data')),
                                url=self.truncate_text(op_data.get('url', ''), MAX_URL_LENGTH),
                                document_type=self.truncate_text(op_data.get('tipoDocumento', ''), 100),
                                commission=commission
                            )
                            opinion.save()
                        except Exception as e:
                            logger.warning(f"Error saving opinion: {str(e)}")
                    
                # Process opinion requests
                if comm_data.get('PedidosParecer'):
                    for req_data in comm_data.get('PedidosParecer', []):
                        if not isinstance(req_data, dict):
                            logger.warning(f"Unexpected opinion request data type: {type(req_data)}")
                            continue
                            
                        try:
                            request = OpinionRequest(
                                entity=self.truncate_text(req_data.get('entidade', ''), MAX_NAME_LENGTH),
                                date=self.parse_date(req_data.get('data')),
                                commission=commission
                            )
                            request.save()
                        except Exception as e:
                            logger.warning(f"Error saving opinion request: {str(e)}")
                    
                # Process hearings
                if comm_data.get('Audicoes'):
                    for hear_data in comm_data.get('Audicoes', []):
                        if not isinstance(hear_data, dict):
                            logger.warning(f"Unexpected hearing data type: {type(hear_data)}")
                            continue
                            
                        try:
                            hearing = Hearing(
                                entity=self.truncate_text(hear_data.get('entidade', ''), MAX_NAME_LENGTH),
                                date=self.parse_date(hear_data.get('data')),
                                commission=commission
                            )
                            hearing.save()
                        except Exception as e:
                            logger.warning(f"Error saving hearing: {str(e)}")
                    
                # Process audiences
                if comm_data.get('Audiencias'):
                    for aud_data in comm_data.get('Audiencias', []):
                        if not isinstance(aud_data, dict):
                            logger.warning(f"Unexpected audience data type: {type(aud_data)}")
                            continue
                            
                        try:
                            audience = Audience(
                                entity=self.truncate_text(aud_data.get('entidade', ''), MAX_NAME_LENGTH),
                                date=self.parse_date(aud_data.get('data')),
                                commission=commission
                            )
                            audience.save()
                        except Exception as e:
                            logger.warning(f"Error saving audience: {str(e)}")
                    
                # Process commission votes
                if comm_data.get('Votacao'):
                    for vote_data in comm_data.get('Votacao', []):
                        if not isinstance(vote_data, dict):
                            logger.warning(f"Unexpected commission vote data type: {type(vote_data)}")
                            continue
                            
                        try:
                            vote = CommissionVote(
                                date=self.parse_date(vote_data.get('data')),
                                result=self.truncate_text(vote_data.get('resultado', ''), 100),
                                favor=vote_data.get('favor'),
                                against=vote_data.get('contra'),
                                abstention=vote_data.get('abstencao'),
                                commission=commission
                            )
                            vote.save()
                        except Exception as e:
                            logger.warning(f"Error saving commission vote: {str(e)}")
                    
                # Process final draft submissions
                if comm_data.get('RemessaRedaccaoFinal'):
                    for sub_data in comm_data.get('RemessaRedaccaoFinal', []):
                        if not isinstance(sub_data, dict):
                            logger.warning(f"Unexpected final draft submission data type: {type(sub_data)}")
                            continue
                            
                        try:
                            submission = FinalDraftSubmission(
                                date=self.parse_date(sub_data.get('data')),
                                text=sub_data.get('texto'),
                                commission=commission
                            )
                            submission.save()
                        except Exception as e:
                            logger.warning(f"Error saving final draft submission: {str(e)}")
                    
                # Process forwardings
                if comm_data.get('Remessas'):
                    for fw_data in comm_data.get('Remessas', []):
                        if not isinstance(fw_data, dict):
                            logger.warning(f"Unexpected forwarding data type: {type(fw_data)}")
                            continue
                            
                        try:
                            forwarding = Forwarding(
                                entity=self.truncate_text(fw_data.get('entidade', ''), MAX_NAME_LENGTH),
                                date=self.parse_date(fw_data.get('data')),
                                commission=commission
                            )
                            forwarding.save()
                        except Exception as e:
                            logger.warning(f"Error saving forwarding: {str(e)}")
            except Exception as e:
                logger.warning(f"Error saving commission: {str(e)}")

    def process_debates(self, debates_data, phase):
        """Process debates for a phase"""
        if not debates_data:
            return
        
        for deb_data in debates_data:
            if not isinstance(deb_data, dict):
                logger.warning(f"Unexpected debate data type: {type(deb_data)}")
                continue
                
            try:
                debate = Debate(
                    date=self.parse_date(deb_data.get('dataReuniaoPlenaria')),
                    phase=self.truncate_text(deb_data.get('faseDebate', ''), 100),
                    session_phase=self.truncate_text(deb_data.get('faseSessao', ''), 10),
                    start_time=self.truncate_text(deb_data.get('horaInicio', ''), 10),
                    end_time=self.truncate_text(deb_data.get('horaTermo', ''), 10),
                    summary=deb_data.get('sumario'),
                    content=deb_data.get('teor'),
                    phase_link=phase
                )
                debate.save()
                
                # Process video links
                if deb_data.get('linkVideo'):
                    for link_data in deb_data.get('linkVideo', []):
                        if not isinstance(link_data, dict):
                            logger.warning(f"Unexpected video link data type: {type(link_data)}")
                            continue
                            
                        try:
                            link = VideoLink(
                                url=self.truncate_text(link_data.get('link', ''), MAX_URL_LENGTH),
                                debate=debate
                            )
                            link.save()
                        except Exception as e:
                            logger.warning(f"Error saving video link: {str(e)}")
                
                # Process deputies
                if deb_data.get('deputados'):
                    for dep_data in deb_data.get('deputados', []):
                        if not isinstance(dep_data, dict):
                            logger.warning(f"Unexpected deputy data type: {type(dep_data)}")
                            continue
                            
                        try:
                            deputy = DeputyDebate(
                                name=self.truncate_text(dep_data.get('nome', ''), MAX_NAME_LENGTH),
                                party=self.truncate_text(dep_data.get('GP', ''), 100),
                                debate=debate
                            )
                            deputy.save()
                        except Exception as e:
                            logger.warning(f"Error saving deputy debate: {str(e)}")
                
                # Process government members
                if deb_data.get('membrosGoverno'):
                    gov_data = deb_data.get('membrosGoverno')
                    if gov_data and isinstance(gov_data, dict):
                        try:
                            member = GovernmentMemberDebate(
                                name=self.truncate_text(gov_data.get('nome', ''), MAX_NAME_LENGTH),
                                position=self.truncate_text(gov_data.get('cargo', ''), MAX_NAME_LENGTH),
                                government=self.truncate_text(gov_data.get('governo', ''), MAX_NAME_LENGTH),
                                debate=debate
                            )
                            member.save()
                        except Exception as e:
                            logger.warning(f"Error saving government member debate: {str(e)}")
                
                # Process guests
                if deb_data.get('convidados'):
                    guest_data = deb_data.get('convidados')
                    if guest_data and isinstance(guest_data, dict):
                        try:
                            guest = GuestDebate(
                                name=self.truncate_text(guest_data.get('nome', ''), MAX_NAME_LENGTH) if guest_data.get('nome') else "Unnamed Guest",
                                position=self.truncate_text(guest_data.get('cargo', ''), MAX_NAME_LENGTH),
                                honor=self.truncate_text(guest_data.get('honra', ''), MAX_NAME_LENGTH),
                                country=self.truncate_text(guest_data.get('pais', ''), 100),
                                debate=debate
                            )
                            guest.save()
                        except Exception as e:
                            logger.warning(f"Error saving guest debate: {str(e)}")
            except Exception as e:
                logger.warning(f"Error saving debate: {str(e)}")

    def process_approved_texts(self, texts_data, phase):
        """Process approved texts for a phase"""
        if not texts_data:
            return
        
        for text_data in texts_data:
            try:
                if isinstance(text_data, dict):
                    # Handle dictionary case
                    text = ApprovedText(
                        title=self.truncate_text(text_data.get('titulo', ''), MAX_TITLE_LENGTH),
                        text_type=self.truncate_text(text_data.get('tipo', ''), 100),
                        date=self.parse_date(text_data.get('data')),
                        url=self.truncate_text(text_data.get('url', ''), MAX_URL_LENGTH),
                        phase=phase
                    )
                    text.save()
                elif isinstance(text_data, str):
                    # Handle string case
                    logger.warning(f"Approved text is a string: {text_data[:30]}...")
                    text = ApprovedText(
                        title=self.truncate_text(text_data, MAX_TITLE_LENGTH),
                        text_type="Unknown",
                        phase=phase
                    )
                    text.save()
                else:
                    # Handle any other type
                    logger.warning(f"Unexpected approved text data type: {type(text_data)}")
            except Exception as e:
                logger.warning(f"Error saving approved text: {str(e)}")

    def process_deputy_appeals(self, appeals_data, phase):
        """Process deputy appeals for a phase"""
        if not appeals_data:
            return
        
        for appeal_data in appeals_data:
            if not isinstance(appeal_data, dict):
                logger.warning(f"Unexpected deputy appeal data type: {type(appeal_data)}")
                continue
                
            try:
                appeal = DeputyAppeal(
                    deputy_name=self.truncate_text(appeal_data.get('nome', ''), MAX_NAME_LENGTH),
                    party=self.truncate_text(appeal_data.get('GP', ''), 100),
                    date=self.parse_date(appeal_data.get('data')),
                    phase=phase
                )
                appeal.save()
            except Exception as e:
                logger.warning(f"Error saving deputy appeal: {str(e)}")

    def process_party_appeals(self, appeals_data, phase):
        """Process party appeals for a phase"""
        if not appeals_data:
            return
        
        for appeal_data in appeals_data:
            if not isinstance(appeal_data, dict):
                logger.warning(f"Unexpected party appeal data type: {type(appeal_data)}")
                continue
                
            try:
                appeal = PartyAppeal(
                    party=self.truncate_text(appeal_data.get('GP', ''), 100),
                    date=self.parse_date(appeal_data.get('data')),
                    phase=phase
                )
                appeal.save()
            except Exception as e:
                logger.warning(f"Error saving party appeal: {str(e)}")

    def process_votes(self, votes_data, phase, projeto_lei):
        """Process votes for a phase"""
        if not votes_data:
            return
        
        for vote_data in votes_data:
            if not isinstance(vote_data, dict):
                logger.warning(f"Unexpected vote data type: {type(vote_data)}")
                continue
                
            try:
                vote = Vote(
                    date=self.parse_date(vote_data.get('data')),
                    result=self.truncate_text(vote_data.get('resultado', ''), 50),
                    details=vote_data.get('detalhe'),
                    description=vote_data.get('descricao'),
                    votes=vote_data,  # Store the full vote data in JSON field
                    meeting=self.truncate_text(vote_data.get('reuniao', ''), 50),
                    meeting_type=self.truncate_text(vote_data.get('tipoReuniao', ''), 50),
                    unanimous=self.truncate_text(vote_data.get('unanime', ''), 50),
                    absences=vote_data.get('ausencias'),
                    vote_id=self.truncate_text(vote_data.get('id', ''), 50)
                )
                vote.save()
                
                # Link to projeto_lei
                projeto_lei.votes.add(vote)
                
                # Process vote publications
                if vote_data.get('publicacao'):
                    for pub_data in vote_data.get('publicacao', []):
                        if not isinstance(pub_data, dict):
                            logger.warning(f"Unexpected vote publication data type: {type(pub_data)}")
                            continue
                            
                        try:
                            publication = Publication(
                                date=self.parse_date(pub_data.get('pubdt')),
                                legislature_code=self.truncate_text(pub_data.get('pubLeg', ''), 50),
                                number=self.truncate_text(pub_data.get('pubNr', ''), 50),
                                session=self.truncate_text(pub_data.get('pubSL', ''), 50),
                                publication_type=self.truncate_text(pub_data.get('pubTipo', ''), 100),
                                publication_tp=self.truncate_text(pub_data.get('pubTp', ''), 50),
                                supplement=self.truncate_text(pub_data.get('supl', ''), 50),
                                pages=pub_data.get('pag'),
                                url=self.truncate_text(pub_data.get('URLDiario', ''), MAX_URL_LENGTH),
                                id_page=self.truncate_text(pub_data.get('idPag', ''), 50),
                                observation=pub_data.get('obs'),
                                id_debate=self.truncate_text(pub_data.get('idDeb', ''), 50),
                                id_intervention=self.truncate_text(pub_data.get('idInt', ''), 50),
                                id_act=self.truncate_text(pub_data.get('idAct', ''), 50),
                                final_diary_supplement=self.truncate_text(pub_data.get('pagFinalDiarioSupl', ''), 100),
                                vote=vote
                            )
                            publication.save()
                        except Exception as e:
                            logger.warning(f"Error saving vote publication: {str(e)}")
            except Exception as e:
                logger.warning(f"Error saving vote: {str(e)}")

    def process_related_initiatives(self, initiatives_data, phase):
        """Process related initiatives for a phase"""
        if not initiatives_data:
            return
        
        for rel_data in initiatives_data:
            if not isinstance(rel_data, dict):
                logger.warning(f"Unexpected related initiative data type: {type(rel_data)}")
                continue
                
            try:
                related = RelatedInitiative(
                    initiative_id=self.truncate_text(rel_data.get('id', ''), 50),
                    initiative_type=self.truncate_text(rel_data.get('descTipo', ''), 100),
                    initiative_number=self.truncate_text(rel_data.get('nr', ''), 50),
                    legislature=self.truncate_text(rel_data.get('leg', ''), 50),
                    title=rel_data.get('titulo'),
                    entry_date=self.parse_date(rel_data.get('dataEntrada')),
                    selection=self.truncate_text(rel_data.get('sel', ''), 10),
                    phase=phase
                )
                related.save()
            except Exception as e:
                logger.warning(f"Error saving related initiative: {str(e)}")

    def parse_date(self, date_str):
        """Parse date string to datetime object"""
        if not date_str:
            return None
        
        # Handle various date formats
        formats = [
            '%Y-%m-%d',
            '%Y-%m-%dT%H:%M:%S',
            '%d-%m-%Y',
        ]
        
        for fmt in formats:
            try:
                return datetime.strptime(date_str, fmt).date()
            except (ValueError, TypeError):
                continue
        
        # Special case for "0001-01-01T00:00:00"
        if date_str == "0001-01-01T00:00:00":
            return None
            
        return None
    
    def truncate_text(self, text, max_length):
        """Truncate text to max_length if necessary"""
        if not text:
            return ""
        
        if len(text) <= max_length:
            return text
        
        return text[:max_length]