import os.path
import os
import uuid

from django.contrib.auth import get_user_model
from django.core.files.storage import default_storage
from rest_framework import serializers

from .models import *
import re
from django.utils import timezone
from .exception import *


class UserLoginSerializer(serializers.ModelSerializer):  # 사용자 로그인 시리얼라이저
    class Meta:
        model = User  # 사용자 모델
        fields = ['id', 'password']  # 로그인 여부를 확인할 필드(로그인 , 패스워드)


class UserCreateSerializer(serializers.ModelSerializer):
    password_check = serializers.CharField(write_only=True, style={'input_type': 'password'}, required=False,
                                           allow_null=True, allow_blank=True)  # 비밀번호 확인
    is_auth = serializers.BooleanField(required=False, allow_null=True)

    class Meta:
        model = User  # 회원가입시 사용할 모델
        fields = ['id', 'password', 'password_check', 'name', 'email', 'is_auth']  # 회원가입시 사용자가 입력해야할 정보

    def validate(self, data):
        id = data.get('id')
        password = data.get('password')
        password_check = data.get('password_check')
        name = data.get('name')
        email = data.get('email')
        is_auth = data.get('is_auth')
        if is_blank_or_is_null(password) or is_blank_or_is_null(password_check):
            raise serializers.ValidationError("비밀번호 , 비밀번호 확인은 공란이 될수 없습니다.")
        else:
            if password != password_check:
                raise serializers.ValidationError("비밀번호와 비밀번호 확인이 맞지 않습니다.")
            else:
                if not password_match(password):
                    raise serializers.ValidationError("비밀번호 형식에 맞게 작성해주세요")
        if is_blank_or_is_null(email):
            raise serializers.ValidationError("이메일을 작성해 주세요")
        else:
            if User.objects.filter(email=email).exists():
                raise serializers.ValidationError("이미 존재하는 이메일입니다.")
            else:
                if not email_match(email):
                    raise serializers.ValidationError("이메일 규칙에 맞춰서 작성해주세요")
        if is_blank_or_is_null(email):
            raise serializers.ValidationError("이메일 인증을 완료 해주세요")
        return data

    def create(self, validated_data):
        is_auth = validated_data.pop('is_auth')
        password = validated_data.pop('password')  # password 값 을 암호화 설정 하기 위해
        password_check = validated_data.pop('password_check')
        if is_auth:
            user = User.objects.create_user(**validated_data)  # request 에서 넘어온 데이터들로 create_user 생성
            user.set_password(password)  # password 암호화
            user.save()  # 데이터 저장
            return user


class UserDetailSerializer(serializers.ModelSerializer):
    class Meta:
        model = User  # 조회할 모델
        fields = ['id', 'password', 'name', 'email']  # 사용자한테 보여줘야할 User 모델의 필드


class UserUpdateSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, style={'input_type': 'password'},
                                     required=False)  # 사용자가 변경할 비밀번호 , 필수 x
    password_check = serializers.CharField(write_only=True, style={'input_type': 'password'},
                                           required=False)  # 비밀번호 확인  , 필수 x

    class Meta:
        model = User  # 사용자 데이터
        fields = ['id', 'password', 'password_check', 'name', 'email']  # 사용자가 변경할 데이터 필드

    def validate(self, data):
        id = data.get('id', None)
        password = data.get('password', None)
        password_check = data.get('password_check', None)
        email = data.get('email', None)
        name = data.get('name', None)
        if id is None or password is None or password_check is None or email is None or name is None:
            raise serializers.ValidationError("이름 , 이메일 , 비밀번호 , 비밀번호 확인을 입력해주세요")
        if password != password_check:
            raise serializers.ValidationError("비밀번호와 비밀번호 확인이 맞지 않습니다.")
        if not password_match(data['password']):  # 비밀번호 규제가 맞지 않은 경우
            raise serializers.ValidationError("비밀번호 규칙에 맞춰서 작성해주세요")
        if not email_match(data['email']):
            raise serializers.ValidationError("이메일 형식에 맞게 작성해주세요")
        current_user = self.context.get('request').user  # request data
        current_email = current_user.email if current_user.is_authenticated else None  # 현재 인증을 받은 사용자 여부를 통해 request.user 에 이메일 정보 를 저장
        if email != current_email:  # 유저가 입력한 이메일이 현재 DB 에 저장된 이메일과 다르다면
            if User.objects.filter(email=email).exists():
                raise serializers.ValidationError("변경 할 이메일이 이미 존재합니다.")
        return data

    def update(self, instance, validated_data):
        password = validated_data.pop('password', None)  # 만약에 패스워드 가 들어왔을떄 랑 안들어 왔을떄를 대비하여 None 데이터 준비
        if password:  # 비밀번호 데이터가 들어오면
            instance.set_password(password)  # 비밀번호 암호화
        return super().update(instance, validated_data)  # 사용자 데이터 업데이트


