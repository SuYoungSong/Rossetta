import React from 'react';

interface YourModalComponentProps {
  onClose: () => void;
}

const detailUser: React.FC<YourModalComponentProps> = ({ onClose }) => {
  return (
    <div className='modalWrapper'>
      <div className='modalContent'>
        <div className='modalTop'>
          <div className='modalTitle'>1:1 문의</div>
          <div className='modalClose' onClick={onClose}>
            X
          </div>
        </div>

        <div className='modalMain'>
          <div className='modalMainTitle'>질문</div>
          <div className='modalTime'>
            <p className='modalClientDate'>작성일: 2024.01.01</p>
            <p className='modalClientName'>작성자: 학생</p>
          </div>
          <input
            className='inputedTitle'
            type="text"
            placeholder="사용자가 작성한 질문의 제목이 보여야 함"
          />
          <div className='modalMainContent'>내용</div>
          <textarea
            className='inputedContent'
            placeholder="사용자가 남긴 질문의 내용이 보여야 함"
          ></textarea>
          <div className='upFile'>업로드된 파일</div>
          <div className='modalMainTitle'>답변</div>
          <div className='modalTime'>
            <p className='modaladminDate'>작성일: 2024.01.01</p>
            <p className='modaladminName'>작성자: 관리자</p>
          </div>
          <div className='modalMainTitle'>답변 내용</div>
          <textarea
            className='inputedAnswer'
            placeholder="입력된 답변이 보여야함"
          ></textarea>
        </div>

        <div className='modalBtn'>
        
          <button className='modalUpdateBtn'>수정</button>
          <button className='modalDeleteBtn'>삭제</button>
          <button className='modalCloseBtn' onClick={onClose}>확인</button>
        </div>
      </div>
    </div>
  );
};

export default detailUser;

