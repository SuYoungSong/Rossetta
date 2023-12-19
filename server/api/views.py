from django.shortcuts import render
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework import status
from server.api.models import User
from server.api.serializers import UserDetailSerializer, UserCreateSerializer


# Create your views here.


# 모델명 + view
class UserView(APIView):
    def get(self, request):
        queryset = User.objects.get(id=request.id)
        serializer = UserDetailSerializer(queryset)
        return Response(data=serializer, status=status.HTTP_200_OK)

    # 회원가입에 유저이름 id 비밀번호 비밀번호 확인 핸드폰번호 sms 문자 번호
    def post(self, request):
        serializer = UserCreateSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    