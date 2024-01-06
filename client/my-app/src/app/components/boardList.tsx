import React, {useState} from 'react';
import axios from "axios";

interface BoardListItemProps {
  boardNum: number;
  username: string;
  title: string;
  state: boolean;
  created: string;
  id:number;
}

const BoardList: React.FC<BoardListItemProps> = ({ boardNum, username, title, state, created ,id}) => {
  // 작성일자를 Date 객체로 파싱
  const createdAt = new Date(created);

  // 작성일자를 원하는 형식으로 표시 (연도부터 분까지)
  const formattedCreatedAt = `${createdAt.getFullYear()}-${(createdAt.getMonth() + 1).toString().padStart(2, '0')}-${createdAt.getDate().toString().padStart(2, '0')} ${createdAt.getHours().toString().padStart(2, '0')}:${createdAt.getMinutes().toString().padStart(2, '0')}`;

// 모달내용 수정을위한 폼변환
  // const [isEditing, setIsEditing] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newBody, setNewBody] = useState('');
  const [modalStatus, setModalStatus] = useState('none');

// 모달 state 선언
  // const [modalOpen, setModalOpen] = useState(false);
  const [modalContent, setModalContent] = useState('');

  const handleItemClick = async () => {
    const accessToken = localStorage.getItem('accessToken');
    const user_id = localStorage.getItem('id');
    // const storedUsername = localStorage.getItem('username');
    try {
      const response = await axios.get(
        `http://localhost:8000/api/question/${id}/`,
        {
          params: { id: user_id },
          headers: { 'Authorization': `Token ${accessToken}` },
        }
      );
      // 성공적인 응답 처리
      console.log('GET 요청이 성공적으로 전송되었습니다.', response.data);
      console.log('Modal Content:', response.data);
      setModalContent(response.data);
      setModalStatus('open');

    } catch (error) {
      // 실패한 응답 처리
      console.error('GET 요청이 실패하였습니다.', error);
    }
};


  const closeModal = (event) => {
    event.preventDefault();
    setModalStatus('none');
  };

  const handleModify = (event) => {
    event.preventDefault();
    setNewTitle(modalContent.title); // 기존의 제목 설정
    setNewBody(modalContent.body); // 기존의 내용 설정
    setModalStatus('edit');
  };


  // 수정>저장 버튼시 통신
  const handleSaveClick = async () => {
    const accessToken = localStorage.getItem('accessToken');
    const user_id = localStorage.getItem('id');
    try {
      const response = await axios.put(
        `http://localhost:8000/api/question/${id}/`,
        {
          "title2": newTitle,
          "body": newBody
        }
        ,
        {
          params: { id: user_id },
          headers: { 'Authorization': `Token ${accessToken}` },
        }
      );
      console.log('PUT 요청이 성공적으로 전송되었습니다.', response.data);
      setModalContent(response.data);
      setModalStatus('open');
    } catch (error) {
      console.error('PUT 요청이 실패하였습니다.', error);
    }
  };

  // 삭제
  const handleDeleteClick = async () => {
    const accessToken = localStorage.getItem('accessToken');
    const user_id = localStorage.getItem('id');
    try {
      const response = await axios.delete(
        `http://localhost:8000/api/question/${id}/`,
        {
          params: { id: user_id },
          headers: { 'Authorization': `Token ${accessToken}` },
        }
      );
      // 성공적인 응답 처리
      console.log('delete 요청이 성공적으로 전송되었습니다.', response.data);
      setModalStatus('none');
      window.location.reload();

    } catch (error) {
      // 실패한 응답 처리
      console.error('delete 요청이 실패하였습니다.', error);
    }
};


  return (
    <div className='boardList' onClick={handleItemClick}>
      <div className='boardNum'>{boardNum}</div>
      <div className='boardMain'>
        <h4 className='boardTitle'>[문의] {title}</h4>
        <p className='boardContent'>{formattedCreatedAt || 'N/A'}
            {''}
            &ensp;&ensp;{username}</p>
      </div>
      <div className='waitBtn'>{state ? '답변완료' : '답변대기'}</div>

{/* 모달부분 */}
      {/* 모달부분 */}
    {modalStatus !== 'none' && (
      <form className='modalWrapper' onClick={e => e.stopPropagation()}>
        <div className='modalContent'>
          <div className='modalTop'>
            <div className='modalTitle'>1:1문의</div>
            <div className='modalClose' onClick={closeModal}>X</div>
          </div>

          <div className='modalMain'>
            <div className='modalMainTitle'>제목</div>
            <div>
              {modalStatus === 'edit' ? (
                  <input
                      type="text"
                      value={newTitle} // newTitle을 출력
                      onChange={e => setNewTitle(e.target.value)}
                  />
              ) : (
                  <div className='titleInputContent'>{modalContent.title}</div>
              )}
            </div>
            <div className='modalMainContent'>내용</div>
            <div>
              {modalStatus === 'edit' ? (
                  <textarea
                      value={newBody} // newBody를 출력
                      onChange={e => setNewBody(e.target.value)} // newBody를 변경
                  />
              ) : (
                  <div className='queryContent'>{modalContent.body}</div>
              )}
            </div>
            <div className='modalMainContent'>작성일자</div>
            <div className='queryDate'>{formattedCreatedAt}</div>
            <div className='modalMainContent'>첨부 이미지</div>
            <div className='queryImageContent'>
              {modalContent?.images ? (
                  modalContent.images.map((image, index) => {
                    // 이미지 URL 수정
                    const correctImageUrl = `http://localhost:8000${image}`;
                    return <img key={index} src={correctImageUrl} alt={`Image ${index}`}/>
                  })
              ) : (
                  <span>No images</span>
              )}
            </div>

          </div>

          <div className='btn-box'>
            {modalStatus === 'edit' ? (
                <button className='modal-btn' onClick={handleSaveClick}>저장</button>
            ) : (
                <button className='modal-btn' onClick={handleModify}>수정</button>
            )}
            <button className='modal-btn' onClick={handleDeleteClick}>삭제</button>
          </div>
        </div>
      </form>
    )}
    </div>
  );
};

export default BoardList;