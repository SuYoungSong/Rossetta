from rest_framework import serializers

from .models import *
import re
from django.utils import timezone


def password_match(password):
    pattern = r"^(?=.*[A-Z])(?=.*[a-z])(?=.*\d)(?=.*[\W_]).{8,}$"
    return re.match(pattern, password)


class UserUpdateSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, style={'input_type': 'password'}, required=False)
    password_check = serializers.CharField(write_only=True, style={'input_type': 'password'}, required=False)

    class Meta:
        model = User
        fields = ['name', 'password', 'password_check', 'phone']

    def validate(self, data):
        if 'password' in data and 'password_check' not in data:
            raise serializers.ValidationError("비밀번호를 변경하기 위해서는 비밀번호 확인도 입력이 필요합니다.")
        if 'password' in data and data['password'] != data.pop('password_check'):
            raise serializers.ValidationError("비밀번호와 비밀번호 확인이 맞지않습니다.")
        if not password_match(data['password']):
            raise serializers.ValidationError("비밀번호 규칙에 맞춰서 작성해주세요")
        if not data['phone'].isdigit():
            raise serializers.ValidationError("전화번호를 확인해주세요")
        return data

    def update(self, instance, validated_data):
        password = validated_data.pop('password', None)
        if password:
            instance.set_password(password)
        return super().update(instance, validated_data)


class UserDetailSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'name', 'phone']


class UserCreateSerializer(serializers.ModelSerializer):
    password_check = serializers.CharField(write_only=True, style={'input_type': 'password'}, required=True)

    # write_only , read_only ,style , required
    # auth_phone_check = serializers.CharField()

    class Meta:
        model = User
        fields = ['id', 'password', 'password_check', 'name', 'phone']

    def validate(self, data):
        if data['password'] != data.pop('password_check'):
            raise serializers.ValidationError("비밀번호와 비밀번호 확인이 맞지않습니다.")
        if User.objects.filter(id=data['id']).exists():
            raise serializers.ValidationError("이미 존재하는 아이디 입니다.")
        if not password_match(data['password']):
            raise serializers.ValidationError("비밀번호 규칙에 맞춰서 작성해주세요")
        if not data['phone'].isdigit():
            raise serializers.ValidationError("전화번호를 확인해주세요")

        return data

    def create(self, validated_data):
        password = validated_data.pop('password')
        user = User.objects.create_user(**validated_data)
        user.set_password(password)
        user.save()
        return user


class QuestionCreateSerializer(serializers.ModelSerializer):
    title = serializers.CharField(required=True)
    body = serializers.CharField(required=True)

    class Meta:
        model = question_board
        fields = ['user', 'title', 'body']  # 여기는 무조건 수정

    def validate(self, data):
        if not data['title'] or not data['body']:
            raise serializers.ValidationError('title 또는 body 의 내용이 비어있습니다.')
        return data

    def create(self, validated_data):
        post = question_board.objects.create(**validated_data)
        return post


class QuestionDetailSerializer(serializers.ModelSerializer):
    class Meta:
        model = question_board
        fields = ['user', 'title', 'body', 'created']


class QuestionUpdateSerializer(serializers.ModelSerializer):
    body = serializers.CharField(required=False)
    title2 = serializers.CharField(required=False)

    class Meta:
        model = question_board
        fields = ['title2', 'body']

    def validate(self, data):
        if data['title2'] and not data['body']:
            raise serializers.ValidationError("본문에 내용을 입력해주세요")
        if not data['title2'] and data['body']:
            raise serializers.ValidationError("변경된 게시글 제목을 입력해주세요")
        return data

    def update(self, instance, validated_data):
        title2 = validated_data.pop('title2', None)
        body = validated_data.pop('body', None)

        if title2 and body:
            instance.title = title2
            instance.body = body
        if not title2 and not body:
            print("업데이트 변화 없음")
        instance.created = timezone.now()
        return super().update(instance, validated_data)


class QuestionListSerializer(serializers.ModelSerializer):
    class Meta:
        model = question_board
        fields = ['user', 'title', 'state', 'created']


class education_report_Serailizer(serializers.ModelSerializer):
    class Meta:
        model = education_report
        fields = ['user', 'chapter']

# class paper_Serailizer(serializers.Serializer):
#
#     class Meta:
#         model = paper
#         fields = ['sign_video_url','sign_answer']
#
#     def validate(self, data):
#         if not data['sign_answer']:
#             raise serializers.ValidationError("내용이 입력되어 있지 않습니다.")
#         if data['sign_answer'] != data.pop[]
#         return data
