import warnings

from django.contrib.auth import authenticate
from django.contrib.auth import logout, login
from django.core.cache import cache
from django.core.mail import EmailMessage
from django.utils import timezone

from rest_framework.authtoken.models import Token
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from .models import User
from .serializers import UserDetailSerializer, UserCreateSerializer, UserUpdateSerializer
import random


# Create your views here.


# 모델명 + view
class UserView(APIView):
    # permission_classes = [IsAuthenticated]

    # 회원 정보 가져오기
    @action(detail=True, methods=['get'], permission_classes=[IsAuthenticated])  # get 함수를 사용할때 적용하는 권한 설정
    def get(self, request):
        id = request.query_params.get('id')  # url 에서 받아온 id 값
        try:
            user = User.objects.get(id=id)  # 정보를 보고 싶은 사용자 레코드
            serializer = UserDetailSerializer(user)  # 직렬화
        except user.DoesNotExist:
            return Response(data={"state": "회원 정보가 존재하지 않습니다"}, status=status.HTTP_404_NOT_FOUND)
        return Response(data=serializer.data, status=status.HTTP_200_OK)

    # 회원가입
    # 회원가입에 유저이름 id 비밀번호 비밀번호 확인 핸드폰번호 sms 문자 번호
    def post(self, request):
        serializer = UserCreateSerializer(data=request.data)  # post 로 받은 값을 직렬화
        if serializer.is_valid():  # 유효성 검사
            serializer.create(serializer.validated_data)  # 사용자 계정 생성
            return Response(data={"state": "회원가입을 축하드립니다."}, status=status.HTTP_201_CREATED)  # 정상 응답
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)  # 예외처리 응답

    # 회원정보 업데이트
    # @action(detail=True, methods=['put'], permission_classes=[IsAuthenticated])  # get 함수를 사용할때 적용하는 권한 설정
    def put(self, request, id):
        try:
            user = User.objects.get(id=id)  # 업데이트 할 사용자 정보 조회
            serializer = UserUpdateSerializer(user, data=request.data)  # 해당 사용자 정보 직렬화 + 유저가 변경하고 싶은 정보

            if serializer.is_valid():  # 유효성 검사
                serializer.update(user, serializer.validated_data)  # 사용자 정보 업데이트
                return Response(data={"state": "회원정보가 변경되었습니다."}, status=status.HTTP_200_OK)  # 정상 응답
            else:
                return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)  # 예외처리 응답
        except user.DoesNotExist:
            return Response(data={"state": "회원 정보가 존재하지 않습니다."}, status=status.HTTP_404_NOT_FOUND)

    # 회원 정보 delete
    @action(detail=True, methods=['delete'], permission_classes=[IsAuthenticated])  # get 함수를 사용할때 적용하는 권한 설정
    def delete(self, request, id):
        try:
            user = User.objects.get(id=id)  # 삭제하고 싶은 사용자 정보 조회
            user.delete()  # 사용자 정보 삭제
            return Response(status=status.HTTP_204_NO_CONTENT)  # 정상 응답
        except user.DoesNotExist:
            return Response(data={"state": "사용자가 존재하지 않습니다"}, status=status.HTTP_404_NOT_FOUND)


# 이메일 인증
class EmailSendView(APIView):
    def post(self, request):
        email = request.data.get('email')
        if email:
            six_digital_random = ''.join([str(random.randint(0, 9)) for _ in range(6)])
            unique_number = str(timezone.now()) + six_digital_random
            cache_key = f'email_data:{unique_number}'
            cache.set(cache_key, {'six_digital_random': six_digital_random}, 60 * 5)
            email = EmailMessage(
                subject='이메일 본인 인증 번호 입니다.',
                body=f"<ROSSETA>\n [{six_digital_random}] 인증번호를 5분내로 입력해주세요",
                to=['hh8262@naver.com'],
            )
            email.send()
            data = {
                "unique_number": unique_number,
                "six_digital_random": six_digital_random,
                "state": "5분 내로 인증 번호를 입력해주세요"
            }
            return Response(data=data, status=status.HTTP_200_OK)
        else:
            return Response(data={"state": "이메일 데이터를 입력해주세요"}, status=status.HTTP_404_NOT_FOUND)


class EmailCheckView(APIView):
    def post(self, request):
        unique_number = request.headers['uniquenumber']
        input_number = request.data.get('input_number')
        if unique_number and input_number:
            cache_key = f"email_data:{unique_number}"
            cache_data = cache.get(cache_key, None)
            if cache_data is not None:
                check = cache_data.get('six_digital_random', '')
                if input_number == check:
                    return Response(data={"is_auth": "true", "state": "이메일 인증 성공"}, status=status.HTTP_200_OK)
                else:
                    return Response(data={"state": "이메일 인증 실패"})
            else:
                return Response(data={"state": "5분이 지나 인증 번호를 다시 받아주세요"}, status=status.HTTP_404_NOT_FOUND)
        else:
            return Response(data={"state": "고유 번호 혹은 입력 번호가 존재하지 않습니다."}, status=status.HTTP_404_NOT_FOUND)


class UserLoginView(APIView):
    def post(self, request):
        id = request.data.get('id')  # 사용자가 입력한 아이디
        password = request.data.get('password')  # 사용자가 입력한 비밀번호
        if id and password:
            user = authenticate(username=id, password=password)  # 로그인과 비밀번호가 일치한 유저 레코드 찾기
            if user is not None:
                login(request, user)  # user 데이터가 존재하면 로그인
                token, created = Token.objects.get_or_create(user=user)  # 해당 유저 데이터를 기준으로 토큰값을 생성
                return Response(data={"token": token.key}, status=status.HTTP_200_OK)  # 해당 유저의 토큰값을 반환
            else:
                return Response(data={"error": "아이디나 비밀번호가 틀렸습니다."}, status=status.HTTP_400_BAD_REQUEST)  # user = None
        else:
            return Response(data={"error": "아이디나 비밀번호를 입력해주세요"},
                            status=status.HTTP_400_BAD_REQUEST)  # 입력받은 아이디나 비밀번호 데이터가 없는 경우


class UserLogoutView(APIView):
    def post(self, request):
        # Django 로그아웃
        logout(request)
        if request.auth:
            try:
                token = request.auth  # request header 에 저장된 Authorization 토큰값
                Token_obj = Token.objects.get(key=token)  # 해당 토큰값 레코드 반환
                Token_obj.delete()  # 해당 레코드 삭제
                return Response(status=status.HTTP_200_OK)  # 정상 응답
            except Token.DoesNotExist:
                return Response(status=status.HTTP_400_BAD_REQUEST)  # 해당 레코드가 존재하지 않을때
        else:
            return Response(data={"error": "error"}, status=status.HTTP_400_BAD_REQUEST)  # 토큰값이 존재하지 않을때

#   아이디 찾기
# class UserIDView(APIView):
#
#
#
#
# #   비밀번호 찾기
# class UserPasswordView(APIView):
