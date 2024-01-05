import React from 'react';

interface ConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

const accountDeleteModal: React.FC<ConfirmationModalProps> = ({ isOpen, onClose, onConfirm }) => {
  if (!isOpen) {
    return null;
  }

  return (
    <div className="modal">
      <div className="modal-content">
        <p className='accPtag'>정말로 회원탈퇴를 진행하시겠습니까? <br></br>탈퇴시 정보는 되돌릴 수 없습니다.</p>
        <button className="accDelBtn" onClick={onConfirm}>회원탈퇴</button>
        <button className="accDelBtn" onClick={onClose}>유지하기</button>
      </div>
    </div>
  );
};

export default accountDeleteModal;
