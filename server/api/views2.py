from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework import status
from .models import paper
from .serializers2 import *


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
            serializer = PaperTypeSituationSerializer(qs,many=True)
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

    def post(self, request):    # 중복 문제 발생 -> 한 문제 를 같은 사람이 여러번 푸는것이 record 에 남는다
        serializer = PracticeNoteSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def put(self, request, paper_id, user_id):
        try:
            practice_note_instance = practice_note.objects.get(paper=paper_id, user=user_id)
        except practice_note.DoesNotExist:
            return Response({"error": f"paper_id '{paper_id}', user_id '{user_id}'에 대한 데이터가 없습니다."},
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

