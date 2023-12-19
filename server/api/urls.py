from django.urls import path
from .views2 import *

app_name = 'api'

urlpatterns = [
    ## paper API
    path('paper/p/<int:id>/',PaperOneDataView.as_view() ),
    path('paper/<str:type>/',PaperTypeSituationView.as_view() ),
    path('paper/<str:type>/<str:situation>/',PaperTypeSituationChapterView.as_view() ),
    path('paper/<str:type>/<str:situation>/<int:chapter>/',PaperManyDataView.as_view() ),


    ## PracticeNote API
    path('practice-note/',PracticeNoteView.as_view())
]