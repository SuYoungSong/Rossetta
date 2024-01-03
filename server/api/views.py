import random

from django.contrib.auth import authenticate
from django.contrib.auth import logout, login

from .email import email_data_set, email_data_get, key_data_get, email_send, email_return_json
from rest_framework.authtoken.models import Token
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework import status
from rest_framework.permissions import IsAuthenticated

from .serializers import *
from .permissions import *


# Create your views here.


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
    def delete(self, request, id):
        if id != request.user.id:  # url 에서 받아온 id 와 request 요청으로 들어온 아이디가 다를시에도 탈퇴 불가
            return Response(data={"state": "다른 사용자의 아이디 입니다. 계정 탈퇴할수 없습니다"}, status=status.HTTP_400_BAD_REQUEST)
        try:
            user = User.objects.get(id=id)  # 삭제하고 싶은 사용자 정보 조회
            user.delete()  # 사용자 정보 삭제
            return Response(data={"state": "정상 탈퇴 되었습니다."}, status=status.HTTP_204_NO_CONTENT)  # 정상 응답
        except user.DoesNotExist:
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


class UserLoginView(APIView):
    def post(self, request):
        id = request.data.get('id')  # 사용자가 입력한 아이디
        password = request.data.get('password')  # 사용자가 입력한 비밀번호
        if id and password:
            user = authenticate(username=id, password=password)  # 로그인과 비밀번호가 일치한 유저 레코드 찾기
            if user is not None:
                login(request, user)  # user 데이터가 존재하면 로그인
                token, created = Token.objects.get_or_create(user=user)  # 해당 유저 데이터를 기준으로 토큰값을 생성
                return Response(data={"token": token.key, "name": user.name},
                                status=status.HTTP_200_OK)  # 해당 유저의 토큰값을 반환
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
                return Response(data={"state": "정상적으로 로그아웃 됐습니다."}, status=status.HTTP_200_OK)  # 정상 응답
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
            # 질문에 대한 데이터 의 직렬화
            question_serializer = QuestionDetailSerializer(question)
            return Response(data=question_serializer.data, status=status.HTTP_200_OK)
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
        serializer = QuestionListSerializer(queryset, many=True)
        return Response(data=serializer.data, status=status.HTTP_200_OK)


class QuestionCommentCreateView(APIView):
    @action(detail=True, methods=['post'], permission_classes=[IsAuthenticated, IsTokenOwner, IsStaffOwner])
    def post(self, request):
        board = request.data.get('board')
        comment = request.data.get('comment')
        if is_blank_or_is_null(board) or is_blank_or_is_null(comment):
            return Response(data={"state": "게시글 , 댓글 정보를 입력해주세요"}, status=status.HTTP_400_BAD_REQUEST)
        board_id = int(board)
        count = question_board.objects.all().count()
        if not (0 < board_id <= count):
            return Response(data={"state": "게시글 정보가 존재하지 않습니다"}, status=status.HTTP_404_NOT_FOUND)
        serializers = QuestionCommentCreateSerializer(data=request.data, context={'request': request})
        if serializers.is_valid():
            serializers.create(serializers.validated_data)
            return Response(data={"state": "댓글 작성이 완료되었습니다"}, status=status.HTTP_201_CREATED)
        return Response(data=serializers.errors, status=status.HTTP_400_BAD_REQUEST)


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


class PaperTypeSituationChapterView(APIView):
    '''
    GET: 타입(단어, 문장)과 상황 들어오면 챕터 정보를 반환해준다.
    '''

    def get(self, request, type, situation):
        try:
            qs = paper.objects.filter(type=type, situation=situation).distinct().values('chapter')
            serializer = PaperTypeSituationChapterSerializer(qs, many=True)
            return Response(serializer.data)
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


class PaperManyDataView(APIView):
    '''
    GET: 특정 유형(문장,단어,자음모음)와 상황(병원,학교)와 챕터가 오면 그 챕터에 속한 문제들을 반환한다.
    '''

    def get(self, request, type, situation, chapter):
        try:
            qs = paper.objects.filter(type=type, situation=situation, chapter=chapter)
            serializer = PaperDataSerializer(qs, many=True)
            return Response(serializer.data)
        except paper.DoesNotExist:
            return Response({"error": f"'{type}' 유형, '{situation}' 상황, '{chapter}' 챕터에 대한 데이터가 없습니다."},
                            status=status.HTTP_404_NOT_FOUND)
        except ValueError:
            return Response({"error": "챕터는 정수값이어야 합니다."}, status=status.HTTP_400_BAD_REQUEST)


