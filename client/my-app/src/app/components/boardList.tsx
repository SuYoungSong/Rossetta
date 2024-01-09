import React, {useState, useEffect} from 'react';
import axios from "axios";
import '@/app/styles/condition.css';

interface BoardListItemProps {
  boardNum: number;
  username: string;
  title: string;
  state: boolean;
  created: string;
  boardid:number;
  isChecked:boolean;
  handleCheckboxClick: (boardid: number) => void;
}

const BoardList: React.FC<BoardListItemProps> = ({ boardNum, username, title, state, created ,boardid, isChecked, handleCheckboxClick}) => {
  // 작성일자를 Date 객체로 파싱
  const createdAt = new Date(created);

  // 작성일자를 원하는 형식으로 표시 (연도부터 분까지)
  const formattedCreatedAt = `${createdAt.getFullYear()}-${(createdAt.getMonth() + 1).toString().padStart(2, '0')}-${createdAt.getDate().toString().padStart(2, '0')} ${createdAt.getHours().toString().padStart(2, '0')}:${createdAt.getMinutes().toString().padStart(2, '0')}`;

// 모달내용 수정을위한 폼변환
  // const [isEditing, setIsEditing] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newBody, setNewBody] = useState('');
  const [modalStatus, setModalStatus] = useState('none');
  const [newFile, setNewFile] = useState<File[]>([]);
  const [accessToken, setAccessToken] = useState('');
  const [userId, setUserId] = useState('');
  const [newFileName, setNewFileName] = useState<string>('첨부파일');

  const [baseFileUpload, setBaseFileUpload] = useState<File[]>([]);

  const formData = new FormData();
// 모달 state 선언
  // const [modalOpen, setModalOpen] = useState(false);
  const [modalContent, setModalContent] = useState('');
  // const [selectedItems, setSelectedItems] = useState<number[]>([]); //체크박스 선택유무
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false); // 체크확인 모달
  const storedUsername = localStorage.getItem('username');

  const handleItemClick = async () => {
    const accessToken = localStorage.getItem('accessToken');
    const user_id = localStorage.getItem('id');

    try {
      const response = await axios.get(
        `http://localhost:8000/api/question/${boardid}/`,
        {
          params: { id: user_id },
          headers: { 'Authorization': `Token ${accessToken}` },
        }
      );
      // 성공적인 응답 처리

      // console.log('GET 요청이 성공적으로 전송되었습니다.', response.data);
      // console.log('Modal Content:', response.data);
      setModalContent(response.data);
      setModalStatus('open');
      // console.log(boardid);

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
    setBaseFileUpload([])

    if (modalContent.images) {
      modalContent.images.map((image, index) => {
        // 이미지 URL 수정
        const correctImageUrl = `http://localhost:8000${image}`;
        addBlobToState(correctImageUrl);
      });
    }
  };

const getImageBlob = async (imageUrl: string): Promise<Blob> => {
  const response = await fetch(imageUrl);
  return await response.blob();
};

// Blob 추출
const addBlobToState = async (imgUrl: string) => {
  const blob = await getImageBlob(imgUrl);
  const fileNameFromUrl = imgUrl.substring(imgUrl.lastIndexOf('/') + 1);
  // 현재 상태 복사 후 새 Blob 추가
  setBaseFileUpload(prevState => [...prevState, new File([blob], fileNameFromUrl, { type: blob.type })]);
};

  const [staffAnswer, setStaffAnswer] = useState('false');
  const answerModify = (event) => {
    event.preventDefault();
    setStaffAnswer('true');
  };




  // 수정>저장 버튼시 통신
  const handleSaveClick = async (event: React.FormEvent) => {
    event.preventDefault();

  const imageUrl = 'http://localhost:8000/media/question_board_images/8a9e75e2-fac1-4a8f-b100-37d47cc2a24c.png';
  const blob = await fetch(imageUrl).then(response => response.blob());

    // 파일이 선택되었다면 각각 FormData에 추가
  newFile.forEach((file) => {
    formData.append(`images`, file);
  });

  baseFileUpload.forEach((file) => {
    formData.append(`images`, file);
  });

  formData.append('title2', newTitle);
  formData.append('body', newBody);


    const accessToken = localStorage.getItem('accessToken');
    const user_id = localStorage.getItem('id');
    try {
      const response = await axios.put(
        `http://localhost:8000/api/question/${boardid}/`,
          formData
        ,
        {
          params: { id: user_id },
          headers: { 'Authorization': `Token ${accessToken}`,
                      'Content-Type': 'multipart/form-data'},
        }
      );
      // console.log('PUT 요청이 성공적으로 전송되었습니다.', response.data);
      setModalContent(response.data);
      setModalStatus('none')
      window.location.reload();
      alert("수정되었습니다.")

    } catch (error) {
      console.error('PUT 요청이 실패하였습니다.', error);
    }
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

  // 삭제
  const handleDeleteClick = async () => {
    event.preventDefault();
    if(window.confirm("삭제하시겠습니까?")){

      const accessToken = localStorage.getItem('accessToken');
      const user_id = localStorage.getItem('id');
      try {
        const response = await axios.delete(
          `http://localhost:8000/api/question/${boardid}/`,
          {
            params: { id: user_id },
            headers: { 'Authorization': `Token ${accessToken}` },
          }
        );
        // 성공적인 응답 처리
        // console.log('delete 요청이 성공적으로 전송되었습니다.', response.data);
        setModalStatus('none');
        window.location.reload();
        alert("문의가 삭제되었습니다.")

      } catch (error) {
        // 실패한 응답 처리
        console.error('delete 요청이 실패하였습니다.', error);
      }
    } else {
      // console.log("Deletion was cancelled.");
    } };

// const handleCheckboxChange = (boardid: number) => {
//   setSelectedItems(prevItems => {
//     if (prevItems.includes(boardid)) {
//       return prevItems.filter(item => item !== boardid);
//     } else {
//       return [...prevItems, boardid];
//     }
//   });
// };
//
// useEffect(() => {
//   console.log('현재 상태:',selectedItems);
// }, [selectedItems]);

  const handleDeleteSelected = () => {
    if (selectedItems.length > 0) {
      setShowDeleteConfirmation(true);
    }
  };

  const confirmDelete = async () => {
    const accessToken = localStorage.getItem('accessToken');
    const user_id = localStorage.getItem('id');

    try {
      await Promise.all(
        selectedItems.map(async (selectedItemId) => {
          await axios.delete(`http://localhost:8000/api/question/${selectedItemId}/`, {
            params: { id: user_id },
            headers: { Authorization: `Token ${accessToken}` },
          });
        })
      );

      setSelectedItems([]);
      setShowDeleteConfirmation(false);
      window.location.reload();
    } catch (error) {
      console.error('삭제 요청이 실패하였습니다.', error);
    }
  };


// staff
const isStaff = localStorage.getItem('is_staff');

// 관리자
const [staffcomment, setStaffcomment] = useState('');

const handleStaffSubmit = async () => {
  const accessToken = localStorage.getItem('accessToken');
  try {
    const response = await axios.post('http://localhost:8000/api/comment/', { "comment" : staffcomment, "board" : boardid},
    {headers:{'Authorization': `Token ${accessToken}` }}
    );

    // console.log(response.data);
    alert("답변완료.")
  } catch (error) {
    console.error(error);
  }
};

useEffect(() => {
  if (state) {
    fetchComments();
  }
}, [state]);


const [comment, setcomment] = useState('none')
const fetchComments = async () => {
  const accessToken = localStorage.getItem('accessToken');
  try {
    const response = await axios.post(
      'http://localhost:8000/api/commentinquiry/',
      {
        "board": boardid
      },
      {
        headers: { 'Authorization': `Token ${accessToken}` }
      }
    );
    const commentsData = response.data.comment;
    setcomment(commentsData);
  } catch(error) {
    console.error('댓글을 가져오는데 실패했습니다:', error);
  }
};

// 파일 수정 버튼
const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
  const fileInput = event.target;

  if (fileInput.files && fileInput.files.length > 0) {
    // 다중 파일이 선택되었을 때
    const uploadedFiles = Array.from(fileInput.files); // FileList를 배열로 변환
    setNewFile(uploadedFiles);
    setNewFileName(uploadedFiles.map(file => file.name).join(', ')); // 파일 이름들을 합쳐서 하나의 문자열로 만듭니다.
  } else {
    // 파일이 선택되지 않았을 때
    setNewFile([]);
    setNewFileName('첨부파일');
  }
};


// 이미지 삭제 버튼이 클릭되었을 때 호출되는 함수
const handleDeleteButtonClick = (imgUrl: string) => {
  // 삭제 확인 여부를 묻는 등의 추가적인 로직이 필요할 수 있습니다.
  const isConfirmed = window.confirm('이미지를 삭제하시겠습니까?');

  if (isConfirmed) {
    // 확인이 되었다면 이미지 삭제 함수 호출
    deleteBaseFile(imgUrl);
  }
};


    const deleteBaseFile = (imgUrl:string) => {
      const fileNameFromUrl = imgUrl.substring(imgUrl.lastIndexOf('/') + 1);
      const updatedFiles = baseFileUpload.filter(file => file.name !== fileNameFromUrl);
      setBaseFileUpload(updatedFiles);

      // 이미지 및 HTML 요소를 찾아서 숨김 처리
      const imageElements = document.querySelectorAll(`img[src="${imgUrl}"]`);
      imageElements.forEach((element) => {
        const boardImageEditZone = element.closest('.board-image-edit-zone');
        if (boardImageEditZone) {
          boardImageEditZone.remove();
          // boardImageEditZone.style.display = 'none';
        }
      });
    const bi = document.querySelector('.board-image-edit-zone');
    // 이미지가 모두 삭제된 경우에는 modalMainContent도 함께 삭제
    if (!bi) {
      const modalMainContent = document.querySelector('.baseImageZone');
        modalMainContent.remove();
         // modalMainContent.style.display = 'none';
    }
  };

return (
    <div className='boardList' onClick={handleItemClick}>
      {isStaff === 'true' ? (
        null
      ):(
        <input type="checkbox"
        onChange={() => handleCheckboxClick(boardid)}
        onClick={(e) => e.stopPropagation()} />
      )}
      
      <div className='boardNum'>{boardNum}</div>
      <div className='boardMain'>
        <h4 className='boardTitle'>[문의] {title}</h4>
        <p className='boardContent'>
          {formattedCreatedAt || 'N/A'}&ensp;&ensp;{isStaff === 'true' ? username : storedUsername}
        </p>
      </div>
      <div className='waitBtn' style={{
        backgroundColor: state ? 'gray' : '#2C858D',
        color: state ? 'black' : 'white'
      }}>{state ? '답변완료' : '답변대기'}</div>

      {/* 모달부분 */}
      {isStaff === 'true' ? (
          // 관리자가 볼 수 있는 내용
          (modalStatus !== 'none' && (
              <form className='modalWrapper' onClick={e => e.stopPropagation()}>
                <div className='staff-modalContent'>
                  <div className='modalTop'>
                    <div className='modalTitle'>게시글 관리</div>
                    <div className='modalClose' onClick={closeModal}>X</div>
                  </div>
                  <div className='staff-management'>
                    <div className='staff-modalMain'>
                      <div className='modalinfo'>
                        <div className='modalusername'>작성자: {username}</div>
                        <div className='modaluserdate'>작성일자: {formattedCreatedAt}</div>
                      </div>
                      <div>
                        <div className='modalinnertitle'>제목</div>
                        <div className='modalusertitle'>{modalContent.title}</div>
                      </div>
                      <div className='modalinnertitle'>내용</div>                    
                      <div className='modalusercontent'>{modalContent.body}</div>                        
                      {modalContent?.images && modalContent.images.length > 0 ? (
                        <>
                          <div className='modalMainContent'>첨부 이미지</div>
                          <div className='queryImageContent'>
                            {modalContent.images.map((image, index) => {
                              // 이미지 URL 수정
                              const correctImageUrl = `http://localhost:8000${image}`;
                              return <img key={index} src={correctImageUrl} alt={`Image ${index}`}/>;
                            })}
                          </div>
                        </>
                      ) : (
                        <>
                          <span></span>
                        </>
                      )}
                    </div>

                    <div className='staffMain'>
                      <div className='modalMainTitle'>답변</div>

                      {state ? (

                          <div className='titleInputContent'>{comment}</div>
                      ) : (
                          <textarea
                              className='staff-answerBox'
                              value={staffcomment}
                              onChange={e => setStaffcomment(e.target.value)}/>
                      )}
                    </div>
                  </div>
                  {!state && (
                      <div className='btn-box'>
                        <button className='modal-btn' onClick={handleStaffSubmit}>답변하기</button>
                      </div>
                  )}
                </div>
              </form>
          ))
      ) : (

          (modalStatus !== 'none' && (
              <form className='modalWrapper' onClick={e => e.stopPropagation()}>
                <div className='modalContent'>
                  <div className='modalTop'>
                    <div className='modalTitle'>1:1문의</div>
                    <div className='modalClose' onClick={closeModal}>X</div>
                  </div>

                  <div className='modalMain'>
                    <div className='modalinfo'>
                      <div className='modalusername'>작성자: {username}</div>
                      <div className='modaluserdate'>작성일자: {formattedCreatedAt}</div>
                    </div>
                    <div>
                      <div className='modalinnertitle'>제목</div>
                      <div>
                        {modalStatus === 'edit' ? (
                            <input
                                type="text"
                                value={newTitle} // newTitle을 출력
                                onChange={e => setNewTitle(e.target.value)}
                                maxLength="25"
                            />
                        ) : (
                            <div className='titleInputContent'>{modalContent.title}</div>
                        )}
                      </div>
                    </div>
                    <div className='modalinnertitle'>내용</div>
                    <div>
                      {modalStatus === 'edit' ? (
                          <textarea
                              className='userEditContent'
                              value={newBody} // newBody를 출력
                              onChange={e => setNewBody(e.target.value)} // newBody를 변경
                          />
                      ) : (
                          <div className='queryContent'>{modalContent.body}</div>
                      )}
                    </div>
                    
                      {modalStatus === 'edit' && (
                        <div>
                          
                          <div className='attachBtn'>
                            <input id="file" type="file" onChange={handleFileChange} multiple/>
                            <label htmlFor="file">첨부하기</label>
                            <input className="fileName" value={newFileName} placeholder="첨부파일 추가하기" readOnly/>
                          </div>
                          <div className='queryImageContent'>
                            {modalContent?.images ?  (
                              <div>
                                {modalContent.images.map((image, index) => {
                                  // 이미지 URL 수정
                                  const correctImageUrl = `http://localhost:8000${image}`;
                                  return (
                                    <div className="board-image-edit-zone" key={index}>
                                      <img src={correctImageUrl} alt={`Image ${index}`}/>
                                      <div className='delete-x-button' onClick={() => handleDeleteButtonClick(correctImageUrl)}>X</div>
                                    </div>
                                  );
                                })}
                              </div>
                            ) : (
                              <span></span>
                            )}
                          </div>
                        </div>
                      )}

                      {modalStatus !== 'edit' && modalContent?.images && modalContent.images.length > 0 && (
                        
                    <div className='queryImageContent'>
                      {modalContent.images.map((image, index) => {
                        // 이미지 URL 수정
                        const correctImageUrl = `http://localhost:8000${image}`;
                        return <img key={index} src={correctImageUrl} alt={`Image ${index}`} />;
                      })}
                    </div>
                  )}

                    {state ? (
                        <div>
                          <div className='modalinnertitle'>답변</div>
                          <div className='queryContent'>{comment}</div>
                        </div>
                    ) : null}
                  </div>

                  <div className='btn-box'>
                    {!state && (
                        modalStatus === 'edit' ? (
                            <button className='modal-btn' onClick={handleSaveClick}>저장</button>
                        ) : (
                            <button className='modal-btn' onClick={handleModify}>수정</button>
                        )
                    )}
                    <button className='modal-btn' onClick={handleDeleteClick}>삭제</button>
                  </div>
                </div>
              </form>
          ))
      )}
    </div>
);
}

export default BoardList;