class UserFindIDSerializer(serializers.ModelSerializer):
    is_auth = serializers.BooleanField(required=True)  # 이메일 인증 여부
    id = serializers.CharField(required=False, read_only=True)  # 이름과 이메일이 일치하는 id 

    class Meta:
        model = User
        fields = ['name', 'email', 'is_auth', 'id']

    def validate(self, data):
        name = data.get('name', None)
        email = data.get('email', None)
        is_auth = data.get('is_auth', None)
        if name is None or email is None:
            raise serializers.ValidationError("이름 , 이메일를 입력해주세요")
        if not is_auth or is_auth is None:
            raise serializers.ValidationError("이메일 인증을 확인하세요")
        if not email_match(email):
            raise serializers.ValidationError("이메일 형식에 맞게 입력해주세요")
        try:
            user = get_user_model().objects.get(name=name, email=email)
        except get_user_model().DoesNotExist:
            raise serializers.ValidationError("해당 유저의 정보가 존재하지 않습니다")
        return {"name": name, "email": email, "is_auth": is_auth, "id": user.id}


class UserPasswordSerializer(serializers.ModelSerializer):
    is_auth = serializers.BooleanField(required=False)

    class Meta:
        model = User
        fields = ['name', 'id', 'email', 'is_auth']
        read_only_fields = ('id',)

    def validate(self, data):
        name = data.get('name', None)
        email = data.get('email', None)
        is_auth = data.get('is_auth', None)

        if name is None or email is None or is_auth is None:
            raise serializers.ValidationError("이름 ,이메일 , 이메일 인증 여부를 작성해주세요")
        if not is_auth:
            raise serializers.ValidationError("이메일 인증을 확인해주세요")
        if not email_match(email):
            raise serializers.ValidationError("이메일 형식을 맞춰주세요")

        return data


class UserChangePasswordSerializer(serializers.ModelSerializer):  # 비밀번호 찾기로 변경할 비밀번호 조회
    password = serializers.CharField(write_only=True, style={"input_type": "password"}, required=True)  # 변경할 비밀번호
    password_check = serializers.CharField(write_only=True, style={"input_type": "password"},
                                           required=True)  # 변경할 비밀번호 확인

    class Meta:
        model = User  # 변경할 DB model
        fields = ['id', 'password', 'password_check']  # 필요한 필드들

    def validate(self, data):
        password = data.get('password', None)
        password_check = data.get('password_check', None)

        if password is None or password_check is None:  # 입력한 데이터가 없을떄
            raise serializers.ValidationError("비밀번호 , 비밀번호 확인 을 입력해주세요")
        if not password_match(password) or not password_match(password_check):  # 비밀번호 형식에 맞지 않을떄
            raise serializers.ValidationError("비밀번호 형식에 맞춰서 입력해주세요")
        if password != password_check:  # 비밀번호와 비밀번호 확인이 맞지 않을때
            raise serializers.ValidationError("비밀번호와 비밀번호 확인이 맞지 않습니다")
        return data

    def update(self, instance, validated_data):  # 비밀번호 업데이트
        password = validated_data.pop('password', None)  # 만약에 패스워드 가 들어왔을떄 랑 안들어 왔을떄를 대비하여 None 데이터 준비
        if password:  # 비밀번호 데이터가 들어오면
            instance.set_password(password)  # 비밀번호 암호화
        return super().update(instance, validated_data)  # 사용자 데이터 업데이트


class QuestionImageSerializer(serializers.ModelSerializer):
    class Meta:
        model = question_board_images
        fields = ['image_url']


class QuestionCreateSerializer(serializers.ModelSerializer):
    title = serializers.CharField(required=True)  # 사용자가 관계자에게 질문할 게시글 제목
    body = serializers.CharField(required=True)  # 사용자가 관계자에게 질문할 내용
    images = QuestionImageSerializer(many=True, required=False)

    class Meta:
        model = question_board  # 데이터를 생성할 DB 모델
        fields = ['user', 'title', 'body', 'images']  # 여기는 무조건 수정

    def validate(self, data):
        if not data['title'] or not data['body']:  # 제목이 비어 있거나 , 질문이 비어 있는 경우 예외처리
            raise serializers.ValidationError('title 또는 body 의 내용이 비어있습니다.')
        return data

    def create(self, validated_data):
        images_data = self.context['request'].FILES.getlist('images')
        post = question_board.objects.create(**validated_data)  # 게시판 질문 생성
        base_path = "question_board_images/"
        ## 이미지 데이터 처리
        if len(images_data) > 0:
            for image_data in images_data:
                # 파일의 이름과 확장자를 추출합니다.
                file_name, file_extension = os.path.splitext(image_data.name)
                unique_filename = str(uuid.uuid4())
                new_file_name = unique_filename + file_extension

                # 이미지 파일의 새로운 경로
                new_path = os.path.join(base_path, new_file_name)

                # ImageFieldFile 객체의 move 메서드를 사용하여 파일 이동
                default_storage.save(new_path, image_data)

                # 이미지 모델에 새로운 경로 저장
                question_board_images.objects.create(image_url=new_path, board=post)

        return post


