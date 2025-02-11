from rest_framework import serializers
from .models import ProjetoLei, Phase



class PhaseSerializer(serializers.ModelSerializer):
    class Meta:
        model = Phase
        fields = ['id', 'name', 'date']  # Only include needed fields

class ProjetoLeiSerializer(serializers.ModelSerializer):
    phases = PhaseSerializer(many=True, read_only=True)

    class Meta:
        model = ProjetoLei
        fields = ['id', 'title', 'type', 'legislature', 'date', 'link', 'author', 'description', 'external_id', 'phases']