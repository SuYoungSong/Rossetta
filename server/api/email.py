import random

from django.core.cache import cache
from django.core.mail import EmailMultiAlternatives
from django.template.loader import render_to_string
from django.utils import timezone


# 이메일 인증 번호 데이터 준비 + 캐시 메모리 설정
def email_data_set(type, time):
    six_digital_random = ''.join([str(random.randint(0, 9)) for _ in range(6)])
    unique_number = f"{timezone.now()}{six_digital_random}{type}"
    cache_key = f"email_data:{unique_number}"
    cache.set(cache_key, {'six_digital_random': six_digital_random}, time)
    return unique_number, six_digital_random


# 이메일 데이터 전송
def email_send(type, context_data, email):
    if type == 'sign_up':
        email = EmailMultiAlternatives(  # Email Message 와 다르게 html template 을 보내기 위해서는 MultiAlternative 를 같이 보낸다.
            subject="ROSSETTA 회원가입 인증번호입니다.",
            to=[email],
        )
    elif type == 'find_id':
        email = EmailMultiAlternatives(  # Email Message 와 다르게 html template 을 보내기 위해서는 MultiAlternative 를 같이 보낸다.
            subject="ROSSETTA 아이디 찾기 인증번호입니다.",
            to=[email],
        )
    else:
        email = EmailMultiAlternatives(  # Email Message 와 다르게 html template 을 보내기 위해서는 MultiAlternative 를 같이 보낸다.
            subject="ROSSETTA 비밀번호 찾기 인증번호입니다.",
            to=[email],
        )
    context = {'type':type,'six_digital_random': context_data}
    html_content = render_to_string('email.html', context)
    email.attach_alternative(html_content, 'text/html')
    email.send()

# 이메일 인증 데이터 전송 응답 JSON 데이터
def email_return_json(unique_number):
    data = {
        'unique_number':unique_number,
        "state":"메일 확인후 5분 내로 인증 번호를 알려주세요"
    }
    return data


# 이메일 캐시 메모리 데이터 가져오기
def email_data_get(unique_number):
    cache_key = f"email_data:{unique_number}"
    cache_data = cache.get(cache_key, None)
    return cache_data


# 캐시 안에 key 에 해당하는 value 가져오기
def key_data_get(cache_data, key):
    return cache_data.get(key, "")
