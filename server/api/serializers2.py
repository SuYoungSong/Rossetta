from rest_framework import serializers
from .models import *


class PaperTypeSituationSerializer(serializers.ModelSerializer):
    class Meta:
        model = paper
        fields = ['situation']




class PaperTypeSituationChapterSerializer(serializers.ModelSerializer):
    class Meta:
        model = paper
        fields = ['chapter']


class PaperDataSerializer(serializers.ModelSerializer):
    class Meta:
        model = paper
        fields = '__all__'


class PracticeNoteSerializer(serializers.ModelSerializer):
    class Meta:
        model = practice_note
        fields = '__all__'
