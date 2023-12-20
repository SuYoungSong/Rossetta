from django.contrib.auth import authenticate
from django.shortcuts import render
from rest_framework.authtoken.models import Token
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework import status
from .models import User
from .serializers import UserDetailSerializer, UserCreateSerializer, UserUpdateSerializer, UserLoginSerializer


# Create your views here.


# 모델명 + view
class UserView(APIView):
    # 회원 정보 가져오기
    def get(self, request):
        id = request.query_params.get('id')
        user = User.objects.get(id=id)
        serializer = UserDetailSerializer(user)  # 수정된 부분
        return Response(data=serializer.data, status=status.HTTP_200_OK)

    # 회원가입
    # 회원가입에 유저이름 id 비밀번호 비밀번호 확인 핸드폰번호 sms 문자 번호
    def post(self, request):
        serializer = UserCreateSerializer(data=request.data)
        if serializer.is_valid():
            serializer.create(serializer.validated_data)
            return Response(status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    # 회원정보 업데이트
    def put(self, request, id):
        user = User.objects.get(id=id)
        serializer = UserUpdateSerializer(user, data=request.data)

        if serializer.is_valid():
            serializer.update(user, serializer.validated_data)
            return Response(data=serializer.data, status=status.HTTP_200_OK)

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    # 회원 정보 delete
    def delete(self, request, id):
        user = User.objects.get(id=id)
        user.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)


class UserLoginView(APIView):
    def post(self, request):
        id = request.data.get('id')
        password = request.data.get('password')

        if id and password:
            user = authenticate(username=id, password=password)
            if user is not None:
                token, created = Token.objects.get_or_create(user=user)
                return Response(data={"token": token.key}, status=status.HTTP_200_OK)
            else:
                return Response(data={"error": "해당 유저가 존재하지 않습니다"}, status=status.HTTP_400_BAD_REQUEST)

        else:
            return Response(data={"error": "아이디나 비밀번호를 입력해주세요"}, status=status.HTTP_400_BAD_REQUEST)
