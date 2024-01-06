import re

from .models import paper


def password_match(password):
    pattern = r"^(?=.*[A-Z])(?=.*[a-z])(?=.*\d)(?=.*[\W_]).{8,}$"
    return re.match(pattern, password)


def email_match(email):
    pattern = r"^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$"
    return re.match(pattern, email)


def id_form_check(id):
    if not (4 <= len(id) <= 15):  # 아이디 글자수 8 ~ 15 자리 제한
        return False
    if not re.match("^[a-zA-Z0-9]+$", id):  # 아이디는 영어 대소문자 , 숫자만 가능
        return False

    return True


def is_blank_or_is_null(data):
    if len(data) == 0 or data is None:
        return True
    return False


def is_null(data):
    if data is None:
        return True
    return False


def word_data_check(id, type, situation, chapter, is_deaf):
    help_text = ""
    error_code = ""
    situations = ['학교', '병원', '직업']
    if len(id) == 0 or id is None:
        help_text = "아이디 정보를 입력해주세요"
        error_code = "400"
        return [help_text, error_code]
    if type != "단어":
        help_text = "단어 유형 전용 서비스 입니다"
        error_code = "400"
        return [help_text, error_code]
    if len(situation) == 0 or situation is None:
        help_text = "상황 정보를 입력해주세요"
        error_code = "400"
        return [help_text, error_code]
    if situation not in situations:
        help_text = "조회되는 상황 정보가 없습니다"
        error_code = "404"
        return [help_text, error_code]
    if chapter is None:
        help_text = "챕터 정보를 입력해주세요"
        error_code = "400"
        return [help_text, error_code]
    chapters = paper.objects.filter(type=type, situation=situation).values_list('chapter').distinct()
    chapter_min, chapter_max = min(chapters)[0], max(chapters)[0]
    print(chapter_min , chapter , chapter_max)
    if not (chapter_min <= chapter <= chapter_max):
        help_text = "해당 챕터가 조회되지 않습니다"
        error_code = "404"
        return [help_text, error_code]
    if is_deaf != False and is_deaf != True:
        help_text = "농아인 여부 정보가 필요합니다."
        error_code = "400"
        return [help_text, error_code]
    return [help_text, error_code]


def sentence_data_check(id, type, chapter, is_deaf):
    help_text = ""
    error_code = ""
    if len(id) == 0 or id is None:
        help_text = "아이디 정보를 입력해주세요"
        error_code = "400"
        return [help_text, error_code]
    if type != "문장":
        help_text = "문장 유형 전용 서비스 입니다"
        error_code = "400"
        return [help_text, error_code]
    if chapter is None:
        help_text = "챕터 정보를 입력해주세요"
        error_code = "400"
        return [help_text, error_code]
    chapters = paper.objects.filter(type=type).values_list('chapter').distinct()
    chapter_min, chapter_max = min(chapters)[0], max(chapters)[0]
    if not (chapter_min <= chapter < chapter_max):
        help_text = "해당 챕터가 조회되지 않습니다"
        error_code = "404"
        return [help_text, error_code]
    if is_deaf != False and is_deaf != True:
        help_text = "농아인 여부 정보가 필요합니다."
        error_code = "400"
        return [help_text, error_code]
    return [help_text, error_code]
