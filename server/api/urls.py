from django.urls import path
from .views import *

app_name = 'api'

urlpatterns = [
    ## USER API
    path('user/', UserView.as_view()),  # create , detail , update

    ## ID PASSWORD LOST API
    path('useridemailsend/', UserIDEmailSendView.as_view()),  # 아이디 찾기 이메일 인증 번호 전송 API
    path('userpasswordemailsend/', UserPasswordEmailSendView.as_view()),  # 비밀번호 찾기 이메일 인증번호 전송 API

    ## ID Check duplication
    path('idcheckduplicate/', IDCheckDuplicationView.as_view()),  # 아이디 중복확인 api url

    ## Sign API
    path('signupemailsend/', SignUpSendView.as_view()),  # 회원가입 이메일 인증 번호 전송 API
    path('emailcheck/', EmailCheckView.as_view()),  # 이메일 인증 번호 확인 API

    ## User Find
    path('userfindid/', UserFindIDView.as_view()),  # 아이디 인증 + 찾기
    path('userpassword/', UserPasswordView.as_view()),  # 비밀번호 인증
    path('userchangepassword/', UserChangePasswordView.as_view()),  # 비밀번호 변경

    ## Login API
    path('login/', UserLoginView.as_view()),
    path('logout/', UserLogoutView.as_view()),
    ## paper API
    path('paper/p/<int:id>/', PaperOneDataView.as_view()),  # paper record 조회
    path('paper/word/<str:type>/', PaperTypeSituationView.as_view()),  # 단어 유형 -> situation
    path('paper/word/<str:type>/<str:situation>/', PaperTypeSituationChapterWordView.as_view()),  # 단어 + 상황 -> chapter
    path('paper/sentence/<str:type>/', PaperTypeChapterSentenceView.as_view()),  # 문장 유형 -> chapter
    path('paper/word/<str:type>/<str:situation>/<int:chapter>/', PaperManyDataWordView.as_view()),
    # 단어 + 상황 + 챕터 -> 해당 챕터에 있는 문제 list
    path('paper/sentence/<str:type>/<int:chapter>/', PaperManyDataSentenceView.as_view()),
    # 문장 + 챕터 -> 챕터 안에 있는 문제 list
    ## PracticeNote API
    path('practice-note/', PracticeNoteView.as_view()),  # post put
    path('practice-note/word/', WordPlacticeNoteView.as_view()),  # 단어 오답 조회
    path('practice-note/sentence/', SentencePlacticeNoteView.as_view()),  # 문장 오답 조회
    path('practice-note/<int:paper_id>/<str:user_id>/', PracticeNoteView.as_view()),

    ## Posting API
    path('question/', QuestionView.as_view()),
    path('question/<int:id>/', QuestionView.as_view()),  # 게시글 상세 조회
    path('questionlist/<str:id>/', QuestionListView.as_view()),  # 사용자가 작성한 게시글 리스트 조회

    ## Comment API
    path('comment/', QuestionCommentCreateView.as_view()),

    ## 문제 API
    path('wordquestion/', WordQuestionView.as_view()),
    path('sentencequestion/', SentenceQuestionView.as_view()),
    path('wrongwordquestion/', WrongWordQuestionView.as_view()),
    path('wrongsentecequestion/', WrongSentenceQuestionView.as_view()),
    ## token time renewal api
    path('renewaltokentime/', RenewalTokenTimeView.as_view()),
    path('autologout/', AutoLogoutView.as_view()),

    ## Scenario api
    path('scenario/', ScenarioView.as_view()),

    ## id + password cross check
    path('tokenusercheck/', TokenPasswordUserCheckView.as_view()),
]
