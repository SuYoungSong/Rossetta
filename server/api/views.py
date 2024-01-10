import json
import random

from django.contrib.auth import authenticate
from django.contrib.auth import logout, login
from django.core.serializers.json import DjangoJSONEncoder
from django.utils import timezone
from .email import email_data_set, email_data_get, key_data_get, email_send, email_return_json
from rest_framework.authtoken.models import Token
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from .serializers import *
from .permissions import *
from .models import practice_note
# from .preprocessing import *
import numpy as np
import tensorflow as tf


# 로그인 서버 시간 갱신 API
class RenewalTokenTimeView(APIView):
    permission_classes = [IsAuthenticated, IsTokenOwner]

    def post(self, request):  # ex) 서버에서 새로고침이나 페이지 이동시
        token_info = request.headers['Authorization']
        user_token = token_info.split(' ')[-1]
        renewal_time = timezone.now()  # ex) 서버에서 제공하는 현재 시간
        try:
            user = Token.objects.get(key=user_token)  # 사용자가 작업중인 로그인 정보
            user.created = renewal_time  # 사용중인 토큰 시간 갱신
            user.save()
        except Token.DoesNotExist:
            return Response(data={"state": "로그인 한 유저의 정보가 존재하지 않습니다"}, status=status.HTTP_404_NOT_FOUND)
        return Response(data={"token": user_token, "renewal_time": renewal_time}, status=status.HTTP_200_OK)


# 모델명 + view
class UserView(APIView):

    # 회원 정보 가져오기
    @action(detail=True, methods=['get'], permission_classes=[IsAuthenticated, IsTokenOwner])  # get 함수를 사용할때 적용하는 권한 설정
    def get(self, request):
        id = request.query_params.get('id')  # url 에서 받아온 id 값
        if id != request.user.id:
            return Response(data={"state": "다른 이용자의 정보입니다 열람 하실수 없습니다."})
        try:
            user = User.objects.get(id=id)  # 정보를 보고 싶은 사용자 레코드
            serializer = UserDetailSerializer(user)  # 직렬화
        except user.DoesNotExist:
            return Response(data={"state": "회원 정보가 존재하지 않습니다"}, status=status.HTTP_404_NOT_FOUND)
        return Response(data=serializer.data, status=status.HTTP_200_OK)

    # 회원가입
    # 회원가입에 유저이름 id 비밀번호 비밀번호 확인 이메일 인증
    def post(self, request):
        id = request.data.get('id', None)
        serializer = UserCreateSerializer(data=request.data)  # post 로 받은 값을 직렬화
        if User.objects.filter(id=id).exists():
            return Response(data={"state": "이미 사용중인 아이디 입니다."}, status=status.HTTP_400_BAD_REQUEST)
        if serializer.is_valid():  # 유효성 검사
            serializer.create(serializer.validated_data)  # 사용자 계정 생성
            return Response(data={"state": "회원가입을 축하드립니다."}, status=status.HTTP_201_CREATED)  # 정상 응답
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)  # 예외처리 응답

    # 회원정보 업데이트
    @action(detail=True, methods=['put'], permission_classes=[IsAuthenticated, IsTokenOwner])
    def put(self, request):
        id = request.data.get('id')  # body 에 존재하는 이용자가 요청한 id 값

        if id != request.user.id:  # id 와 request 요청으로 들어온 id 의 정보가 다르면 수정 불가
            return Response(data={"state": "다른 사용자의 아이디 입니다 수정할수 없습니다"}, status=status.HTTP_400_BAD_REQUEST)
        try:
            user = User.objects.get(id=id)  # 업데이트 할 사용자 정보 조회
            serializer = UserUpdateSerializer(user, data=request.data,
                                              context={'request': request})  # 해당 사용자 정보 직렬화 + 유저가 변경하고 싶은 정보

            if serializer.is_valid():  # 유효성 검사
                serializer.update(user, serializer.validated_data)  # 사용자 정보 업데이트
                return Response(data={"state": "회원정보가 변경되었습니다."}, status=status.HTTP_200_OK)  # 정상 응답
            else:
                return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)  # 예외처리 응답
        except user.DoesNotExist:
            return Response(data={"state": "회원 정보가 존재하지 않습니다."}, status=status.HTTP_404_NOT_FOUND)

    # 회원 정보 delete
    @action(detail=True, methods=['delete'],
            permission_classes=[IsAuthenticated, IsTokenOwner])  # get 함수를 사용할때 적용하는 권한 설정
    def delete(self, request):
        token = request.headers['Authorization']
        auth_token = token.split(' ')[-1]
        auth_token_user = Token.objects.get(key=auth_token).user_id

        if auth_token_user != request.user.id:  # url 에서 받아온 id 와 request 요청으로 들어온 아이디가 다를시에도 탈퇴 불가
            return Response(data={"state": "다른 사용자의 아이디 입니다. 계정 탈퇴할수 없습니다"}, status=status.HTTP_400_BAD_REQUEST)
        try:
            user = User.objects.get(id=auth_token_user)  # 삭제하고 싶은 사용자 정보 조회
            user.delete()  # 사용자 정보 삭제
            return Response(data={"state": "정상 탈퇴 되었습니다."}, status=status.HTTP_204_NO_CONTENT)  # 정상 응답
        except User.DoesNotExist:
            return Response(data={"state": "사용자가 존재하지 않습니다"}, status=status.HTTP_404_NOT_FOUND)


# 아이디 중복 확인 API
class IDCheckDuplicationView(APIView):
    def post(self, request):
        id = request.data.get('id', None)
        serializer = IDCheckDuplicateSerializer(data=request.data)
        if User.objects.filter(id=id).exists():
            return Response(data={"state": "이미 사용중인 아이디 입니다."}, status=status.HTTP_400_BAD_REQUEST)
        if serializer.is_valid():
            return Response(data={"state": "사용가능한 아이디 입니다."}, status=status.HTTP_200_OK)
        return Response(data=serializer.errors, status=status.HTTP_400_BAD_REQUEST)


# 토큰 유저 + 비밀번호 -> user 가 있는지
class TokenPasswordUserCheckView(APIView):
    permission_classes = [IsAuthenticated, IsTokenOwner]

    def post(self, request):
        token_info = request.headers['Authorization']
        password = request.data.get('password')  # 기존 비밀번호
        user_token = token_info.split(' ')[-1]
        if password is not None:
            try:
                user_info = Token.objects.get(key=user_token).user_id
                if authenticate(username=user_info, password=password) is not None:
                    return Response(data={"state": "아이디 와 비밀번호 가 일치한 유저가 존재합니다."}, status=status.HTTP_200_OK)
                else:
                    return Response(data={"state": "아이디와 기존 비밀번호에 해당하는 유저가 존재하지 않습니다."},
                                    status=status.HTTP_404_NOT_FOUND)
            except Token.DoesNotExist:
                return Response(data={"state": "토큰에 해당하는 유저가 존재 하지 않습니다"}, status=status.HTTP_404_NOT_FOUND)
        else:
            return Response(data={"state": "비밀번호를 입력해주세요"}, status=status.HTTP_400_BAD_REQUEST)


