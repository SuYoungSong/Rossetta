import React, { useState } from 'react';
import axios from "axios";
import '@/app/styles/mypage.css'

interface ChangePasswordModalProps {
  show: boolean;
  onHide: () => void;
}

const ChangePasswordModal: React.FC<ChangePasswordModalProps> = ({ show, onHide }) => {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [newPasswordErrorState, setNewPasswordErrorState] = useState(false);
  const [basePasswordErrorState, setBasePasswordErrorState] = useState(false);
  const [passwordErrorMessage, setPasswordErrorMessage] = useState('');

  const handlePasswordChange = () => {
      // 새로운 비밀번호와 새로운 비밀번호 확인이 서로 다른 경우 에러 메시지 표시
      if (newPassword === '' || newPassword === null || newPassword === undefined || newPassword !== confirmNewPassword) {
          setNewPasswordErrorState(true);
          setPasswordErrorMessage('새로운 비밀번호와 확인용 비밀번호가 일치하지 않거나 값이 없습니다.')
          return;
      }
      const accessToken = localStorage.getItem('accessToken');
      // 기존 비밀번호가 맞는지 check
      axios.post(
          "http://localhost:8000/api/tokenusercheck/",
          {password: currentPassword,},
          {headers: {'Authorization': `Token ${accessToken}`}})
          .then((res) => {
              // 기존 비밀번호 통과한경우 pass
              setBasePasswordErrorState(false)
              // 비밀번호 변경 로직 수행
              passwordChange();

          })
          .catch((err) => {
              setBasePasswordErrorState(true);
              setNewPasswordErrorState(false);
              setPasswordErrorMessage(err.response.data.state)
              // 요청에 실패한 경우
              console.log("err >> ", err);

          });

      const passwordChange = () => {
          const userId = localStorage.getItem('id');
          axios.put(
              "http://localhost:8000/api/userchangepassword/",
              {
                  id: userId,
                  password: newPassword,
                  password_check: confirmNewPassword

              })
              .then((res) => {
                  // 비밀번호 변경 완료시 모달 닫기
                  handleCloseModal();
              })
              .catch((err) => {
                  setBasePasswordErrorState(false);
                  setNewPasswordErrorState(true);
                  setPasswordErrorMessage(err.response.data.non_field_errors[0])
                  // 요청에 실패한 경우
                  console.log("err >> ", err);
                  return null;
              });
      };
  }

  // onHide가 호출될 때 에러 메시지도 없애기
  const handleCloseModal = () => {
    setNewPasswordErrorState(false);
    setBasePasswordErrorState(false);
    setPasswordErrorMessage('');
    onHide();
  };

  if (!show) {
    return null;
  }

  return (
    <div className="modal">
      <div className="modal-content">
        <h2>비밀번호 변경하기</h2>
        {(newPasswordErrorState || basePasswordErrorState) && (
          <div className='pwErrorMsg'>
            {passwordErrorMessage}
          </div>
        )}
        <form>
            <label htmlFor="currentPassword" className="pass-label">기존 비밀번호</label>
            <input
              type="password"
              id="currentPassword"
              className="only-one-input"
              placeholder="기존 비밀번호를 입력하세요."
              onChange={(e) => setCurrentPassword(e.target.value)}
              style={{ border: basePasswordErrorState ? '1px solid red' : '1px solid #ccc' }}
              required
            />
            <br />

            <label htmlFor="newPassword" className="pass-label">새로운 비밀번호</label>
            <input
              type="password"
              id="newPassword"
              className="only-one-input"
              placeholder="변경할 비밀번호를 입력하세요."
              onChange={(e) => setNewPassword(e.target.value)}
              style={{ border: newPasswordErrorState ? '1px solid red' : '1px solid #ccc' }}
              required
            />
            <br />

            <label htmlFor="confirmNewPassword" className="pass-label">새로운 비밀번호 확인</label>
            <input
              type="password"
              id="confirmNewPassword"
              className="only-one-input"
              placeholder="변경할 비밀번호와 동일하게 입력하세요."
              onChange={(e) => setConfirmNewPassword(e.target.value)}
              style={{ border: newPasswordErrorState ? '1px solid red' : '1px solid #ccc' }}
              required
            />
            <br />

          <button className="pwUpdateBtn" onClick={handlePasswordChange}>
            변경하기
          </button>
          <button className="pwCancelBtn" onClick={handleCloseModal}>
            취소하기
          </button>
        </form>
      </div>
    </div>
  );
};

export default ChangePasswordModal;
