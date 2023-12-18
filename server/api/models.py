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


class post(models.Model):
    pass