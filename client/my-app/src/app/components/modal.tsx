"user client";
import React, { ChangeEvent, useState, useEffect } from 'react';
import axios from 'axios';

interface ModalProps {
  onClose: () => void;
}

const Modal: React.FC<ModalProps> = ({ onClose }) => {
  const [fileName, setFileName] = useState<string>('첨부파일');
  const [title, setTitle] = useState<string>('');
  const [body, setBody] = useState<string>('');
  const [file, setFile] = useState();
  const [accessToken, setAccessToken] = useState('');
  const [userId, setUserId] = useState('');
  const formData = new FormData();

      // 필요한 데이터 추가
      formData.append('title', title);
      formData.append('body', body);
      formData.append('user',userId);
      // 파일이 선택되었다면 FormData에 추가
      if (file) {
        formData.append('images', file);
      }
const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
  const fileInput = event.target;

  if (fileInput.files && fileInput.files.length > 0) {
    // 파일이 선택되었을 때
    const uploadedFile = fileInput.files[0];
    setFile(uploadedFile);
    setFileName(uploadedFile.name);
  } else {
    // 파일이 선택되지 않았을 때
    setFile(null);
    setFileName('첨부파일');
  }
};




  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();


      try {
        // 서버로 FormData 전송
        const response = await axios.post(`http://localhost:8000/api/question/`, formData, {
          headers: {
            'Authorization': `Token ${accessToken}`,
            'Content-Type': 'multipart/form-data',
          },
        });
      console.log(response.data)
      window.location.reload();
        // 성공 시 처리
      } catch (error) {
        // 에러 처리
        console.error('서버 요청 중 에러 발생:', error);
      }

      // 모달 닫기
      onClose();

  };

  // 컴포넌트가 마운트될 때 로컬 스토리지에서 액세스 토큰과 사용자 ID 가져오기
  useEffect(() => {
    const storedAccessToken = localStorage.getItem('accessToken');
    const storedUserId = localStorage.getItem('id');

    if (storedAccessToken && storedUserId) {
      setAccessToken(storedAccessToken);
      setUserId(storedUserId);
    }
  }, []);

  return (
    <form className='modalWrapper' onSubmit={handleSubmit}>
      <div className='modalContent'>
        <div className='modalTop'>
          <div className='modalTitle'>1:1문의</div>
          <div className='modalClose' onClick={onClose}>X</div>
        </div>

        <div className='modalMain'>
          {/* 제목 입력란 */}
          <div className='modalMainTitle'>제목</div>
          <input
            name='title'
            className='inputTitle'
            type="text"
            placeholder="제목을 입력하세요"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />

          {/* 내용 입력란 */}
          <div className='modalMainContent'>내용</div>
          <textarea
            name='body'
            className='inputContent'
            placeholder="내용을 입력하세요"
            value={body}
            onChange={(e) => setBody(e.target.value)}
          ></textarea>
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