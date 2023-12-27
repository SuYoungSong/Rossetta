# 사용자 정보 권한 permission
from rest_framework import permissions
from rest_framework.authtoken.models import Token


class IsTokenOwner(permissions.BasePermission):
    def has_permission(self, request, view):
        auth_token = request.headers.get('Authorization', None)  # 헤더에 있는 인증 토큰값 없으면 None 을 리턴
        if auth_token is None:      #  해당 데이터가 없으면 False
            return False
        token_key = auth_token.split(' ')[-1]
        try:
            token = Token.objects.get(key=token_key)  # 토큰 key 에 해당 하는 정보를 가져온다
        except token.DoesNotExist:
            return False
        if request.user.id != token.user:
            return False
        return True
