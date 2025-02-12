from rest_framework import serializers
from .models import ProjetoLei, Phase, Vote, Author, Attachment, Legislature


class VoteSerializer(serializers.ModelSerializer):
    class Meta:
        model = Vote
        fields = ['date', 'result', 'details']  # Include necessary fields


class AuthorSerializer(serializers.ModelSerializer):
    class Meta:
        model = Author
        fields = ['name', 'party', 'author_type']  # Include necessary fields


class AttachmentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Attachment
        fields = ['name', 'file_url']  # Include necessary fields


class PhaseSerializer(serializers.ModelSerializer):
    class Meta:
        model = Phase
        fields = ['id', 'name', 'date']  # Only include needed fields


class ProjetoLeiSerializer(serializers.ModelSerializer):
    phases = PhaseSerializer(many=True, read_only=True)
    authors = AuthorSerializer(many=True, read_only=True)
    votes = VoteSerializer(many=True, read_only=True)
    attachments = AttachmentSerializer(many=True, read_only=True)

    class Meta:
        model = ProjetoLei
        fields = [
            'id', 'title', 'type', 'legislature', 'date', 'link', 'authors', 'description',
            'external_id', 'phases', 'votes', 'attachments', 'publication_url', 'publication_date'
        ]
