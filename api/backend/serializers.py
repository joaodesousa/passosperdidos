from rest_framework import serializers
from .models import (
    ProjetoLei, Legislature, Phase, Attachment, Author, Vote, 
    Publication, Commission, CommissionDocument, Rapporteur, 
    Opinion, OpinionRequest, Hearing, Audience, CommissionVote, 
    FinalDraftSubmission, Forwarding, Debate, VideoLink, 
    DeputyDebate, GovernmentMemberDebate, GuestDebate, 
    ApprovedText, DeputyAppeal, PartyAppeal, RelatedInitiative
)


class LegislatureSerializer(serializers.ModelSerializer):
    class Meta:
        model = Legislature
        fields = '__all__'


class AuthorSerializer(serializers.ModelSerializer):
    class Meta:
        model = Author
        fields = '__all__'


class AttachmentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Attachment
        fields = '__all__'


class PublicationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Publication
        fields = '__all__'


class CommissionDocumentSerializer(serializers.ModelSerializer):
    class Meta:
        model = CommissionDocument
        fields = '__all__'


class RapporteurSerializer(serializers.ModelSerializer):
    class Meta:
        model = Rapporteur
        fields = '__all__'


class OpinionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Opinion
        fields = '__all__'


class OpinionRequestSerializer(serializers.ModelSerializer):
    class Meta:
        model = OpinionRequest
        fields = '__all__'


class HearingSerializer(serializers.ModelSerializer):
    class Meta:
        model = Hearing
        fields = '__all__'


class AudienceSerializer(serializers.ModelSerializer):
    class Meta:
        model = Audience
        fields = '__all__'


class CommissionVoteSerializer(serializers.ModelSerializer):
    class Meta:
        model = CommissionVote
        fields = '__all__'


class FinalDraftSubmissionSerializer(serializers.ModelSerializer):
    class Meta:
        model = FinalDraftSubmission
        fields = '__all__'


class ForwardingSerializer(serializers.ModelSerializer):
    class Meta:
        model = Forwarding
        fields = '__all__'


class VideoLinkSerializer(serializers.ModelSerializer):
    class Meta:
        model = VideoLink
        fields = '__all__'


class DeputyDebateSerializer(serializers.ModelSerializer):
    class Meta:
        model = DeputyDebate
        fields = '__all__'


class GovernmentMemberDebateSerializer(serializers.ModelSerializer):
    class Meta:
        model = GovernmentMemberDebate
        fields = '__all__'


class GuestDebateSerializer(serializers.ModelSerializer):
    class Meta:
        model = GuestDebate
        fields = '__all__'


class ApprovedTextSerializer(serializers.ModelSerializer):
    class Meta:
        model = ApprovedText
        fields = '__all__'


class DeputyAppealSerializer(serializers.ModelSerializer):
    class Meta:
        model = DeputyAppeal
        fields = '__all__'


class PartyAppealSerializer(serializers.ModelSerializer):
    class Meta:
        model = PartyAppeal
        fields = '__all__'


class RelatedInitiativeSerializer(serializers.ModelSerializer):
    class Meta:
        model = RelatedInitiative
        fields = '__all__'


class VoteSerializer(serializers.ModelSerializer):
    publications = PublicationSerializer(many=True, read_only=True)
    
    class Meta:
        model = Vote
        fields = '__all__'


class DebateSerializer(serializers.ModelSerializer):
    video_links = VideoLinkSerializer(many=True, read_only=True)
    deputies = DeputyDebateSerializer(many=True, read_only=True)
    government_members = GovernmentMemberDebateSerializer(many=True, read_only=True)
    guests = GuestDebateSerializer(many=True, read_only=True)
    
    class Meta:
        model = Debate
        fields = '__all__'


class CommissionSerializer(serializers.ModelSerializer):
    documents = CommissionDocumentSerializer(many=True, read_only=True)
    rapporteurs = RapporteurSerializer(many=True, read_only=True)
    received_opinions = OpinionSerializer(many=True, read_only=True)
    opinion_requests = OpinionRequestSerializer(many=True, read_only=True)
    hearings = HearingSerializer(many=True, read_only=True)
    audiences = AudienceSerializer(many=True, read_only=True)
    votes = CommissionVoteSerializer(many=True, read_only=True)
    final_draft_submissions = FinalDraftSubmissionSerializer(many=True, read_only=True)
    forwardings = ForwardingSerializer(many=True, read_only=True)
    
    class Meta:
        model = Commission
        fields = '__all__'


class PhaseSerializer(serializers.ModelSerializer):
    attachments = AttachmentSerializer(many=True, read_only=True)
    publications = PublicationSerializer(many=True, read_only=True)
    commissions = CommissionSerializer(many=True, read_only=True)
    debates = DebateSerializer(many=True, read_only=True)
    approved_texts = ApprovedTextSerializer(many=True, read_only=True)
    deputy_appeals = DeputyAppealSerializer(many=True, read_only=True)
    party_appeals = PartyAppealSerializer(many=True, read_only=True)
    related_initiatives = RelatedInitiativeSerializer(many=True, read_only=True)
    
    class Meta:
        model = Phase
        fields = '__all__'


# Basic serializer for summary view
class ProjetoLeiListSerializer(serializers.ModelSerializer):
    legislature = LegislatureSerializer(read_only=True)
    authors = AuthorSerializer(many=True, read_only=True)
    
    class Meta:
        model = ProjetoLei
        fields = [
            'external_id', 'title', 'type', 'legislature', 'date', 
            'initiative_number', 'authors'
        ]
        lookup_field = 'external_id'
        extra_kwargs = {
            'url': {'lookup_field': 'external_id'}
        }


# Serializer with limited phase data for medium detail
class ProjetoLeiDetailSerializer(serializers.ModelSerializer):
    legislature = LegislatureSerializer(read_only=True)
    authors = AuthorSerializer(many=True, read_only=True)
    phases = serializers.SerializerMethodField()
    votes = VoteSerializer(many=True, read_only=True)
    
    class Meta:
        model = ProjetoLei
        fields = '__all__'
        lookup_field = 'external_id'
        extra_kwargs = {
            'url': {'lookup_field': 'external_id'}
        }
    
    def get_phases(self, obj):
        # Return a simplified version of phases for this view
        phases = obj.phases.all().order_by('date')
        return PhaseBasicSerializer(phases, many=True).data

# Simplified Phase serializer for medium detail views
class PhaseBasicSerializer(serializers.ModelSerializer):
    class Meta:
        model = Phase
        fields = ['id', 'name', 'date', 'code', 'observation', 'phase']


# Full serializer for complete details
class ProjetoLeiFullSerializer(serializers.ModelSerializer):
    legislature = LegislatureSerializer(read_only=True)
    authors = AuthorSerializer(many=True, read_only=True)
    phases = PhaseSerializer(many=True, read_only=True)
    votes = VoteSerializer(many=True, read_only=True)
    related_initiatives = serializers.SerializerMethodField()
    
    class Meta:
        model = ProjetoLei
        fields = '__all__'
        lookup_field = 'external_id'
        extra_kwargs = {
            'url': {'lookup_field': 'external_id'}
        }
    
    def get_related_initiatives(self, obj):
        # Get related initiatives through the many-to-many relationship
        related = obj.related_to.all()
        return ProjetoLeiListSerializer(related, many=True).data