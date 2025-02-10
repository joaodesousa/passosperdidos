from rest_framework import serializers
from .models import ProjetoLei

class ProjetoLeiSerializer(serializers.ModelSerializer):
    class Meta:
        model = ProjetoLei
        fields = '__all__'