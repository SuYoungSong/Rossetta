from django.contrib.auth import authenticate
from django.contrib.auth import logout, login

from .email import email_data_set, email_data_get, key_data_get, email_send, email_return_json
from rest_framework.authtoken.models import Token
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from .models import User
from .serializers import UserDetailSerializer, UserCreateSerializer, UserUpdateSerializer, UserFindIDSerializer, \
    UserPasswordSerializer, UserChangePasswordSerializer


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
    # 회원가입에 유저이름 id 비밀번호 비밀번호 확인 이메일 인증
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
            return Response(data={"state": "정상 탈퇴 되었습니다."}, status=status.HTTP_204_NO_CONTENT)  # 정상 응답
        except user.DoesNotExist:
            return Response(data={"state": "사용자가 존재하지 않습니다"}, status=status.HTTP_404_NOT_FOUND)


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
                return Response(data={"state":"정상적으로 로그아웃 됐습니다."},status=status.HTTP_200_OK)  # 정상 응답
            except Token.DoesNotExist:
                return Response(status=status.HTTP_400_BAD_REQUEST)  # 해당 레코드가 존재하지 않을때
        else:
            return Response(data={"error": "error"}, status=status.HTTP_400_BAD_REQUEST)  # 토큰값이 존재하지 않을때


# 아이디 찾기 인증 코드 보내기
class UserIDEmailSendView(APIView):
    def post(self, request):
        email = request.data.get('email', None)  # 사용자가 입력한 이메일
        if email:
            try:
                user = User.objects.get(email=email)  # 이름 과 이메일이 동시 에 매칭되는 유저 조회
                unique_number, six_digital_random = email_data_set(type="find_id", time=300)  # 고유번호랑 난수 받아오기
                email_send(type="find_id", context_data=six_digital_random, email=email)  # 이메일 보내기
                data = email_return_json(unique_number)  # 인증 전송 정상 여부 JSON
                return Response(data=data, status=status.HTTP_200_OK)  # 정상 응답
            except user.DoesNotExist:
                return Response(data={"state": "이름과 이메일에 일치하는 유저가 존재하지 않습니다"}, status=status.HTTP_400_BAD_REQUEST)
        else:
            return Response(data={"state": "이름 혹은 이메일을 입력해주세요."}, status=status.HTTP_400_BAD_REQUEST)


# 비밀번호 찾기 인증 코드 보내기
class UserPasswordEmailSendView(APIView):
    def post(self, request):
        email = request.data.get('email', None)
        if email:
            try:
                user = User.objects.get(email=email)
                unique_number, six_digital_random = email_data_set(type="find_pw", time=300)
                email_send(type="find_pw", context_data=six_digital_random, email=email)
                data = email_return_json(unique_number=unique_number)
                return Response(data=data, status=status.HTTP_200_OK)
            except user.DoesNotExist:
                return Response(data={"state": "해당하는 유저 정보가 없습니다"}, status=status.HTTP_400_BAD_REQUEST)
        else:
            return Response(data={"state": "이름 , 아이디 , 이메일을 입력해주세요"}, status=status.HTTP_400_BAD_REQUEST)


# 회원가입 이메일 인증 코드 보내기
class SignUpSendView(APIView):
    def post(self, request):
        email = request.data.get('email')  # post 요청으로 사용자가 입력한 이메일
        if email:
            unique_number, six_digital_random = email_data_set(type="sign_up", time=300)
            email_send(type="sign_up", context_data=six_digital_random, email=email)
            data = email_return_json(unique_number=unique_number)
            return Response(data=data, status=status.HTTP_200_OK)
        else:
            return Response(data={"state": "이메일 데이터를 입력해주세요"},
                            status=status.HTTP_404_NOT_FOUND)  # 만약에 이메일 을 입력하지 않고 인증 버튼을 누를경우