# 로그인 API
class UserLoginView(APIView):
    def post(self, request):
        id = request.data.get('id')  # 사용자가 입력한 아이디
        password = request.data.get('password')  # 사용자가 입력한 비밀번호
        if id and password:
            user = authenticate(username=id, password=password)  # 로그인과 비밀번호가 일치한 유저 레코드 찾기
            if user is not None:
                login(request, user)  # user 데이터가 존재하면 로그인
                token, created = Token.objects.get_or_create(user=user)  # 해당 유저 데이터를 기준으로 토큰값을 생성
                return Response(data={"token": token.key, "name": user.name, 'is_staff': user.is_staff},
                                status=status.HTTP_200_OK)  # 해당 유저의 토큰값을 반환
            else:
                return Response(data={"error": "아이디나 비밀번호가 틀렸습니다."}, status=status.HTTP_400_BAD_REQUEST)  # user = None
        else:
            return Response(data={"error": "아이디나 비밀번호를 입력해주세요"},
                            status=status.HTTP_400_BAD_REQUEST)  # 입력받은 아이디나 비밀번호 데이터가 없는 경우


# 로그아웃 API
class UserLogoutView(APIView):
    def post(self, request):
        # Django 로그아웃
        logout(request)
        if request.auth:
            try:
                token = request.auth  # request header 에 저장된 Authorization 토큰값
                Token_obj = Token.objects.get(key=token)  # 해당 토큰값 레코드 반환
                Token_obj.delete()  # 해당 레코드 삭제
                return Response(data={"state": "정상적으로 로그아웃 됐습니다."}, status=status.HTTP_200_OK)  # 정상 응답
            except Token.DoesNotExist:
                return Response(status=status.HTTP_400_BAD_REQUEST)  # 해당 레코드가 존재하지 않을때
        else:
            return Response(data={"error": "error"}, status=status.HTTP_400_BAD_REQUEST)  # 토큰값이 존재하지 않을때


# 자동 로그아웃 API
class AutoLogoutView(APIView):
    permission_classes = [IsAuthenticated, IsTokenOwner]

    def post(self, request):
        token_info = request.headers['Authorization']
        user_token = token_info.split(' ')[-1]
        current_time = timezone.now()
        try:
            user = Token.objects.get(key=user_token)  # 현재 로그인된 정보
            login_time = user.created  # 갱신된 시간 정보
            diff_time = current_time - login_time  # 현재 시간에서 - 갱신 시간
            diff_time = diff_time.seconds  # 초로 변환
            if diff_time > 3600:  # 차이 시간 이 3600초 = 1시간 이면 False 값 Response
                return Response(data={"state": "제한시간 1시간이 지나 자동 로그아웃 됩니다", "bool": False},
                                status=status.HTTP_404_NOT_FOUND)
            return Response(data={"state": "제한시간을 넘기지 않았습니다", "bool": True, "Time_Remain": f'{diff_time}초'},
                            status=status.HTTP_200_OK)
        except Token.DoesNotExist:
            return Response(data={"state": "로그인한 유저 정보가 없습니다."}, status=status.HTTP_404_NOT_FOUND)


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
            except User.DoesNotExist:
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
            except User.DoesNotExist:
                return Response(data={"state": "해당하는 유저 정보가 없습니다"}, status=status.HTTP_400_BAD_REQUEST)
        else:
            return Response(data={"state": "이메일 정보를 입력해주세요."}, status=status.HTTP_400_BAD_REQUEST)


# 회원가입 이메일 인증 코드 보내기
class SignUpSendView(APIView):
    def post(self, request):
        email = request.data.get('email')  # post 요청으로 사용자가 입력한 이메일
        if email:
            if User.objects.filter(email=email).exists():
                return Response(data={"state": "이미 존재하는 이메일입니다."}, status=status.HTTP_400_BAD_REQUEST)
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
        name = request.data.get('name',None)
        email = request.data.get('email',None)
        if not name or not email:
            return Response(data={"state":"이름 , 이메일 정보를 입력해주세요"} , status=status.HTTP_400_BAD_REQUEST)
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
            except User.DoesNotExist:  # DB 조회되는 데이터가 없을떄
                return Response(data={"state": "요청하신 데이터의 유저가 존재하지 않습니다"}, status=status.HTTP_404_NOT_FOUND)
        else:  # id 가 존재하지 않다면
            return Response(data={"state": "id 정보를 입력해주세요"}, status=status.HTTP_404_NOT_FOUND)


