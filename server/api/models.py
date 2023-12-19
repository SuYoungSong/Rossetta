from django.contrib.auth.base_user import AbstractBaseUser, BaseUserManager
from django.contrib.auth.models import PermissionsMixin
from django.db import models
from django.utils import timezone


# Create your models here.
class CustomUserManager(BaseUserManager):
    def create_user(self, user_id, password=None, **extra_fields):
        extra_fields.setdefault('is_staff', False)
        extra_fields.setdefault('is_superuser', False)
        extra_fields.setdefault('is_active', True)
        extra_fields.setdefault('date_joined', timezone.now())

        if not user_id:
            raise ValueError("유저 아이디를 반드시 입력해주세요")

        user = self.model(user_id=user_id, **extra_fields)
        user.set_password(password)
        user.save()
        return user

    def create_superuser(self, user_id, password=None, **extra_fields):
        extra_fields.setdefault('is_staff', True)
        extra_fields.setdefault('is_superuser', True)
        extra_fields.setdefault('is_active', True)
        extra_fields.setdefault('date_joined', timezone.now())

        if extra_fields.get('is_staff') is not True:
            raise ValueError("관리자는 무조건 관계자이다.")
        if extra_fields.get('is_superuser') is not True:
            raise ValueError('관리자는 무조건 superuser 이다.')

        return self.create_user(user_id, password, **extra_fields)


# User 객체
class User(AbstractBaseUser, PermissionsMixin):
    # custom field
    # id , pw , username ,
    id = models.CharField(max_length=30, unique=True, null=False, blank=False, primary_key=True)
    password = models.CharField(max_length=20, null=False, blank=False)
    name = models.CharField(max_length=30, null=False, blank=False)
    phone = models.CharField(max_length=15, null=False, blank=False)
    token = models.CharField(max_length=70, null=True)
    is_staff = models.BooleanField(default=False)
    is_superuser = models.BooleanField(default=False)
    is_active = models.BooleanField(default=True)
    date_joined = models.DateTimeField(auto_now_add=True)

    # Username = 유저의 아이디 = 다시 재정의  , Required_field

    objects = CustomUserManager()

    USERNAME_FIELD = 'id'
    REQUIRED_FIELDS = ['password', 'name', 'phone']

    def __str__(self):
        return self.id


# 질문 게시판 객체
class question_board(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    title = models.CharField(max_length=50, null=False, blank=False)
    body = models.TextField(null=False, blank=False)
    state = models.BooleanField(default=False)
    created = models.DateTimeField(auto_now_add=True)


# 질문 게시판 객체 - 이미지
class question_board_images(models.Model):
    board = models.ForeignKey(question_board, on_delete=models.CASCADE)
    image_url = models.ImageField(upload_to='question_board_images/')


# 질문 게시판 객체 - 답변
class question_board_comments(models.Model):
    board = models.ForeignKey(question_board, on_delete=models.CASCADE)
    comment = models.TextField(null=False, blank=False)


# 완료한 챕터 기록
class education_report(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    chapter = models.IntegerField(null=False, blank=False)


# 학습지(문제지)를 저장하는 객체
class paper(models.Model):
    question_range = (
        ('자음/모음', '자음/모음'),
        ('단어', '단어'),
        ('문장', '문장')
    )

    type = models.CharField(max_length=10, choices=question_range)
    situation = models.CharField(max_length=8, null=False, blank=False)
    chapter = models.IntegerField(null=False, blank=False)
    sign_video_url = models.URLField(null=False, blank=False)
    sign_answer = models.CharField(max_length=8, null=False, blank=False)


class practice_note(models.Model):
    paper = models.ForeignKey(paper, on_delete=models.CASCADE)
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    is_answer = models.BooleanField()
