from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework import status
from .models import paper
from .serializers2 import *

### sms
import re, requests
import sys
import os
from django.conf import settings
import hashlib
import hmac
import base64
import time

##########################################################################
################################ Paper ###################################
##########################################################################
class PaperTypeSituationView(APIView):
    '''
    GET: 타입(단어, 문장)이 들어오면 DB에 있는 상황(은행, 학교, 병원)들을 반환해준다.
    '''

    def get(self, request, type):
        try:
            qs = paper.objects.filter(type=type)
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
            qs = paper.objects.filter(type=type, situation=situation)
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
            print(id)
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

    def post(self, request):
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

# ##########################################################################
# ############################ 문자 본인 인증 ################################
# ##########################################################################

def naver_send_sms(phone, cert_num):
    '''
        인증번호를 문자메시지로 보내는 함수
        :param 문자메시지를 보낼 전화 번호:
        :param 6자리 인증 코드:
        :return POST 결과 Status 코드:
    '''
    serviceId = settings.NAVER_SMS_SERVICE_ID
    access_key = settings.NAVER_SMS_ACCESS_KEY
    secret_key = settings.NAVER_SMS_SECRET_KEY
    secret_key = bytes(secret_key, 'UTF-8')
    send_number = settings.SMS_SEND_NUMBER
    def make_signature():
        timestamp = int(time.time() * 1000)
        timestamp = str(timestamp)

        method = "GET"
        uri = f'/sms/v2/services/{serviceId}/messages'

        message = method + " " + uri + "\n" + timestamp + "\n" + access_key
        message = bytes(message, 'UTF-8')
        signingKey = base64.b64encode(hmac.new(secret_key, message, digestmod=hashlib.sha256).digest())
        return signingKey

    post_url = f'https://sens.apigw.ntruss.com/sms/v2/services/{serviceId}/messages'

    headers = {
        'Content-Type': 'application/json; charset=utf-8',
        'x-ncp-apigw-timestamp' : '',
        'x-ncp-iam-access-key' : '',
        'x-ncp-apigw-signature-v2' : make_signature()
    }

    content = f'[Rossetta]\n 인증번호: [{cert_num}]\n 인증번호를 3분이내 입력하세요.'

    data = {
        "type": "SMS",
        "contentType": "COMM",
        "countryCode": '82',
        "from": send_number,
        "content": '[Rossetta] 문자 본인인증',
        "subject": "SENS",
        "messages": [
            {
                "to": phone,
                "content" : content
            }
        ]
    }

    response = requests.post(post_url, headers=headers, json=data)
    return response.status_code



def iwinv_send_sms(phone, cert_num):
    '''
    인증번호를 문자메시지로 보내는 함수
    :param 문자메시지를 보낼 전화 번호:
    :param 6자리 인증 코드:
    :return POST 결과 Status 코드:
    '''
    IWIN_SMS_API_KEY = settings.IWIN_SMS_API_KEY
    SMS_SEND_NUMBER = settings.SMS_SEND_NUMBER
    post_url = f'https://sms.bizservice.iwinv.kr/api/v2/send/'

    headers = {
        'Secret' : IWIN_SMS_API_KEY,
        'Content-Type': 'application/json;charset=UTF-8'
    }

    content = f'[Rossetta]\n 인증번호: [{cert_num}]\n 인증번호를 3분이내 입력하세요.'

    data = {
        "version": "1.0" ,
        "from" : SMS_SEND_NUMBER,
        "to" :  phone,
        "text" : content
    }

    response = requests.post(post_url, headers=headers, data=data)
    return response.status_code

class SmsCertifiedView(APIView):
    '''
    문자 메시지 인증번호를 발송 시키는 API
    POST : 전화번호 유효성 검사 후 음의의 난수를 SMS로 보낸다.
    '''
    def post(self, request):

        # 1. 문자 인증을 진행 할 전화번호를 request 받는다.
        phone = request.POST.get('phone')

        # 2. 유효한 번호인지 체크한다. ( ex: 01000000000 구조 )
        phone_regex = re.compile(r'^010[0-9]{8}$')
        if not bool(phone_regex.match(phone)):
            return Response({"error": "전화번호 형식이 잘못되었습니다."}, status=status.HTTP_404_NOT_FOUND)

        # 3. 임의의 난수를 생성한다.
        random_number = random.randint(100000, 999999)

        # 4. DB에 난수를 저장한다. ( timeOut 3분 )
        # 만약 기존에 해당 휴대폰 번호로 발급되어 있는 임의의 난수가 있는 경우 덮어씌운다. ( 재발송 )
        # 해당 스마트폰 번호로 하루에 5번 이상 인증 메시지가 발송된 경우 error처리 시킨다.
        #return Response({"error": "하루동안 가능한 인증 횟수를 초과하였습니다."}, status=status.HTTP_404_NOT_FOUND)

        # 5. 난수를 사용자 핸드폰 번호로 SMS를 보낸다.
        response_state_code = send_sms(phone, random_number)

        # 6. 끝 ( 정상적으로 처리되었다는 정상 코드를 반환한다 )
        return Response(status=response_state_code)

class SmsCertifiedCheckView(APIView):
    '''
    인증번호를 검증하는 API

    POSt : 해당 번호에 해당하는 인증번호가 맞는지 Check
    '''

    def post(self,request):
        phone = request.POST.get('phone')
        cert_num = request.POST.get('number')

        # 1. DB에서 해당 휴대폰번호(phone)에 주어진 난수가 cert_num과 다르다면 인증 실패
        #   or DB에 해당 휴대폰 번호에 주어진 난수가 없는경우 ( 3분 시간초과 ) 인증 실패
            # return Response({"error": "전화번호 인증에 실패하였습니다."}, status=status.HTTP_404_NOT_FOUND)
        # 같다면 인증 성공
        return Response(status=status.HTTP_200_OK)