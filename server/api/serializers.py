from rest_framework import serializers

from server.api.models import User


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