class QuestionDetailSerializer(serializers.ModelSerializer):
    class Meta:
        model = question_board  # 조회할 게시판 DB 모델
        fields = ['user', 'title', 'body', 'created']  # 사용자에게 보여줘야할 데이터 필드


class QuestionUpdateSerializer(serializers.ModelSerializer):
    title2 = serializers.CharField(required=False)  # 변경할 게시판 질문 제목 , 필수 x
    body = serializers.CharField(required=False)  # 변경할 게시판 질문 내용 , 필수 x
    images = QuestionImageSerializer(many=True, required=False)

    class Meta:
        model = question_board  # 데이터를 변경할 DB
        fields = ['title2', 'body', 'images']  # 변경될 데이터 필드

    def validate(self, data):
        if data['title2'] and not data['body']:  # 제목은 있으나 질문 내용이 없을때
            raise serializers.ValidationError("본문에 내용을 입력해주세요")
        if not data['title2'] and data['body']:  # 질문 내용은 있는데 제목이 없을떄
            raise serializers.ValidationError("변경된 게시글 제목을 입력해주세요")
        return data

    def update(self, instance, validated_data):
        title2 = validated_data.pop('title2', None)  # 변경될 제목
        body = validated_data.pop('body', None)  # 변경될 내용
        id = instance.id
        images_data = self.context['request'].FILES.getlist('images')  # 이용자가 업로드 한 파일
        images_obj = question_board_images.objects.filter(board_id=id)  # 기존에 DB 에 저장되어있는 게시글의 이미지
        base_path = 'question_board_images/'

        if len(images_data) > 0:
            images_obj.delete()
            for image_data in images_data:
                # 파일의 이름과 확장자를 추출합니다.
                file_name, file_extension = os.path.splitext(image_data.name)
                unique_filename = str(uuid.uuid4())
                new_file_name = unique_filename + file_extension

                # 이미지 파일의 새로운 경로
                new_path = os.path.join(base_path, new_file_name)

                # ImageFieldFile 객체의 move 메서드를 사용하여 파일 이동
                default_storage.save(new_path, image_data)

                # 이미지 모델에 새로운 경로 저장
                question_board_images.objects.create(image_url=new_path, board_id=id)

        if title2 and body:  # 변경 제목 과 내용이 둘다 존재 할경우
            instance.title = title2
            instance.body = body
        if not title2 and not body:  # 둘다 내용이 없는 경우
            print("업데이트 변화 없음")
        instance.created = timezone.now()  # 작성 일자 갱신
        return super().update(instance, validated_data)


class QuestionListSerializer(serializers.ModelSerializer):
    class Meta:
        model = question_board  # 사용자의 모든 질문을 조회할 DB
        fields = ['user', 'title', 'state', 'created']  # 조회할 필드


class QuestionCommentCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = question_board_comments
        fields = ['comment', 'board']

    def validate(self, data):
        comment = data.get('comment', None)  # 관리자가 작성한 댓글
        board = data.get('board', None)  # 관리자가 작성할 게시글
        board_id = int(board.id)
        current_user = self.context.get('request').user  # request 를 보낸 유저 = 관리자
        is_manager = current_user.is_staff if current_user.is_authenticated else None  # 인증이 된 관리자만 staff 여부를 확인 할수 있는 정보를 넘겨준다 아니면 None
        if not is_manager:  # 관계자가 아닌경우
            raise serializers.ValidationError("게시글을 작성할수 있는 권한이 없습니다.")
        if comment is None or board_id is None:  # 댓글 or 게시글 정보가 없는 경우
            raise serializers.ValidationError("댓글 , 게시글 정보가 존재하지 않습니다")
        if not question_board.objects.filter(id=board_id).exists():  # 게시글 존재 여부
            raise serializers.ValidationError("게시글이 존재하지 않습니다.")
        return data

    def create(self, validated_data):
        comment = validated_data.pop('comment')
        board = validated_data.pop('board')
        board_id = int(board.id)
        question_board_comments.objects.create(comment=comment, board_id=board_id)
        question = question_board.objects.get(id=board_id)
        question.state = True
        question.save()
        return True


class education_report_Serailizer(serializers.ModelSerializer):
    class Meta:
        model = education_report
        fields = ['user', 'chapter']


# paper Serializer

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
        fields = ['is_answer', 'paper', 'user']

    def validate(self, data):
        is_answer = data.get('is_answer', None)
        paper = data.get('paper', None)
        user = data.get('user', None)

        if is_answer is None or paper is None or user is None:
            raise serializers.ValidationError("문제 풀이 정보가 없습니다")

        return data

    def create(self, validated_data):
        is_answer = validated_data.pop('is_answer')
        paper = validated_data.pop('paper')
        user = validated_data.pop('user')
        practice_note.objects.create(is_answer=is_answer, paper=paper, user_id=user)
        return validated_data

    def update(self, instance, validated_data):
        is_answer = validated_data.pop('is_answer')
        paper = validated_data.pop('paper')
        user = validated_data.pop('user')
        instance.is_answer = is_answer
        return super().update(instance, validated_data)

### 암기모드 API serializer
