from django.urls import path
from .views2 import *
from .views import UserView
from .views3 import QuestionView, QuestionListView

app_name = 'api'

urlpatterns = [
    ## USER API
    path('user/', UserView.as_view()),

    ## paper API
    path('paper/p/<int:id>/', PaperOneDataView.as_view()),
    path('paper/<str:type>/', PaperTypeSituationView.as_view()),
    path('paper/<str:type>/<str:situation>/', PaperTypeSituationChapterView.as_view()),
    path('paper/<str:type>/<str:situation>/<int:chapter>/', PaperManyDataView.as_view()),

    ## PracticeNote API
    path('practice-note/', PracticeNoteView.as_view()),

    ## Posting API
    path('question/',QuestionView.as_view()),
    path('question/<str:user>/<str:title>/',QuestionView.as_view()),
    path('questionlist/',QuestionListView.as_view()),
]
