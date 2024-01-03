'user client';
import React, { ChangeEvent, useState } from 'react';
import axios from 'axios';

interface ModalProps {
  onClose: () => void;
}

const Modal: React.FC<ModalProps> = ({ onClose }) => {
  const [fileName, setFileName] = useState<string>('첨부파일');

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const fileInput = event.target;

    if (fileInput.files && fileInput.files.length > 0) {
      const uploadedFileName = fileInput.files[0].name;
      setFileName(uploadedFileName);
    } else {
      setFileName('첨부파일');
    }
  };

  return (
    <form className='modalWrapper' action={'http://localhost:8000/api/question/'} method='POST'>
      <div className='modalContent'>
        <div className='modalTop'>
          <div className='modalTitle'>1:1문의</div>
          <div className='modalClose' onClick={onClose}>X</div>
        </div>

        <div className='modalMain'>
          <input type='hidden' value={"admin"} name="user"/>
          <div className='modalMainTitle'>제목</div>
          <input name='title' className='inputTitle' type="text" placeholder="제목을 입력하세요" />
          <div className='modalMainContent'>내용</div>
          <textarea name='body' className='inputContent' placeholder="내용을 입력하세요"></textarea>
        </div>

        <div className='attachBtn'>
          <input id="file" type="file" onChange={handleFileChange} />
          <label htmlFor="file">첨부하기</label>
          <input className="fileName" value={fileName} placeholder="첨부파일" readOnly />
        </div>

        <div className='modalBtn'>
          <button type='submit' className='modalSubmit'>확인</button>
        </div>
      </div>
    </form>
  );
};

export default Modal;