# 게시글 관련 API
class QuestionView(APIView):
    @action(detail=True, methods=['get'], permission_classes=[IsAuthenticated, IsTokenOwner, IsUserOwner])
    def get(self, request, id):
        # 질문에 대한 정보를 필터링 하기위한 파라미터
        # 질문에 관한 데이터만 가져온다
        try:
            question = question_board.objects.get(id=id)
            data = dict()
            data['user'] = question.user_id
            data['title'] = question.title
            data['body'] = question.body
            data['created'] = question.created
            if question_board_images.objects.filter(board_id=id).exists():
                images_info = question_board_images.objects.filter(board_id=id)
                images = []
                for image in images_info:
                    images.append(image.image_url.url)
                data['images'] = images
            return Response(data=data, status=status.HTTP_200_OK)
        except question_board.DoesNotExist:
            return Response(data={"state": "게시글 정보가 존재하지 않습니다"}, status=status.HTTP_404_NOT_FOUND)

    @action(detail=True, methods=['post'], permission_classes=[IsAuthenticated, IsTokenOwner, IsUserOwner])
    def post(self, request):
        id = request.data.get('user', None)
        if id != request.user.id:
            return Response(data={"state": "작성자 아이디 가 로그인한 아이디와 다릅니다"}, status=status.HTTP_400_BAD_REQUEST)
        serializer = QuestionCreateSerializer(data=request.data, context={'request': request})
        if serializer.is_valid():
            serializer.create(validated_data=serializer.validated_data)
            return Response(data={'state': "게시글이 정상적으로 작성되었습니다."},
                            status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    @action(detail=True, methods=['put'], permission_classes=[IsAuthenticated, IsTokenOwner, IsUserOwner])
    def put(self, request, id):
        try:
            question = question_board.objects.get(id=id)  # user , title , body , state create
            serializer = QuestionUpdateSerializer(question, data=request.data, context={"request": request})

            if serializer.is_valid():
                serializer.update(question, serializer.validated_data)
                return Response(data={"state": "게시글이 정상적으로 수정되었습니다"}, status=status.HTTP_200_OK)
        except question_board.DoesNotExist:
            return Response(data={"state": "게시글 정보가 존재하지 않습니다"}, status=status.HTTP_404_NOT_FOUND)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    @action(detail=True, methods=['delete'], permission_classes=[IsAuthenticated, IsTokenOwner, IsUserOwner])
    def delete(self, request, id):
        token = request.headers['Authorization']
        token_user = token.split(' ')[-1]
        req_user_id = Token.objects.get(key=token_user).user_id
        user_info = User.objects.get(id=req_user_id)
        if user_info.is_staff:
            return Response({"state": "관리자 는 게시글을 삭제 할수 없습니다."}, status=status.HTTP_400_BAD_REQUEST)
        try:
            user = question_board.objects.get(id=id)
            user.delete()
            return Response(data={"state": "게시글이 정상적으로 삭제 되었습니다."}, status=status.HTTP_204_NO_CONTENT)
        except question_board.DoesNotExist:
            return Response(data={"state": "게시글 정보가 존재하지 않습니다"}, status=status.HTTP_404_NOT_FOUND)


class QuestionListView(APIView):
    @action(detail=True, methods=['get'], permission_classes=[IsAuthenticated, IsTokenOwner, IsUserOwner])
    def get(self, request, id):
        if id != request.user.id:
            return Response(data={"state": "로그인된 아이디와 요청하신 아이디 정보가 다릅니다 접근할수 없습니다"}, status=status.HTTP_400_BAD_REQUEST)
        queryset = question_board.objects.filter(user=id)
        serializers = QuestionListSerializer(queryset, many=True)
        return Response(data=serializers.data, status=status.HTTP_200_OK)


class AdminQuestionListView(APIView):
    permission_classes = [IsAuthenticated, IsTokenOwner, IsStaffOwner]

    def get(self, request):
        if not request.user.is_staff:
            return Response(data={"state": "관리자 만 사용할수 있습니다"}, status=status.HTTP_400_BAD_REQUEST)
        queryset = question_board.objects.all()
        serializers = QuestionListSerializer(queryset, many=True)
        return Response(data=serializers.data, status=status.HTTP_200_OK)


class QuestionCommentCreateView(APIView):
    @action(detail=True, methods=['post'], permission_classes=[IsAuthenticated, IsTokenOwner, IsStaffOwner])
    def post(self, request):
        board = request.data.get('board')
        comment = request.data.get('comment')
        if is_null(board) or is_null(comment):
            return Response(data={"state": "게시글 , 댓글 정보를 입력해주세요"}, status=status.HTTP_400_BAD_REQUEST)
        board_id = int(board)
        # count = question_board.objects.all().count()

        if not question_board.objects.filter(id=board_id).exists():
            return Response(data={"state": "게시글 정보가 존재하지 않습니다"}, status=status.HTTP_404_NOT_FOUND)
        board_info = question_board.objects.get(id=board_id)
        if board_info.state:
            return Response(data={"state": "해결된 문의 입니다"}, status=status.HTTP_400_BAD_REQUEST)
        serializers = QuestionCommentCreateSerializer(data=request.data, context={'request': request})
        if serializers.is_valid():
            serializers.create(serializers.validated_data)
            return Response(data={"state": "댓글 작성이 완료되었습니다"}, status=status.HTTP_201_CREATED)
        return Response(data=serializers.errors, status=status.HTTP_400_BAD_REQUEST)


class QuestionCommentDetailView(APIView):
    permission_classes = [IsAuthenticated, IsTokenOwner]

    def post(self, request):
        board_id = request.data.get('board')
        if board_id is None:
            return Response(data={"state": "게시글 정보를 입력해주세요"}, status=status.HTTP_400_BAD_REQUEST)
        try:
            comment = question_board_comments.objects.get(board_id=board_id)
            return Response(data={"comment": comment.comment}, status=status.HTTP_200_OK)
        except question_board_comments.DoesNotExist:
            return Response(data={"state": "댓글 정보가 존재하지 않습니다"}, status=status.HTTP_404_NOT_FOUND)


##########################################################################
################################ Paper ###################################
##########################################################################
class PaperTypeSituationView(APIView):
    '''
    GET: 타입(단어, 문장)이 들어오면 DB에 있는 상황(은행, 학교, 병원)들을 반환해준다.
    '''

    def get(self, request, type):
        try:
            qs = paper.objects.filter(type=type).distinct().values('situation')
            serializer = PaperTypeSituationSerializer(qs, many=True)
            return Response(serializer.data)
        except paper.DoesNotExist:
            return Response({"error": f"'{type}' 유형에 대한 데이터가 없습니다."}, status=status.HTTP_404_NOT_FOUND)


class PaperTypeChapterSentenceView(APIView):
    '''
    GET : 타입 (문장) 이 들어오면 챕터 정보를 반환해준다.
    '''

    def get(self, request, type):
        try:
            qs = paper.objects.filter(type=type).distinct().values('chapter')
            serializers = PaperTypeChapterSentenceSerializer(qs, many=True)
            max_chapter = max(serializers.data, key=lambda x: x['chapter'])['chapter']
            return Response(data={"chapter": max_chapter}, status=status.HTTP_200_OK)
        except paper.DoesNotExist:
            return Response({"error": f"'{type}' 유형에 대한 데이터가 없습니다."},
                            status=status.HTTP_404_NOT_FOUND)


class PaperTypeSituationChapterWordView(APIView):
    '''
    GET: 타입(단어, 문장)과 상황 들어오면 챕터 정보를 반환해준다.
    '''

    def get(self, request, type, situation):
        try:
            qs = paper.objects.filter(type=type, situation=situation).distinct().values('chapter')
            serializer = PaperTypeSituationChapterWordSerializer(qs, many=True)
            max_chapter = max(serializer.data, key=lambda x: x['chapter'])['chapter']
            return Response(data={"chapter": max_chapter}, status=status.HTTP_200_OK)
        except paper.DoesNotExist:
            return Response({"error": f"'{type}' 유형과 '{situation}' 상황에 대한 데이터가 없습니다."},
                            status=status.HTTP_404_NOT_FOUND)


class PaperOneDataView(APIView):
    '''
    GET: 문제 번호가 들어오면 해당 문제를 반환한다.
    '''

    def get(self, request, id):
        try:
            qs = paper.objects.get(id=int(id))
            serializer = PaperDataSerializer(qs)
            return Response(serializer.data)
        except paper.DoesNotExist:
            return Response({"error": f"ID '{id}'에 대한 데이터가 없습니다."}, status=status.HTTP_404_NOT_FOUND)


class PaperManyDataWordView(APIView):
    '''
    GET: 특정 유형(문장,단어,자음모음)와 상황(병원,학교)와 챕터가 오면 그 챕터에 속한 문제들을 반환한다.
    '''

    def get(self, request, type, situation, chapter):
        try:
            qs = paper.objects.filter(type=type, situation=situation, chapter=chapter)
            serializer = PaperDataWordSerializer(qs, many=True)
            return Response(serializer.data)
        except paper.DoesNotExist:
            return Response({"error": f"'{type}' 유형, '{situation}' 상황, '{chapter}' 챕터에 대한 데이터가 없습니다."},
                            status=status.HTTP_404_NOT_FOUND)
        except ValueError:
            return Response({"error": "챕터는 정수값이어야 합니다."}, status=status.HTTP_400_BAD_REQUEST)


class PaperManyDataSentenceView(APIView):
    '''
    GET : 문장 + 챕터 -> 챕터에 있는 문제 리스트 조회
    '''

    def get(self, request, type, chapter):
        try:
            qs = paper.objects.filter(type=type, chapter=chapter)
            serializer = PaperDataSentenceSerializer(qs, many=True)
            return Response(serializer.data)
        except paper.DoesNotExist:
            return Response({"error": f"'{type}' 상황, '{chapter}' 챕터에 대한 데이터가 없습니다."},
                            status=status.HTTP_404_NOT_FOUND)
        except ValueError:
            return Response({"error": "챕터는 정수값이어야 합니다."}, status=status.HTTP_400_BAD_REQUEST)


##########################################################################
############################ PracticeNote ################################
##########################################################################
class WordPlacticeNoteView(APIView):
    permission_classes = [IsAuthenticated, IsTokenOwner]

    def get(self, request):
        type = request.GET.get('type')
        situation = request.GET.get('situation')
        chapter = request.GET.get('chapter')
        user_id = request.GET.get('user_id')
        is_deaf = request.GET.get('is_deaf')
        try:
            practice_notes = practice_note.objects.select_related('paper').filter(
                paper__type=type,
                paper__situation=situation,
                paper__chapter=chapter,
                user=user_id,
                is_deaf=is_deaf,
                is_answer=False
            )
            serializer = PracticeNoteSerializer(practice_notes, many=True)
            return Response(serializer.data)
        except practice_note.DoesNotExist:
            return Response({"error": "해당하는 데이터가 없습니다."}, status=status.HTTP_404_NOT_FOUND)


class SentencePlacticeNoteView(APIView):
    permission_classes = [IsAuthenticated, IsTokenOwner]

    def get(self, request):
        type = request.GET.get('type')
        chapter = request.GET.get('chapter')
        user_id = request.GET.get('user_id')
        is_deaf = request.GET.get('is_deaf')
        try:
            practice_notes = practice_note.objects.select_related('paper').filter(
                paper__type=type,
                paper__chapter=chapter,
                user=user_id,
                is_deaf=is_deaf,
                is_answer=False
            )
            serializer = PracticeNoteSerializer(practice_notes, many=True)
            return Response(serializer.data)
        except practice_note.DoesNotExist:
            return Response({"error": "해당하는 데이터가 없습니다."}, status=status.HTTP_404_NOT_FOUND)


class PracticeNoteView(APIView):
    '''
    GET: 특정 유저 + 특장 싱황 + 특정 챕터별 틀린문제를 return

    POST: 새로운 문제를 푼 경우 DB에 정답(오답) 기록을 추가한다.

    PUT: 기존 오답 이였던 문제를 정답으로 바꾼다.
    '''
    permission_classes = [IsAuthenticated, IsTokenOwner]

    def get(self, request):
        type = request.GET.get('type')
        situation = request.GET.get('situation')
        chapter = request.GET.get('chapter')
        user_id = request.GET.get('user_id')
        is_deaf = request.GET.get('is_deaf')
        try:
            practice_notes = practice_note.objects.select_related('paper').filter(
                paper__type=type,
                paper__situation=situation,
                paper__chapter=chapter,
                user=user_id,
                is_deaf=is_deaf,
                is_answer=False
            )
            serializer = PracticeNoteSerializer(practice_notes, many=True)
            return Response(serializer.data)
        except practice_note.DoesNotExist:
            return Response({"error": "해당하는 데이터가 없습니다."}, status=status.HTTP_404_NOT_FOUND)

    def post(self, request):  # 중복 문제 발생 -> 한 문제 를 같은 사람이 여러번 푸는것이 record 에 남는다
        paper_id = request.data.get('paper', None)  # 정수
        user = request.data.get('user', None)  # 문자
        is_deaf = request.data.get('is_deaf', None)  # bool
        count = paper.objects.all().count()  # 정수
        if is_deaf != True and is_deaf != False:
            return Response(data={"state": "문제 유형을 찾을수 없습니다"}, status=status.HTTP_404_NOT_FOUND)
        if is_null(user) or is_null(paper_id):
            return Response(data={"state": "문제지 혹은 사용자 정보가 존재하지 않습니다"}, status=status.HTTP_400_BAD_REQUEST)
        if not (0 < int(paper_id) <= count):
            return Response(data={"state": "문제지 정보가 조회되지 않습니다."}, status=status.HTTP_404_NOT_FOUND)
        if not User.objects.filter(id=user).exists():
            return Response(data={"state": "유저 정보가 존재하지 않습니다"}, status=status.HTTP_404_NOT_FOUND)
        serializer = PracticeNoteSerializer(data=request.data)
        if serializer.is_valid():
            if practice_note.objects.filter(paper_id=paper_id, user_id=user, is_deaf=is_deaf).exists():
                note = practice_note.objects.get(paper_id=paper_id, user_id=user, is_deaf=is_deaf)
                serializer.update(note, validated_data=serializer.validated_data)
                return Response(data={"state": "문제 의 정답 여부를 수정하였습니다."}, status=status.HTTP_200_OK)
            else:
                serializer.create(validated_data=serializer.validated_data)
                return Response(data={"state": "문제를 처음 풀었습니다"}, status=status.HTTP_201_CREATED)

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def put(self, request, paper_id, user_id):
        is_deaf = request.data.get('is_deaf')
        try:
            practice_note_instance = practice_note.objects.get(paper=paper_id, user=user_id, is_deaf=is_deaf)
        except practice_note.DoesNotExist:
            return Response({"error": f"문제 풀이 기록이 존재하지 않습니다."},
                            status=status.HTTP_404_NOT_FOUND)
        practice_note_instance.is_answer = True
        practice_note_instance.save()

        serializer = PracticeNoteSerializer(practice_note_instance)
        return Response(serializer.data)


##########################################################################
############################ 문제 비율 확인 ################################
##########################################################################
class PaperStatesView(APIView):
    '''
    GET : 특정 유형,상황,챕터의 문제 개수와 정답 문제 개수를 전송합니다.
    문제 개수와 정답 문제 개수가 같은 경우 틀린문제가 없으며 해당 챕터를 완강표시 합니다.
    문제 개수와 정답 문제 개수가 다른 경우 풀지 않은 문제가 있거나 오답인 문제가 존재합니다.
    '''
    permission_classes = [IsAuthenticated, IsTokenOwner]

    def get(self, request):
        type = request.GET.get('type')
        situation = request.GET.get('situation')
        chapter = request.GET.get('chapter')
        user_id = request.GET.get('user_id')
        is_deaf = request.GET.get('is_deaf')
        try:
            practice_notes = practice_note.objects.select_related('paper').filter(
                paper__type=type,
                paper__situation=situation,
                paper__chapter=chapter,
                user=user_id,
                is_deaf=is_deaf,
                is_answer=True
            )
            serializer = PracticeNoteSerializer(practice_notes, many=True)

            answer_num = len(serializer.data)

            qs = paper.objects.filter(
                type=type,
                situation=situation,
                chapter=chapter
            )
            serializer = PaperDataSerializer(qs, many=True)
            total_paper_num = len(serializer.data)

            response_data = {
                "answer_num": answer_num,
                "total_paper_num": total_paper_num,
            }
            return Response(response_data)
        except practice_note.DoesNotExist:
            return Response({"error": "해당하는 데이터가 없습니다."}, status=status.HTTP_404_NOT_FOUND)


class WordQuestionView(APIView):
    permission_classes = [IsAuthenticated, IsTokenOwner]

    def post(self, request):

        token = request.headers['Authorization']
        auth_token = token.split(' ')[-1]
        auth_token_user = Token.objects.get(key=auth_token).user_id


        id = request.data.get('id')  # 사용자 id
        type = request.data.get('type')  # 단어/문장
        situation = request.data.get('situation')  # 상황 (단어 유형에서만 존재)
        chapter = request.data.get('chapter')  # chapter
        is_deaf = request.data.get('is_deaf')  # 농아인 여부
        help_return = word_data_check(id, type, situation, chapter, is_deaf)  # 예외처리 함수
        help_text, error_code = help_return[0], help_return[1]  # 예외 처리 결과


        if id != auth_token_user:
            return Response(data={"state":"id 정보가 일치하지 않습니다"} , status=status.HTTP_400_BAD_REQUEST)
        if help_text != "":
            if error_code == "400":
                return Response(data={"state": help_text}, status=status.HTTP_400_BAD_REQUEST)
            if error_code == "404":
                return Response(data={"state": help_text}, status=status.HTTP_404_NOT_FOUND)
        try:
            paper_ids = paper.objects.filter(type=type, situation=situation, chapter=chapter).values_list(
                'id')  # chapter list
            result = dict()  # response dict
            if is_deaf:  # 수어 영상이 나오면 4개중에 하나를 선택해서 한글 을 맞추는거
                for paper_id in paper_ids:
                    if not practice_note.objects.filter(paper_id=paper_id, user_id=id,
                                                        is_deaf=is_deaf).exists():  # 사용자가 처음 푼 기록 이라면
                        answer_info = paper.objects.get(id=paper_id[0])  # 해당 문제의 정보를 저장
                        result['1'] = dict()  # 정답 dict 생성
                        result['1']['id'] = answer_info.id
                        result['1']['word'] = answer_info.sign_answer  # 정답에 관련된 내용
                        result['1']['isAnswer'] = True  # 정답에 관련된 비디오
                        wrong_infos = paper.objects.exclude(id=answer_info.id).filter(type=answer_info.type,
                                                                                      situation=answer_info.situation)  # 오답 (유형 , 상황이 같은것) + 정답 문제 제외한
                        wrong_infos_len = len(wrong_infos)  # 전체 오답 문제 들의 길이
                        random.seed(answer_info.id)  # seed 값 설정
                        random_numbers = random.sample(range(wrong_infos_len), 3)  # 3개의 문제 뽑기
                        for i in range(len(random_numbers)):
                            wrong_info = wrong_infos[random_numbers[i]]  # 랜덤한 오답 정보 저장
                            result[f'{i + 2}'] = dict()
                            result[f'{i + 2}']['id'] = wrong_info.id
                            result[f'{i + 2}']['word'] = wrong_info.sign_answer
                            result[f'{i + 2}']['isAnswer'] = False
                        result['video'] = dict()
                        result['video']['url'] = answer_info.sign_video_url.url
                        break
            else:  # 한글 이 보이면 수어를 따라해서 정답 여부
                for paper_id in paper_ids:
                    if not practice_note.objects.filter(paper_id=paper_id, user_id=id,
                                                        is_deaf=is_deaf).exists():  # 만약 사용자가 학습 기록이 없을때
                        answer_info = paper.objects.get(id=paper_id[0])  # 문제 정보 저장
                        result['answer'] = dict()
                        result['answer']['id'] = answer_info.id
                        result['answer']['word'] = answer_info.sign_answer
                        break
            return Response(data={"문제": result}, status=status.HTTP_200_OK)
        except paper.DoesNotExist:
            return Response(data={"state": "조회 가능한 문제가 없습니다."}, status=status.HTTP_404_NOT_FOUND)


class SentenceQuestionView(APIView):
    permission_classes = [IsAuthenticated, IsTokenOwner]

    def post(self, request):
        # headers 의 사용자 토큰 정보
        token = request.headers['Authorization']
        auth_token = token.split(' ')[-1]
        auth_token_user = Token.objects.get(key=auth_token).user_id


        id = request.data.get('id')  # 사용자 id
        type = request.data.get('type')  # 문장
        chapter = request.data.get('chapter')  # chapter
        is_deaf = request.data.get('is_deaf')  # 농아인 여부

        chapter = int(chapter)
        help_return = sentence_data_check(id, type, chapter, is_deaf)  # 예외처리 함수
        help_text, error_code = help_return[0], help_return[1]  # 예외 처리 결과

        if id != auth_token_user:
            return Response(data={"state":"id 정보가 일치하지 않습니다"} , status=status.HTTP_400_BAD_REQUEST)

        if help_text != "":  # 예외 처리가 존재 한다면
            if error_code == "400":
                return Response(data={"state": help_text}, status=status.HTTP_400_BAD_REQUEST)
            if error_code == "404":
                return Response(data={"state": help_text}, status=status.HTTP_404_NOT_FOUND)

        try:
            paper_ids = paper.objects.filter(type=type, chapter=chapter).values_list('id')
            result = dict()
            if is_deaf:
                for paper_id in paper_ids:
                    if not practice_note.objects.filter(paper_id=paper_id, user_id=id, is_deaf=is_deaf).exists():
                        answer_info = paper.objects.get(id=paper_id[0])
                        result['1'] = dict()
                        result['1']['id'] = answer_info.id
                        result['1']['word'] = answer_info.sign_answer
                        result['1']['isAnswer'] = True
                        wrong_infos = paper.objects.exclude(id=answer_info.id).filter(
                            type=answer_info.type)  # 오답 (유형) + 정답 문제 제외한
                        wrong_infos_len = len(wrong_infos)  # 전체 오답 문제 들의 길이
                        random.seed(answer_info.id)  # seed 값 설정
                        random_numbers = random.sample(range(wrong_infos_len), 3)  # 3개의 문제 뽑기
                        for i in range(len(random_numbers)):
                            wrong_info = wrong_infos[random_numbers[i]]  # 랜덤한 오답 정보 저장
                            result[f'{i + 2}'] = dict()
                            result[f'{i + 2}']['id'] = wrong_info.id
                            result[f'{i + 2}']['word'] = wrong_info.sign_answer
                            result[f'{i + 2}']['isAnswer'] = False
                        result['video'] = dict()
                        result['video']['url'] = answer_info.sign_video_url.url
                        break
            else:  # 한글 이 보이면 수어를 따라해서 정답 여부
                for paper_id in paper_ids:
                    if not practice_note.objects.filter(paper_id=paper_id, user_id=id,
                                                        is_deaf=is_deaf).exists():  # 만약 사용자가 학습 기록이 없을때
                        answer_info = paper.objects.get(id=paper_id[0])  # 문제 정보 저장
                        result['answer'] = dict()
                        result['answer']['id'] = answer_info.id
                        result['answer']['word'] = answer_info.sign_answer
                        break
            return Response(data={"문제": result}, status=status.HTTP_200_OK)
        except paper.DoesNotExist:
            return Response(data={"state": "조회 가능한 문제가 없습니다."}, status=status.HTTP_404_NOT_FOUND)


### 시나리오 뷰
class ScenarioView(APIView):
    permission_classes = [IsAuthenticated, IsTokenOwner]

    def post(self, request):
        situation = request.data.get('situation')
        # role = request.data.get('role')
        try:
            sc = Scenario.objects.filter(situation=situation)
            scenario = dict()
            scenario[situation] = []
            for i in range(len(sc)):
                scenario_communication = dict()
                scenario_communication['take'] = sc[i].take
                scenario_communication['role'] = sc[i].role
                if sc[i].video:
                    scenario_communication['video'] = sc[i].video.url
                scenario_communication['subtitle'] = sc[i].subtitle
                scenario[situation].append(scenario_communication)
            return Response(data=scenario, status=status.HTTP_200_OK)
        except Scenario.DoesNotExist:
            return Response(data={"state": "해당 시나리오가 존재하지 않습니다"}, status=status.HTTP_404_NOT_FOUND)


### 단어 오답문제 출제

class WrongWordQuestionView(APIView):
    permission_classes = [IsAuthenticated, IsTokenOwner]

    def post(self, request):
        # 사용자 토큰의 정보
        token = request.headers['Authorization']
        auth_token = token.split(' ')[-1]
        auth_token_user = Token.objects.get(key=auth_token).user_id


        id = request.data.get('id')  # 사용자 id
        type = request.data.get('type')  # 단어/문장
        situation = request.data.get('situation')  # 상황 (단어 유형에서만 존재)
        chapter = request.data.get('chapter')  # chapter
        is_deaf = request.data.get('is_deaf')  # 농아인 여부
        help_return = word_data_check(id, type, situation, chapter, is_deaf)  # 예외처리 함수
        help_text, error_code = help_return[0], help_return[1]  # 예외 처리 결과


        if id != auth_token_user:
            return Response(data={"state":"id 정보가 일치하지 않습니다"} , status=status.HTTP_400_BAD_REQUEST)

        if help_text != "":  # 예외 처리가 존재 한다면
            if error_code == "400":
                return Response(data={"state": help_text}, status=status.HTTP_400_BAD_REQUEST)
            if error_code == "404":
                return Response(data={"state": help_text}, status=status.HTTP_404_NOT_FOUND)

        result = dict()
        try:
            practice_notes = practice_note.objects.select_related('paper').filter(  # 이용자가 틀린 문제
                paper__type=type,
                paper__situation=situation,
                paper__chapter=chapter,
                user=id,
                is_deaf=is_deaf,
                is_answer=False
            )
            result['문제'] = list()
            if is_deaf:  # 농아인 문제
                for practice in practice_notes:
                    paper_info = practice.paper  # 틀린 문제 정보
                    info = dict()
                    info["1"] = dict()
                    info["1"]["id"] = paper_info.id
                    info["1"]["word"] = paper_info.sign_answer
                    info["1"]["word"] = paper_info.sign_answer
                    info["1"]["isAnswer"] = True
                    wrong_infos = paper.objects.exclude(id=paper_info.id).filter(type=paper_info.type,
                                                                                 situation=paper_info.situation)
                    wrong_infos_len = len(wrong_infos)
                    random.seed(paper_info.id)
                    random_numbers = random.sample(range(wrong_infos_len), 3)
                    for i in range(len(random_numbers)):
                        wrong_info = wrong_infos[random_numbers[i]]
                        info[f'{i + 2}'] = dict()
                        info[f'{i + 2}']['id'] = wrong_info.id
                        info[f'{i + 2}']['word'] = wrong_info.sign_answer
                        info[f'{i + 2}']['isAnswer'] = False
                    info['video'] = paper_info.sign_video_url.url
                    result['문제'].append(info)
            else:  # 청각 장애인 문제
                for practice in practice_notes:
                    paper_info = practice.paper  # 틀린 문제 정보
                    info = dict()
                    info['answer'] = dict()
                    info['answer']['id'] = paper_info.id
                    info['answer']['word'] = paper_info.sign_answer
                    result['문제'].append(info)
            return Response(data=result, status=status.HTTP_200_OK)

        except practice_note.DoesNotExist:
            return Response(data={"state": "틀린 문제가 없습니다"}, status=status.HTTP_404_NOT_FOUND)


## 문장 오답 문제 출제

class WrongSentenceQuestionView(APIView):
    permission_classes = [IsAuthenticated, IsTokenOwner]

    def post(self, request):

        # 사용자 토큰의 정보
        token = request.headers['Authorization']
        auth_token = token.split(' ')[-1]
        auth_token_user = Token.objects.get(key=auth_token).user_id

        id = request.data.get('id')  # 사용자 id
        type = request.data.get('type')  # 단어/문장
        chapter = request.data.get('chapter')  # chapter
        is_deaf = request.data.get('is_deaf')  # 농아인 여부
        help_return = sentence_data_check(id, type, chapter, is_deaf)  # 예외처리 함수
        help_text, error_code = help_return[0], help_return[1]  # 예외 처리 결과

        if id != auth_token_user:
            return Response(data={"state":"id 정보가 일치하지 않습니다"} , status=status.HTTP_400_BAD_REQUEST)

        if help_text != "":  # 예외 처리가 존재 한다면
            if error_code == "400":
                return Response(data={"state": help_text}, status=status.HTTP_400_BAD_REQUEST)
            if error_code == "404":
                return Response(data={"state": help_text}, status=status.HTTP_404_NOT_FOUND)

        result = dict()
        try:
            practice_notes = practice_note.objects.select_related('paper').filter(  # 이용자가 틀린 문제
                paper__type=type,
                paper__chapter=chapter,
                user=id,
                is_deaf=is_deaf,
                is_answer=False
            )
            result['문제'] = list()
            if is_deaf:  # 농아인 문제
                for practice in practice_notes:
                    paper_info = practice.paper  # 틀린 문제 정보
                    info = dict()
                    info["1"] = dict()
                    info["1"]["id"] = paper_info.id
                    info["1"]["word"] = paper_info.sign_answer
                    info["1"]["isAnswer"] = True
                    wrong_infos = paper.objects.exclude(id=paper_info.id).filter(type=paper_info.type,
                                                                                 situation=paper_info.situation)
                    wrong_infos_len = len(wrong_infos)
                    random.seed(paper_info.id)
                    random_numbers = random.sample(range(wrong_infos_len), 3)
                    for i in range(len(random_numbers)):
                        wrong_info = wrong_infos[random_numbers[i]]
                        info[f'{i + 2}'] = dict()
                        info[f'{i + 2}']['id'] = wrong_info.id
                        info[f'{i + 2}']['word'] = wrong_info.sign_answer
                        info[f'{i + 2}']['isAnswer'] = False
                    info['video'] = paper_info.sign_video_url.url
                    result['문제'].append(info)
            else:  # 청각 장애인 문제
                for practice in practice_notes:
                    paper_info = practice.paper  # 틀린 문제 정보
                    info = dict()
                    info['answer'] = dict()
                    info['answer']['id'] = paper_info.id
                    info['answer']['word'] = paper_info.sign_answer
                    result['문제'].append(info)
            return Response(data=result, status=status.HTTP_200_OK)

        except practice_note.DoesNotExist:
            return Response(data={"state": "틀린 문제가 없습니다"}, status=status.HTTP_404_NOT_FOUND)


## 틀린 문제 정보
class WordWrongQuestionInfoView(APIView):
    permission_classes = [IsAuthenticated, IsTokenOwner]

    def post(self, request):

        # 사용자 토큰의 정보
        token = request.headers['Authorization']
        auth_token = token.split(' ')[-1]
        auth_token_user = Token.objects.get(key=auth_token).user_id

        id = request.data.get('id')  # 사용자 아이디
        type = request.data.get('type')  # 유형 (단어/문장)
        situation = request.data.get('situation')  # 병원 학교 직업
        chapter = request.data.get('chapter')  # 챕터 정보
        is_deaf = request.data.get('is_deaf')  # 농아인 전용 문제  / 청각장애인 전용 문제

        chapter = int(chapter)
        help_return = word_data_check(id, type, situation , chapter , is_deaf)
        help_text, error_code = help_return[0], help_return[1]  # 예외 처리 결과


        if id != auth_token_user:
            return Response(data={"state":"id 정보가 일치하지 않습니다"} , status=status.HTTP_400_BAD_REQUEST)

        if help_text != "":  # 예외 처리가 존재 한다면
            if error_code == "400":
                return Response(data={"state": help_text}, status=status.HTTP_400_BAD_REQUEST)
            if error_code == "404":
                return Response(data={"state": help_text}, status=status.HTTP_404_NOT_FOUND)
        result = dict()

        try:
            practice_notes = practice_note.objects.select_related('paper').filter(  # 이용자가 틀린 문제
                paper__type=type,
                paper__situation=situation,
                paper__chapter=chapter,
                user=id,
                is_deaf=is_deaf,
                is_answer=False
            )
            result['wrong'] = list()
            for practice in practice_notes:
                wrong_info = dict()
                wrong_info["id"] = practice.paper.id
                wrong_info["answer"] = practice.paper.sign_answer
                wrong_info["video"] = practice.paper.sign_video_url.url
                result['wrong'].append(wrong_info)
            return Response(data=result, status=status.HTTP_200_OK)

        except practice_note.DoesNotExist:
            return Response(data={"state": "틀린문제가 조회되자 않습니다"}, status=status.HTTP_404_NOT_FOUND)


class SentenceWrongQuestionInfoView(APIView):
    permission_classes = [IsAuthenticated, IsTokenOwner]

    def post(self, request):

        # 사용자 토큰의 정보
        token = request.headers['Authorization']
        auth_token = token.split(' ')[-1]
        auth_token_user = Token.objects.get(key=auth_token).user_id

        id = request.data.get('id')  # 사용자 아이디
        type = request.data.get('type')  # 유형 (단어/문장)
        chapter = request.data.get('chapter')  # 챕터 정보
        is_deaf = request.data.get('is_deaf')  # 농아인 전용 문제  / 청각장애인 전용 문제

        chapter = int(chapter)
        help_return = sentence_data_check(id, type, chapter, is_deaf)
        help_text, error_code = help_return[0], help_return[1]  # 예외 처리 결과


        if id != auth_token_user:
            return Response(data={"state": "id 정보가 일치하지 않습니다"}, status=status.HTTP_400_BAD_REQUEST)

        if help_text != "":  # 예외 처리가 존재 한다면
            if error_code == "400":
                return Response(data={"state": help_text}, status=status.HTTP_400_BAD_REQUEST)
            if error_code == "404":
                return Response(data={"state": help_text}, status=status.HTTP_404_NOT_FOUND)
        result = dict()

        try:
            practice_notes = practice_note.objects.select_related('paper').filter(  # 이용자가 틀린 문제
                paper__type=type,
                paper__chapter=chapter,
                user=id,
                is_deaf=is_deaf,
                is_answer=False
            )
            result['wrong'] = list()
            for practice in practice_notes:
                wrong_info = dict()
                wrong_info["id"] = practice.paper.id
                wrong_info["answer"] = practice.paper.sign_answer
                wrong_info["video"] = practice.paper.sign_video_url.url
                result['wrong'].append(wrong_info)
            return Response(data=result, status=status.HTTP_200_OK)

        except practice_note.DoesNotExist:
            return Response(data={"state": "틀린문제가 조회되자 않습니다"}, status=status.HTTP_404_NOT_FOUND)


class WordWrongCountView(APIView):
    permission_classes = [IsAuthenticated, IsTokenOwner]

    def post(self, request):

        # 사용자 토큰의 정보
        token = request.headers['Authorization']
        auth_token = token.split(' ')[-1]
        auth_token_user = Token.objects.get(key=auth_token).user_id

        id = request.data.get('id')
        type = request.data.get('type')
        situation = request.data.get('situation')

        help_return = word_wrong_count_check(id, type, situation)
        help_text, error_code = help_return[0], help_return[1]  # 예외 처리 결과


        if id != auth_token_user:
            return Response(data={"state": "id 정보가 일치하지 않습니다"}, status=status.HTTP_400_BAD_REQUEST)


        if help_text != "":  # 예외 처리가 존재 한다면
            if error_code == "400":
                return Response(data={"state": help_text}, status=status.HTTP_400_BAD_REQUEST)
            if error_code == "404":
                return Response(data={"state": help_text}, status=status.HTTP_404_NOT_FOUND)
        result = dict()
        try:
            chapter_list = paper.objects.filter(type=type, situation=situation).values_list('chapter').distinct()
            result[f'{situation}'] = list()
            for chapter in chapter_list:
                chapter = chapter[0]
                chapter_info = dict()
                paper_count = paper.objects.filter(type=type, situation=situation, chapter=chapter).count()
                # 사용자가 맞은 문제 개수
                correct_deaf_info = practice_note.objects.filter(user_id=id, paper__type=type,
                                                                 paper__situation=situation,
                                                                 paper__chapter=chapter, is_deaf=True, is_answer=True)
                correct_deaf_not_info = practice_note.objects.filter(user_id=id, paper__type=type,
                                                                     paper__situation=situation,
                                                                     paper__chapter=chapter, is_deaf=False,
                                                                     is_answer=True)
                # 사용자가 틀린 문제 개수
                wrong_deaf_info = practice_note.objects.filter(user_id=id, paper__type=type,
                                                               paper__situation=situation,
                                                               paper__chapter=chapter, is_deaf=True, is_answer=False)
                wrong_deaf_not_info = practice_note.objects.filter(user_id=id, paper__type=type,
                                                                   paper__situation=situation,
                                                                   paper__chapter=chapter, is_deaf=False,
                                                                   is_answer=False)

                # 사용자가 푼 문제수
                unsolved_deaf_info = practice_note.objects.filter(user_id=id, paper__type=type,
                                                                  paper__situation=situation,
                                                                  paper__chapter=chapter,
                                                                  is_deaf=True)  # 사용자가 해당 챕터 문제를 푼 기록 전부 (풀든 안풀든)
                unsolved_deaf_not_info = practice_note.objects.filter(user_id=id, paper__type=type,
                                                                      paper__situation=situation,
                                                                      paper__chapter=chapter,
                                                                      is_deaf=False)  # 사용자가 해당 챕터 문제를 푼 기록 전부 (풀든 안풀든)

                chapter_info['chapter'] = chapter
                chapter_info['paper_all_count'] = paper_count
                ## 농아인 유형 문제
                chapter_info['correct_deaf_count'] = correct_deaf_info.count()  # 맞은 문제
                chapter_info['wrong_deaf_count'] = wrong_deaf_info.count()  # 틀린 문제
                chapter_info['unsolved_deaf_count'] = paper_count - unsolved_deaf_info.count()  # 안푼 문제

                ## 청각 장애인 유형
                chapter_info['correct_deaf_not_count'] = correct_deaf_not_info.count()  # 맞은 문제
                chapter_info['wrong_deaf_not_count'] = wrong_deaf_not_info.count()
                chapter_info['unsolved_deaf_not_count'] = paper_count - unsolved_deaf_not_info.count()  # 안푼 문제

                result[f'{situation}'].append(chapter_info)
            return Response(data=result, status=status.HTTP_200_OK)
        except paper.DoesNotExist:
            return Response(data={"state": "문제 정보가 조회되지 않습니다"}, status=status.HTTP_404_NOT_FOUND)


class SentenceWrongCountView(APIView):
    permission_classes = [IsAuthenticated, IsTokenOwner]

    def post(self, request):
        # 사용자 토큰의 정보
        token = request.headers['Authorization']
        auth_token = token.split(' ')[-1]
        auth_token_user = Token.objects.get(key=auth_token).user_id

        id = request.data.get('id')
        type = request.data.get('type')
        help_return = sentence_wrong_count_check(id, type)
        help_text, error_code = help_return[0], help_return[1]  # 예외 처리 결과


        if id != auth_token_user:
            return Response(data={"state": "id 정보가 일치하지 않습니다"}, status=status.HTTP_400_BAD_REQUEST)

        if help_text != "":  # 예외 처리가 존재 한다면
            if error_code == "400":
                return Response(data={"state": help_text}, status=status.HTTP_400_BAD_REQUEST)
            if error_code == "404":
                return Response(data={"state": help_text}, status=status.HTTP_404_NOT_FOUND)

        result = dict()
        try:
            chapter_list = paper.objects.filter(type=type).values_list('chapter').distinct()
            result[f'{type}'] = list()
            for chapter in chapter_list:
                chapter = chapter[0]
                chapter_info = dict()
                paper_count = paper.objects.filter(type=type, chapter=chapter).count()
                # 사용자가 맞은 문제 개수
                correct_deaf_info = practice_note.objects.filter(user_id=id, paper__type=type,
                                                                 paper__chapter=chapter, is_deaf=True, is_answer=True)
                correct_deaf_not_info = practice_note.objects.filter(user_id=id, paper__type=type,
                                                                     paper__chapter=chapter, is_deaf=False,
                                                                     is_answer=True)
                # 사용자가 틀린 문제 개수
                wrong_deaf_info = practice_note.objects.filter(user_id=id, paper__type=type,
                                                               paper__chapter=chapter, is_deaf=True, is_answer=False)
                wrong_deaf_not_info = practice_note.objects.filter(user_id=id, paper__type=type,
                                                                   paper__chapter=chapter, is_deaf=False,
                                                                   is_answer=False)

                # 사용자가 푼 문제수
                unsolved_deaf_info = practice_note.objects.filter(user_id=id, paper__type=type,
                                                                  paper__chapter=chapter,
                                                                  is_deaf=True)  # 사용자가 해당 챕터 문제를 푼 기록 전부 (풀든 안풀든)
                unsolved_deaf_not_info = practice_note.objects.filter(user_id=id, paper__type=type,
                                                                      paper__chapter=chapter,
                                                                      is_deaf=False)  # 사용자가 해당 챕터 문제를 푼 기록 전부 (풀든 안풀든)

                chapter_info['chapter'] = chapter
                chapter_info['paper_all_count'] = paper_count
                ## 농아인 유형 문제
                chapter_info['correct_deaf_count'] = correct_deaf_info.count()  # 맞은 문제
                chapter_info['wrong_deaf_count'] = wrong_deaf_info.count()  # 틀린 문제
                chapter_info['unsolved_deaf_count'] = paper_count - unsolved_deaf_info.count()  # 안푼 문제

                ## 청각 장애인 유형
                chapter_info['correct_deaf_not_count'] = correct_deaf_not_info.count()  # 맞은 문제
                chapter_info['wrong_deaf_not_count'] = wrong_deaf_not_info.count()
                chapter_info['unsolved_deaf_not_count'] = paper_count - unsolved_deaf_not_info.count()  # 안푼 문제

                result[f'{type}'].append(chapter_info)
            return Response(data=result, status=status.HTTP_200_OK)
        except paper.DoesNotExist:
            return Response(data={"state": "문제 정보가 조회되지 않습니다"}, status=status.HTTP_404_NOT_FOUND)


class SentenceModelView(APIView):
    def get_answer_mapping(self, num):
        '''
        Predict에서 나온 숫자가 어떤 문자열인지 알려주는 함수
        DB의 answer에 맞게 변경하면 된다.

        Parameter
            num: 숫자를 받아서 해당하는 predict 문자열을 반환하는데 사용한다.
        Return
            result: 정답 라벨 문자열
        '''
        text_mapping = {
            0: '경찰 불러주세요',
            1: '돈 계산 잘못했어요',
            2: '잘못 말씀드렸어요',
            3: '위가 쪼이듯이 배가 아파요',
            4: '에어컨이 고장나서 작동하지않아요',
            5: '영수증 주세요',
            6: '오늘 하루 수고 많았습니다',
            7: '잠깐 기다려주세요',
            8: '지갑을 잃어버렸어요',
            9: '카드 사용이 안돼요',
        }

        result = text_mapping[num]

        return result

    def get_use_landmark(self, results):
        '''
        전체 landmark에서 사용할 landmark만 추출하는 함수

        Parameter
            data: holistic로 추출된 landmark
        Return
            landmark: 전체 landmark에서 추출한 258개의 keypoint return
        '''
        # landmark 1차원 배열에 추가
        pose_landmarks = [0] * (33 * 4)  # 33개의 pose landmarks * 4 (x, y, z, visibility)
        left_hand_landmarks = [0] * (21 * 3)  # 21개의 hand landmarks * 3 (x, y, z)
        right_hand_landmarks = [0] * (21 * 3)  # 21개의 hand landmarks * 3 (x, y, z)

        if 'pose_landmarks' in results:
            pose_landmarks = [landmark["x"] for landmark in results['pose_landmarks']] + \
                             [landmark["y"] for landmark in results['pose_landmarks']] + \
                             [landmark["z"] for landmark in results['pose_landmarks']] + \
                             [landmark["visibility"] for landmark in results['pose_landmarks']]

        if 'left_hand_landmarks' in results:
            left_hand_landmarks = [landmark["x"] for landmark in results['left_hand_landmarks']] + \
                                  [landmark["y"] for landmark in results['left_hand_landmarks']] + \
                                  [landmark["z"] for landmark in results['left_hand_landmarks']]

        if 'right_hand_landmarks' in results:
            right_hand_landmarks = [landmark["x"] for landmark in results['right_hand_landmarks']] + \
                                   [landmark["y"] for landmark in results['right_hand_landmarks']] + \
                                   [landmark["z"] for landmark in results['right_hand_landmarks']]

        landmark = pose_landmarks + left_hand_landmarks + right_hand_landmarks

        return landmark

    def sen_predict(self, data):
        '''
        사용자의 동작을 보고 수어 문장을 예측하는 함수
        수어 문장의 경우 data에 landmark가 120개 넘어와야 한다.

        Parameter
            data: front로 부터 넘어오는 landmarks 데이터
        Return
            result: 모델이 예측한 수어 문장
        '''

        # 전체 landmarks에서 특정 landmark만 추출하여 저장할 배열
        landmarks = []

        # data에 있는 landmark를 하나씩 가져와서 특정 landmark만 추출하고
        for key, landmark in data.items():
            landmarks.append(self.get_use_landmark(landmark))

        # 수어 문장을 detect할 model 불러오기
        model = tf.keras.models.load_model(r'model/model_gru.h5')

        # 모델 input data
        input_data = np.array([landmarks])

        # 모델의 수어 문장 예측
        pred = model.predict(input_data, verbose=0)[0]

        # 모델이 예측한 수어 문장
        result = self.get_answer_mapping(pred.argmax(-1))

        # 결과 반환
        return result

    def post(self, request):
        answer = self.sen_predict(request.data)
        return Response(data={"predict": answer}, status=status.HTTP_200_OK)


class WordModelView(APIView):

    def extract_keypoints(self, results):

        pose = np.zeros(132)
        left_hand = np.zeros(63)
        right_hand = np.zeros(63)

        if 'pose_landmarks' in results:
            pose = np.array(
                [[res['x'], res['y'], res['z'], res['visibility']] for res in results['pose_landmarks']]).flatten()
        if 'left_hand_landmarks' in results:
            left_hand = np.array([[res['x'], res['y'], res['z']] for res in results['left_hand_landmarks']]).flatten()
        if 'right_hand_landmarks' in results:
            right_hand = np.array([[res['x'], res['y'], res['z']] for res in results['right_hand_landmarks']]).flatten()

        return np.concatenate([pose, left_hand, right_hand])

    def word_predict(self, data):
        actions = np.array(
            ['간호사', '골절', '당뇨병', '병명', '병문안', '불면증', '붕대', '소화제', '의사', '입원', '진단서', '체온', '치료', '퇴원', '화상',
             '근무', '디자이너', '예술가', '요리사', '운동선수', '출근', '통역사', '퇴사',
             '교가', '교무실', '교실', '교탁', '답안지', '등교', '모범생', '문제지', '복습', '상장', '실습', '예습', '자습', '재학', '학부모', '학습'])

        # 전체 landmarks에서 특정 landmark만 추출하여 저장할 배열
        landmarks = []

        # data에 있는 landmark를 하나씩 가져와서 특정 landmark만 추출하고
        for key, landmark in data.items():
            landmarks.append(self.extract_keypoints(landmark))

        model = tf.keras.models.load_model('model/lstm_model.h5')

        pred = model.predict(np.expand_dims(landmarks, axis=0))[0]

        answer = actions[np.argmax(pred)]

        return answer

    def post(self, request):
        answer = self.word_predict(request.data)
        return Response(data={"predict": answer}, status=status.HTTP_200_OK)
