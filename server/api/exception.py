import re


def password_match(password):
    pattern = r"^(?=.*[A-Z])(?=.*[a-z])(?=.*\d)(?=.*[\W_]).{8,}$"
    return re.match(pattern, password)


def email_match(email):
    pattern = r"^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$"
    return re.match(pattern, email)


def id_form_check(id):
    if not (8 <= len(id) <= 15):            # 아이디 글자수 8 ~ 15 자리 제한
        return False
    if not re.match("^[a-zA-Z0-9]+$", id):  # 아이디는 영어 대소문자 , 숫자만 가능
        return False

    return True

def is_blank_or_is_null(data):
    if len(data) == 0 or data is None:
        return True
    return False
