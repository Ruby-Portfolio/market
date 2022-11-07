export enum AuthErrorMessage {
  INVALID_PASSWORD = '비밀번호는 영문자 하나, 숫자 하나를 포함한 8글자 이상이어야 합니다.',
  EXISTS_EMAIL_USER = '해당 이메일로 가입된 계정이 존재합니다.',
  NAME_MIN_LENGTH = '이름은 최소 2글자 이상이어야 합니다.',
  INVALID_PHONE = '전화번호 형식이 올바로지 않습니다.',
  INVALID_EMAIL = '이메일 형식이 올바로지 않습니다.',
}