##########################################################################
############################ PracticeNote ################################
##########################################################################
class PracticeNoteView(APIView):
    '''
    GET: 특정 유저 + 특장 싱황 + 특정 챕터별 틀린문제를 return

    POST: 새로운 문제를 푼 경우 DB에 정답(오답) 기록을 추가한다.

    PUT: 기존 오답 이였던 문제를 정답으로 바꾼다.
    '''

    def get(self, request):
        type = request.GET.get('type')
        situation = request.GET.get('situation')
        chapter = request.GET.get('chapter')
        user_id = request.GET.get('user_id')

        try:
            practice_notes = practice_note.objects.select_related('paper').filter(
                paper__type=type,
                paper__situation=situation,
                paper__chapter=chapter,
                user=user_id,
                is_answer=False
            )
            serializer = PracticeNoteSerializer(practice_notes, many=True)
            return Response(serializer.data)
        except practice_note.DoesNotExist:
            return Response({"error": "해당하는 데이터가 없습니다."}, status=status.HTTP_404_NOT_FOUND)

    def post(self, request):  # 중복 문제 발생 -> 한 문제 를 같은 사람이 여러번 푸는것이 record 에 남는다
        paper_id = request.data.get('paper', None)
        user = request.data.get('user', None)
        count = paper.objects.all().count()
        if is_blank_or_is_null(user) or is_blank_or_is_null(paper_id):
            return Response(data={"state": "문제지 혹은 사용자 정보가 존재하지 않습니다"}, status=status.HTTP_400_BAD_REQUEST)
        if not (0 < int(paper_id) <= count):
            return Response(data={"state": "문제지 정보가 조회되지 않습니다."}, status=status.HTTP_404_NOT_FOUND)
        if not User.objects.filter(id=user).exists():
            return Response(data={"state": "유저 정보가 존재하지 않습니다"}, status=status.HTTP_404_NOT_FOUND)
        serializer = PracticeNoteSerializer(data=request.data)
        if serializer.is_valid():
            if practice_note.objects.filter(paper_id=paper_id, user_id=user).exists():
                note = practice_note.objects.get(paper_id=paper_id, user_id=user)
                serializer.update(note, validated_data=serializer.validated_data)
                return Response(data={"state": "게시글이 정상적으로 수정되었습니다"}, status=status.HTTP_200_OK)
            else:
                serializer.create(validated_data=serializer.validated_data)
                return Response(data={"state": "문제를 처음 풀었습니다"}, status=status.HTTP_201_CREATED)

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def put(self, request, paper_id, user_id):
        try:
            practice_note_instance = practice_note.objects.get(paper=paper_id, user=user_id)
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

    def get(self, request):
        type = request.GET.get('type')
        situation = request.GET.get('situation')
        chapter = request.GET.get('chapter')
        user_id = request.GET.get('user_id')

        try:
            practice_notes = practice_note.objects.select_related('paper').filter(
                paper__type=type,
                paper__situation=situation,
                paper__chapter=chapter,
                user=user_id,
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
        id = request.data.get('id')  # 사용자 id
        type = request.data.get('type')  # 단어/문장
        situation = request.data.get('situation')  # 상황 (단어 유형에서만 존재)
        chapter = request.data.get('chapter')  # chapter
        is_deaf = request.data.get('is_deaf')  # 농아인 여부
        help_return = word_data_check(id, type, situation, chapter, is_deaf)        # 예외처리 함수
        help_text,error_code = help_return[0] , help_return[1]                      # 예외 처리 결과
        if help_text != "":
            if error_code == "400":
                return Response(data={"state": help_text}, status=status.HTTP_400_BAD_REQUEST)
            if error_code == "404":
                return Response(data={"state": help_text}, status=status.HTTP_404_NOT_FOUND)

        paper_ids = paper.objects.filter(type=type, situation=situation, chapter=chapter).values_list('id')
        result = dict()  # response dict
        if is_deaf:  # 수어 영상이 나오면 4개중에 하나를 선택해서 한글 을 맞추는거
            for paper_id in paper_ids:
                if not practice_note.objects.filter(paper_id=paper_id, user_id=id).exists():  # 사용자가 처음 푼 기록 이라면
                    answer_info = paper.objects.get(id=paper_id[0])  # 해당 문제의 정보를 저장
                    result['answer'] = dict()  # 정답 dict 생성
                    result['answer']['sign_answer'] = answer_info.sign_answer  # 정답에 관련된 내용
                    result['answer']['sign_video_url'] = answer_info.sign_video_url  # 정답에 관련된 비디오
                    wrong_infos = paper.objects.exclude(id=answer_info.id).filter(type=answer_info.type,
                                                                                  situation=answer_info.situation)  # 오답 (유형 , 상황이 같은것) + 정답 문제 제외한
                    wrong_infos_len = len(wrong_infos)  # 전체 오답 문제 들의 길이
                    random.seed(answer_info.id)  # seed 값 설정
                    random_numbers = random.sample(range(wrong_infos_len), 3)  # 3개의 문제 뽑기
                    for i in range(len(random_numbers)):
                        wrong_info = wrong_infos[random_numbers[i]]  # 랜덤한 오답 정보 저장
                        result[f'wrong_{i + 1}'] = dict()
                        result[f'wrong_{i + 1}']['sign_answer'] = wrong_info.sign_answer
                        result[f'wrong_{i + 1}']['sign_video_url'] = wrong_info.sign_video_url
                return Response(data={"문제": result}, status=status.HTTP_200_OK)  # 정상 Response
        else:  # 한글 이 보이면 수어를 따라해서 정답 여부
            for paper_id in paper_ids:
                if not practice_note.objects.filter(paper_id=paper_id, user_id=id).exists():  # 만약 사용자가 학습 기록이 없을때
                    answer_info = paper.objects.get(id=paper_id[0])  # 문제 정보 저장
                    result['answer'] = dict()
                    result['answer']['sign_answer'] = answer_info.sign_answer
                    result['answer']['sign_video_url'] = answer_info.sign_video_url
                    return Response(data={"문제": result}, status=status.HTTP_200_OK)


class SentenceQuestionView(APIView):

    permission_classes = [IsAuthenticated , IsTokenOwner]
    def post(self, request):
        id = request.data.get('id')  # 사용자 id
        type = request.data.get('type')  # 문장
        chapter = request.data.get('chapter')  # chapter
        is_deaf = request.data.get('is_deaf')  # 농아인 여부

        help_return = sentence_data_check(id, type, chapter, is_deaf)                   # 예외처리 함수
        help_text,error_code = help_return[0] , help_return[1]                      # 예외 처리 결과
        if help_text != "":                                                         # 예외 처리가 존재 한다면
            if error_code == "400":
                return Response(data={"state": help_text}, status=status.HTTP_400_BAD_REQUEST)
            if error_code == "404":
                return Response(data={"state": help_text}, status=status.HTTP_404_NOT_FOUND)

        paper_ids = paper.objects.filter(type=type, chapter=chapter).values_list('id')
        result = dict()
        if is_deaf:
            for paper_id in paper_ids:
                if not practice_note.objects.filter(paper_id=paper_id, user_id=id).exists():
                    answer_info = paper.objects.get(id=paper_id[0])
                    result['answer'] = dict()
                    result['answer']['sign_answer'] = answer_info.sign_answer
                    result['answer']['sign_video_url'] = answer_info.sign_video_url
                    wrong_infos = paper.objects.exclude(id=answer_info.id).filter(
                        type=answer_info.type)  # 오답 (유형) + 정답 문제 제외한
                    wrong_infos_len = len(wrong_infos)  # 전체 오답 문제 들의 길이
                    random.seed(answer_info.id)  # seed 값 설정
                    random_numbers = random.sample(range(wrong_infos_len), 3)  # 3개의 문제 뽑기
                    for i in range(len(random_numbers)):
                        wrong_info = wrong_infos[random_numbers[i]]  # 랜덤한 오답 정보 저장
                        result[f'wrong_{i + 1}'] = dict()
                        result[f'wrong_{i + 1}']['sign_answer'] = wrong_info.sign_answer
                        result[f'wrong_{i + 1}']['sign_video_url'] = wrong_info.sign_video_url
                return Response(data={"문제": result}, status=status.HTTP_200_OK)  # 정상 Response

        else:  # 한글 이 보이면 수어를 따라해서 정답 여부
            for paper_id in paper_ids:
                if not practice_note.objects.filter(paper_id=paper_id, user_id=id).exists():  # 만약 사용자가 학습 기록이 없을때
                    answer_info = paper.objects.get(id=paper_id[0])  # 문제 정보 저장
                    result['answer'] = dict()
                    result['answer']['sign_answer'] = answer_info.sign_answer
                    result['answer']['sign_video_url'] = answer_info.sign_video_url
                    return Response(data={"문제": result}, status=status.HTTP_200_OK)
