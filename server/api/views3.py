# 형호
from django.db.models import Q
from rest_framework import status
from rest_framework.response import Response
from rest_framework.views import APIView

from .models import question_board
from .serializers import QuestionCreateSerializer, QuestionListSerializer, QuestionDetailSerializer, \
    QuestionUpdateSerializer


class QuestionView(APIView):
    def get(self, request):
        # 질문에 대한 정보를 필터링 하기위한 파라미터
        id = request.query_params.get('id')
        title = request.query_params.get('title')

        # 질문에 관한 데이터만 가져온다
        question = question_board.objects.get(Q(user=id) & Q(title=title))

        # 질문에 대한 데이터 의 직렬화
        question_serializer = QuestionDetailSerializer(question)

        return Response(data=question_serializer.data, status=status.HTTP_200_OK)

    def post(self, request):
        serializer = QuestionCreateSerializer(data=request.data)
        if serializer.is_valid():
            serializer.create(validated_data=serializer.validated_data)
            return Response(data={'question_board': serializer.data},
                            status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def put(self, request, user, title):
        question = question_board.objects.get(Q(user=user) & Q(title=title))  # user , title , body , state create
        serializer = QuestionUpdateSerializer(question, data=request.data)

        if serializer.is_valid():
            serializer.update(question, serializer.validated_data)
            return Response(status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def delete(self, request, user, title):
        user = question_board.objects.get(Q(user=user) & Q(title=title))
        user.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)


class QuestionListView(APIView):
    def get(self, request):
        id = request.query_params.get('id')
        queryset = question_board.objects.filter(user=id)
        serializer = QuestionListSerializer(queryset, many=True)
        return Response(data=serializer.data, status=status.HTTP_200_OK)
