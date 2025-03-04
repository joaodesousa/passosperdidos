import json
import logging
import requests
import traceback
from datetime import datetime
from django.core.management.base import BaseCommand
from django.db import transaction
from django.db.utils import IntegrityError
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

    def handle(self, *args, **options):
        url = options['url']
        limit = options['limit']
        file_path = options['file']
        
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
        
        self.import_initiatives(data)
        
    def import_initiatives(self, data):
        """Import all initiatives from the data"""
        successfully_imported = 0
        errors = 0
        
        for initiative_data in data:
            try:
                with transaction.atomic():
                    self.import_single_initiative(initiative_data)
                successfully_imported += 1
                if successfully_imported % 10 == 0:
                    logger.info(f"Successfully imported {successfully_imported} initiatives so far")
            except Exception as e:
                errors += 1
                initiative_id = initiative_data.get('IniId', 'unknown')
                logger.error(f"Error importing initiative {initiative_id}: {str(e)}")
                # Print more detailed error information for debugging
                logger.error(traceback.format_exc())
                
        logger.info(f"Import completed. Successfully imported: {successfully_imported}. Errors: {errors}")
    
    def import_single_initiative(self, data):
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
            existing_projeto.title = data.get('IniTitulo', '')
            existing_projeto.type = data.get('IniDescTipo', '')
            existing_projeto.legislature = legislature
            existing_projeto.date = self.parse_date(data.get('DataInicioleg'))
            existing_projeto.link = data.get('IniLinkTexto', '')
            existing_projeto.observation = data.get('IniObs')
            existing_projeto.epigraph = data.get('IniEpigrafe')
            existing_projeto.text_link = data.get('IniLinkTexto')
            existing_projeto.save()
            projeto_lei = existing_projeto
            
            # Clear existing relationships to rebuild them
            projeto_lei.authors.clear()
            projeto_lei.phases.clear()
            
        except ProjetoLei.DoesNotExist:
            # Create the main ProjetoLei record
            projeto_lei = ProjetoLei(
                title=data.get('IniTitulo', ''),
                type=data.get('IniDescTipo', ''),
                legislature=legislature,
                date=self.parse_date(data.get('DataInicioleg')),
                link=data.get('IniLinkTexto', ''),
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
                text_link=data.get('IniLinkTexto'),
                european_initiatives=data.get('IniciativasEuropeias'),
                origin_initiatives=data.get('IniciativasOrigem'),
                originated_initiatives=data.get('IniciativasOriginadas')
            )
            projeto_lei.save()
        
        # Process authors
        self.process_authors(data, projeto_lei)
        
        # Process phases
        self.process_phases(data, projeto_lei)
    
    def process_authors(self, data, projeto_lei):
        """Process author data and link to ProjetoLei"""
        # Process deputy authors
        if data.get('IniAutorDeputados'):
            for deputy in data.get('IniAutorDeputados', []):
                if not isinstance(deputy, dict):
                    logger.warning(f"Unexpected deputy author data type: {type(deputy)}")
                    continue
                    
                name = deputy.get('nome', '')
                party = deputy.get('GP')
                id_cadastro = deputy.get('idCadastro')
                
                # Try to find existing author first
                author, created = Author.objects.get_or_create(
                    name=name,
                    party=party,
                    author_type='Deputado',
                    defaults={'id_cadastro': id_cadastro}
                )
                
                projeto_lei.authors.add(author)
        
        # Process party authors
        if data.get('IniAutorGruposParlamentares'):
            for party in data.get('IniAutorGruposParlamentares', []):
                if not isinstance(party, dict):
                    logger.warning(f"Unexpected party author data type: {type(party)}")
                    continue
                    
                party_name = party.get('GP', '')
                
                # Try to find existing author first
                author, created = Author.objects.get_or_create(
                    name=party_name,
                    party=party_name,
                    author_type='Grupo'
                )
                
                projeto_lei.authors.add(author)
        
        # Process other authors
        if data.get('IniAutorOutros'):
            other = data.get('IniAutorOutros')
            if other and isinstance(other, dict):
                name = other.get('nome', '')
                sigla = other.get('sigla')
                
                if name:  # Only proceed if name is not empty
                    # Try to find existing author first
                    author, created = Author.objects.get_or_create(
                        name=name,
                        party=sigla,
                        author_type='Outro'
                    )
                    
                    projeto_lei.authors.add(author)
    
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
                phase.name = phase_data.get('Fase', '')
                phase.date = self.parse_date(phase_data.get('DataFase'))
                phase.code = phase_data.get('CodigoFase')
                phase.observation = phase_data.get('ObsFase')
                phase.oev_text_id = phase_data.get('OevTextId')
                phase.act_id = phase_data.get('ActId')
                phase.save()
                
                # Clear existing related objects
                phase.attachments.all().delete()
                phase.publications.all().delete()
                phase.commissions.all().delete()
                phase.debates.all().delete()
                phase.approved_texts.all().delete()
                phase.deputy_appeals.all().delete()
                phase.party_appeals.all().delete()
                phase.related_initiatives.all().delete()
            else:
                # Create new phase
                phase = Phase(
                    name=phase_data.get('Fase', ''),
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
                
            attachment = Attachment(
                name=attachment_data.get('anexoNome', '') or 'Untitled Attachment',
                file_url=attachment_data.get('anexoFich', '') or '',
                phase=phase
            )
            attachment.save()

    def process_publications(self, publications_data, phase):
        """Process publications for a phase"""
        if not publications_data:
            return
        
        for pub_data in publications_data:
            if not isinstance(pub_data, dict):
                logger.warning(f"Unexpected publication data type: {type(pub_data)}")
                continue
                
            publication = Publication(
                date=self.parse_date(pub_data.get('pubdt')),
                legislature_code=pub_data.get('pubLeg'),
                number=pub_data.get('pubNr'),
                session=pub_data.get('pubSL'),
                publication_type=pub_data.get('pubTipo'),
                publication_tp=pub_data.get('pubTp'),
                supplement=pub_data.get('supl'),
                pages=pub_data.get('pag'),
                url=pub_data.get('URLDiario'),
                id_page=pub_data.get('idPag'),
                observation=pub_data.get('obs'),
                id_debate=pub_data.get('idDeb'),
                id_intervention=pub_data.get('idInt'),
                id_act=pub_data.get('idAct'),
                final_diary_supplement=pub_data.get('pagFinalDiarioSupl'),
                phase=phase
            )
            publication.save()

    def process_commissions(self, commissions_data, phase):
        """Process commissions for a phase"""
        if not commissions_data:
            return
        
        for comm_data in commissions_data:
            if not isinstance(comm_data, dict):
                logger.warning(f"Unexpected commission data type: {type(comm_data)}")
                continue
                
            commission = Commission(
                name=comm_data.get('Nome', ''),
                number=comm_data.get('Numero'),
                id_commission=comm_data.get('IdComissao'),
                acc_id=comm_data.get('AccId'),
                competent=comm_data.get('Competente'),
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
                awaits_plenary_scheduling=comm_data.get('AguardaAgendamentoPlenario'),
                plenary_scheduling_date=self.parse_date(comm_data.get('DataAgendamentoPlenario')),
                discussion_scheduling_date=self.parse_date(comm_data.get('DataAgendamentoDiscussao')),
                plenary_scheduling_gp=comm_data.get('GpAgendamentoPlenario'),
                no_opinion_reason=comm_data.get('MotivoNaoParecer'),
                extended=comm_data.get('Prorrogado'),
                sigla=comm_data.get('Sigla'),
                legislature_ref=comm_data.get('Legislatura'),
                session_ref=comm_data.get('Sessao'),
                phase=phase
            )
            commission.save()
            
            # Process commission documents
            if comm_data.get('Documentos'):
                for doc_data in comm_data.get('Documentos', []):
                    if not isinstance(doc_data, dict):
                        logger.warning(f"Unexpected commission document data type: {type(doc_data)}")
                        continue
                        
                    doc = CommissionDocument(
                        title=doc_data.get('TituloDocumento', ''),
                        document_type=doc_data.get('TipoDocumento', ''),
                        date=self.parse_date(doc_data.get('DataDocumento')),
                        url=doc_data.get('URL', ''),
                        commission=commission
                    )
                    doc.save()
                    
            # Process rapporteurs
            if comm_data.get('Relatores'):
                for rel_data in comm_data.get('Relatores', []):
                    if not isinstance(rel_data, dict):
                        logger.warning(f"Unexpected rapporteur data type: {type(rel_data)}")
                        continue
                        
                    rapporteur = Rapporteur(
                        name=rel_data.get('nome', ''),
                        party=rel_data.get('GP'),
                        date=self.parse_date(rel_data.get('data')),
                        commission=commission
                    )
                    rapporteur.save()
                
            # Process received opinions
            if comm_data.get('PareceresRecebidos'):
                for op_data in comm_data.get('PareceresRecebidos', []):
                    if not isinstance(op_data, dict):
                        logger.warning(f"Unexpected opinion data type: {type(op_data)}")
                        continue
                        
                    opinion = Opinion(
                        entity=op_data.get('entidade', ''),
                        date=self.parse_date(op_data.get('data')),
                        url=op_data.get('url'),
                        document_type=op_data.get('tipoDocumento'),
                        commission=commission
                    )
                    opinion.save()
                
            # Process opinion requests
            if comm_data.get('PedidosParecer'):
                for req_data in comm_data.get('PedidosParecer', []):
                    if not isinstance(req_data, dict):
                        logger.warning(f"Unexpected opinion request data type: {type(req_data)}")
                        continue
                        
                    request = OpinionRequest(
                        entity=req_data.get('entidade', ''),
                        date=self.parse_date(req_data.get('data')),
                        commission=commission
                    )
                    request.save()
                
            # Process hearings
            if comm_data.get('Audicoes'):
                for hear_data in comm_data.get('Audicoes', []):
                    if not isinstance(hear_data, dict):
                        logger.warning(f"Unexpected hearing data type: {type(hear_data)}")
                        continue
                        
                    hearing = Hearing(
                        entity=hear_data.get('entidade', ''),
                        date=self.parse_date(hear_data.get('data')),
                        commission=commission
                    )
                    hearing.save()
                
            # Process audiences
            if comm_data.get('Audiencias'):
                for aud_data in comm_data.get('Audiencias', []):
                    if not isinstance(aud_data, dict):
                        logger.warning(f"Unexpected audience data type: {type(aud_data)}")
                        continue
                        
                    audience = Audience(
                        entity=aud_data.get('entidade', ''),
                        date=self.parse_date(aud_data.get('data')),
                        commission=commission
                    )
                    audience.save()
                
            # Process commission votes
            if comm_data.get('Votacao'):
                for vote_data in comm_data.get('Votacao', []):
                    if not isinstance(vote_data, dict):
                        logger.warning(f"Unexpected commission vote data type: {type(vote_data)}")
                        continue
                        
                    vote = CommissionVote(
                        date=self.parse_date(vote_data.get('data')),
                        result=vote_data.get('resultado'),
                        favor=vote_data.get('favor'),
                        against=vote_data.get('contra'),
                        abstention=vote_data.get('abstencao'),
                        commission=commission
                    )
                    vote.save()
                
            # Process final draft submissions
            if comm_data.get('RemessaRedaccaoFinal'):
                for sub_data in comm_data.get('RemessaRedaccaoFinal', []):
                    if not isinstance(sub_data, dict):
                        logger.warning(f"Unexpected final draft submission data type: {type(sub_data)}")
                        continue
                        
                    submission = FinalDraftSubmission(
                        date=self.parse_date(sub_data.get('data')),
                        text=sub_data.get('texto'),
                        commission=commission
                    )
                    submission.save()
                
            # Process forwardings
            if comm_data.get('Remessas'):
                for fw_data in comm_data.get('Remessas', []):
                    if not isinstance(fw_data, dict):
                        logger.warning(f"Unexpected forwarding data type: {type(fw_data)}")
                        continue
                        
                    forwarding = Forwarding(
                        entity=fw_data.get('entidade', ''),
                        date=self.parse_date(fw_data.get('data')),
                        commission=commission
                    )
                    forwarding.save()

    def process_debates(self, debates_data, phase):
        """Process debates for a phase"""
        if not debates_data:
            return
        
        for deb_data in debates_data:
            if not isinstance(deb_data, dict):
                logger.warning(f"Unexpected debate data type: {type(deb_data)}")
                continue
                
            debate = Debate(
                date=self.parse_date(deb_data.get('dataReuniaoPlenaria')),
                phase=deb_data.get('faseDebate'),
                session_phase=deb_data.get('faseSessao'),
                start_time=deb_data.get('horaInicio'),
                end_time=deb_data.get('horaTermo'),
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
                        
                    link = VideoLink(
                        url=link_data.get('link', ''),
                        debate=debate
                    )
                    link.save()
            
            # Process deputies
            if deb_data.get('deputados'):
                for dep_data in deb_data.get('deputados', []):
                    if not isinstance(dep_data, dict):
                        logger.warning(f"Unexpected deputy data type: {type(dep_data)}")
                        continue
                        
                    deputy = DeputyDebate(
                        name=dep_data.get('nome', ''),
                        party=dep_data.get('GP'),
                        debate=debate
                    )
                    deputy.save()
            
            # Process government members
            if deb_data.get('membrosGoverno'):
                gov_data = deb_data.get('membrosGoverno')
                if gov_data and isinstance(gov_data, dict):
                    member = GovernmentMemberDebate(
                        name=gov_data.get('nome', ''),
                        position=gov_data.get('cargo'),
                        government=gov_data.get('governo'),
                        debate=debate
                    )
                    member.save()
            
            # Process guests
            if deb_data.get('convidados'):
                guest_data = deb_data.get('convidados')
                if guest_data and isinstance(guest_data, dict):
                    guest = GuestDebate(
                        name=guest_data.get('nome'),
                        position=guest_data.get('cargo'),
                        honor=guest_data.get('honra'),
                        country=guest_data.get('pais'),
                        debate=debate
                    )
                    guest.save()

    def process_approved_texts(self, texts_data, phase):
        """Process approved texts for a phase"""
        if not texts_data:
            return
        
        for text_data in texts_data:
            if isinstance(text_data, dict):
                # Handle dictionary case
                text = ApprovedText(
                    title=text_data.get('titulo', ''),
                    text_type=text_data.get('tipo', ''),
                    date=self.parse_date(text_data.get('data')),
                    url=text_data.get('url', ''),
                    phase=phase
                )
                text.save()
            elif isinstance(text_data, str):
                # Handle string case
                logger.warning(f"Approved text is a string: {text_data[:30]}...")
                text = ApprovedText(
                    title=text_data[:255] if len(text_data) > 255 else text_data,
                    text_type="Unknown",
                    phase=phase
                )
                text.save()
            else:
                # Handle any other type
                logger.warning(f"Unexpected approved text data type: {type(text_data)}")

    def process_deputy_appeals(self, appeals_data, phase):
        """Process deputy appeals for a phase"""
        if not appeals_data:
            return
        
        for appeal_data in appeals_data:
            if not isinstance(appeal_data, dict):
                logger.warning(f"Unexpected deputy appeal data type: {type(appeal_data)}")
                continue
                
            appeal = DeputyAppeal(
                deputy_name=appeal_data.get('nome', ''),
                party=appeal_data.get('GP'),
                date=self.parse_date(appeal_data.get('data')),
                phase=phase
            )
            appeal.save()

    def process_party_appeals(self, appeals_data, phase):
        """Process party appeals for a phase"""
        if not appeals_data:
            return
        
        for appeal_data in appeals_data:
            if not isinstance(appeal_data, dict):
                logger.warning(f"Unexpected party appeal data type: {type(appeal_data)}")
                continue
                
            appeal = PartyAppeal(
                party=appeal_data.get('GP', ''),
                date=self.parse_date(appeal_data.get('data')),
                phase=phase
            )
            appeal.save()

    def process_votes(self, votes_data, phase, projeto_lei):
        """Process votes for a phase"""
        if not votes_data:
            return
        
        for vote_data in votes_data:
            if not isinstance(vote_data, dict):
                logger.warning(f"Unexpected vote data type: {type(vote_data)}")
                continue
                
            vote = Vote(
                date=self.parse_date(vote_data.get('data')),
                result=vote_data.get('resultado', ''),
                details=vote_data.get('detalhe'),
                description=vote_data.get('descricao'),
                votes=vote_data,  # Store the full vote data in JSON field
                meeting=vote_data.get('reuniao'),
                meeting_type=vote_data.get('tipoReuniao'),
                unanimous=vote_data.get('unanime'),
                absences=vote_data.get('ausencias'),
                vote_id=vote_data.get('id')
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
                        
                    publication = Publication(
                        date=self.parse_date(pub_data.get('pubdt')),
                        legislature_code=pub_data.get('pubLeg'),
                        number=pub_data.get('pubNr'),
                        session=pub_data.get('pubSL'),
                        publication_type=pub_data.get('pubTipo'),
                        publication_tp=pub_data.get('pubTp'),
                        supplement=pub_data.get('supl'),
                        pages=pub_data.get('pag'),
                        url=pub_data.get('URLDiario'),
                        id_page=pub_data.get('idPag'),
                        observation=pub_data.get('obs'),
                        id_debate=pub_data.get('idDeb'),
                        id_intervention=pub_data.get('idInt'),
                        id_act=pub_data.get('idAct'),
                        final_diary_supplement=pub_data.get('pagFinalDiarioSupl'),
                        vote=vote
                    )
                    publication.save()

    def process_related_initiatives(self, initiatives_data, phase):
        """Process related initiatives for a phase"""
        if not initiatives_data:
            return
        
        for rel_data in initiatives_data:
            if not isinstance(rel_data, dict):
                logger.warning(f"Unexpected related initiative data type: {type(rel_data)}")
                continue
                
            related = RelatedInitiative(
                initiative_id=rel_data.get('id', ''),
                initiative_type=rel_data.get('descTipo', ''),
                initiative_number=rel_data.get('nr', ''),
                legislature=rel_data.get('leg', ''),
                title=rel_data.get('titulo'),
                entry_date=self.parse_date(rel_data.get('dataEntrada')),
                selection=rel_data.get('sel'),
                phase=phase
            )
            related.save()

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