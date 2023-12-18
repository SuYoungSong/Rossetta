from rest_framework import serializers

from server.api.models import *


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
        return data

    def create(self, validated_data):
        password = validated_data.pop('password')
        user = User.objects.create_user()
        user.set_password(password)
        user.save()

        return


class question_board_Serailizer(serializers.ModelSerializer):
    class Meta:
        model = question_board
        fields = ['title', 'body']
    def validate(self, data):
        if not data['title'] or not data['body']:
            raise serializers.ValidationError("제목 또는 내용이 입력되어 있지 않습니다.")
        return data

    def create(self, data):
        return data


class question_board_comments_Serailizer(serializers.ModelSerializer):
    class Meta:
        model = question_board_comments
        fields = ['comment']

    def validate(self, data):
        if not data['commment']:
            raise serializers.ValidationError("내용이 입력되어 있지 않습니다.")
        return data

    def create(self, data):
        return data


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

