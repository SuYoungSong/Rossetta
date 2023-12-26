from django.urls import path
from .views2 import *
from .views import UserView, UserLoginView, UserLogoutView, SignUpSendView, EmailCheckView, UserIDEmailSendView, \
    UserPasswordEmailSendView, UserFindIDView, UserPasswordView, UserChangePasswordView
from .views3 import QuestionView, QuestionListView

app_name = 'api'

urlpatterns = [
    ## USER API
    path('user/', UserView.as_view()),  # create , detail
    path('user/<str:id>/', UserView.as_view()),  # update , delete api

    ## ID PASSWORD LOST API
    path('useridemailsend/', UserIDEmailSendView.as_view()),  # 아이디 찾기 이메일 인증 번호 전송 API
    path('userpasswordemailsend/', UserPasswordEmailSendView.as_view()),  # 비밀번호 찾기 이메일 인증번호 전송 API

    ## Sign API
    path('signupemailsend/', SignUpSendView.as_view()),  # 회원가입 이메일 인증 번호 전송 API
    path('emailcheck/', EmailCheckView.as_view()),  # 이메일 인증 번호 확인 API

    ## User Find
    path('userfindid/', UserFindIDView.as_view()),  # 아이디 인증 + 찾기
    path('userpassword/',UserPasswordView.as_view()),   # 비밀번호 인증
    path('userchangepassword/',UserChangePasswordView.as_view()),   # 비밀번호 변경

    ## Login API
    path('login/', UserLoginView.as_view()),
    path('logout/', UserLogoutView.as_view()),
    ## paper API
    path('paper/p/<int:id>/', PaperOneDataView.as_view()),
    path('paper/<str:type>/', PaperTypeSituationView.as_view()),
    path('paper/<str:type>/<str:situation>/', PaperTypeSituationChapterView.as_view()),
    path('paper/<str:type>/<str:situation>/<int:chapter>/', PaperManyDataView.as_view()),

    ## PracticeNote API
    path('practice-note/', PracticeNoteView.as_view()),
    path('practice-note/<int:paper_id>/<str:user_id>', PracticeNoteView.as_view()),

    ## Posting API
    path('question/', QuestionView.as_view()),
    path('question/<int:id>/', QuestionView.as_view()), # 게시글 상세 조회
    path('questionlist/<str:id>/', QuestionListView.as_view()),  # 사용자가 작성한 게시글 리스트 조회
]