# 이메일 인증 완료 API
class EmailCheckView(APIView):
    def post(self, request):
        unique_number = request.headers['uniquenumber']  # 이메일 인증번호 요청에서 보낸 고유 번호 (식별자)
        input_number = request.data.get('input_number')  # 사용자가 입력한 내용
        if unique_number and input_number:  # 고유번호랑 입력 받은 내용이 둘다 있어야함
            cache_data = email_data_get(unique_number)
            if cache_data is not None:  # cache data 가 존재하면
                check = key_data_get(cache_data, 'six_digital_random')  # 해당 데이터를 가져와서 입력 받은 값이랑 비교
                if input_number == check:
                    return Response(data={"is_auth": "true", "state": "이메일 인증 성공"}, status=status.HTTP_200_OK)  # 정상 응답
                else:
                    return Response(data={"state": "이메일 인증 실패"},
                                    status=status.HTTP_400_BAD_REQUEST)  # 데이터가 없거나 데이터가 맞지 않은 경우
            else:
                return Response(data={"state": "5분이 지나 인증 번호를 다시 받아주세요"},
                                status=status.HTTP_404_NOT_FOUND)  # 캐시 메모리 제한 시간이 끝난경우
        else:
            return Response(data={"state": "고유 번호 혹은 입력 번호가 존재하지 않습니다."},
                            status=status.HTTP_404_NOT_FOUND)  # 고유 번호나 입력번호 가 없는 경우


# 인증 완료된 아이디 찾기
class UserFindIDView(APIView):
    def post(self, request):
        serializer = UserFindIDSerializer(data=request.data)
        if serializer.is_valid():
            return Response(data={"id": serializer.data['id']}, status=status.HTTP_200_OK)
        return Response(data=serializer.errors, status=status.HTTP_400_BAD_REQUEST)


# 비밀번호 찾기 인증
class UserPasswordView(APIView):
    def post(self, request):
        serialzier = UserPasswordSerializer(data=request.data)  # 직렬화
        if serialzier.is_valid():
            data = serialzier.validated_data  # 직렬화 된 데이터
            id = request.data.get('id', None)
            if id is not None:
                is_user = User.objects.filter(id=id, name=data['name'],
                                              email=data['email']).exists()  # 해당 유저 존재 여부만 확인 하기
                if is_user:
                    return Response(data={"id": request.data['id'], "state": "해당 이용자가 존재합니다 변경할 비밀번호를 입력해주세요"},
                                    # 해당 유저가 존재하면 입력 받은 id Response
                                    status=status.HTTP_200_OK)
                else:
                    return Response(data={"state": "요청하신 데이터 의 유저가 존재하지 않습니다"},
                                    status=status.HTTP_404_NOT_FOUND)  # 존재하지 않을 경우
            else:
                return Response(data={"state": "id 정보를 입력해주세요"}, status=status.HTTP_400_BAD_REQUEST)
        return Response(data=serialzier.errors, status=status.HTTP_400_BAD_REQUEST)


# 인증 완료된 비밀번호 변경
class UserChangePasswordView(APIView):
    def put(self, request):
        id = request.data.get('id', None)  # id 데이터 조회
        if id:
            try:
                user = User.objects.get(id=id)  # id 가 존재 한다면
                serializer = UserChangePasswordSerializer(user, data=request.data)  # serializer 실행
                if serializer.is_valid():  # 유효성 검사
                    serializer.update(user, serializer.validated_data)  # 계정 업데이트
                    return Response(data={"state": "데이터가 정상적으로 변경되었습니다"}, status=status.HTTP_200_OK)
                else:  # 예외처리 에러
                    return Response(data=serializer.errors, status=status.HTTP_400_BAD_REQUEST)
            except user.DoesNotExist:  # DB 조회되는 데이터가 없을떄
                return Response(data={"state": "요청하신 데이터의 유저가 존재하지 않습니다"}, status=status.HTTP_404_NOT_FOUND)
        else:  # id 가 존재하지 않다면
            return Response(data={"state": "id 정보를 입력해주세요"}, status=status.HTTP_404_NOT_FOUND)
