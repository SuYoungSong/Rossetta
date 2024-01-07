"use client"
import React, { useState, useEffect } from 'react';
import Modal from '@/app/components/modal';
import '@/app/styles/condition.css';
import BoardList from "@/app/components/boardList";
import axios from "axios";

interface BoardItemProps {
  boardid:number;
}



const Board: React.FC<BoardItemProps> = ({boardid}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [boardData, setBoardData] = useState([]);
  const [username, setUsername] = useState(""); // 추가된 부분


   const [selectedItems, setSelectedItems] = useState([]);
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  useEffect(() => {
    const accessToken = localStorage.getItem('accessToken');
    const user_id = localStorage.getItem('id');
    const storedUsername = localStorage.getItem('username'); // 로컬 스토리지에서 username 읽기
    const is_staff = localStorage.getItem('is_staff'); // 로컬 스토리지에서 is_staff 읽기

    const fetchData = async () => {
      try {
        if (is_staff === 'true') {
          // is_staff가 true인 경우 다른 API 호출
          const response = await axios.get(`http://localhost:8000/api/question/staff/`, {
            headers: { 'Authorization': `Token ${accessToken}` },
            params: { id: user_id }
          });
          console.log(response.data);
          setBoardData(response.data);
          // 다른 API에서 받아온 데이터 처리
        } else {
          // is_staff가 false인 경우 현재 코드에서 데이터 호출
          const response = await axios.get(`http://localhost:8000/api/questionlist/${user_id}`, {
            headers: { 'Authorization': `Token ${accessToken}` },
            params: { id: user_id }
          });
          console.log(response.data);
          // setBoardid(response.data.id);
          setBoardData(response.data);
        }
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };
  
    fetchData();
  }, []);

  //삭제
  const handleDeleteClick = async (boardid: number) => {
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
        console.log('delete 요청이 성공적으로 전송되었습니다.', response.data);
        window.location.reload();
        alert("문의가 삭제되었습니다.")

      } catch (error) {
        // 실패한 응답 처리
        console.error('delete 요청이 실패하였습니다.', error);
      }
    } else {
      console.log("Deletion was cancelled.");
    } };


  const handleCheckboxChange = (event: React.ChangeEvent<HTMLInputElement>, boardid: number) => {
  if (event.target.checked) {
    setSelectedItems((prevSelectedItems) => [...prevSelectedItems, boardid]);
  } else {
    setSelectedItems((prevSelectedItems) => prevSelectedItems.filter((id) => id !== boardid));
  }
};

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


  

  return (
    <>
      <div className='boardName'>1:1 문의</div>

      <div className='btnRight'>
        <button onClick={() => handleDeleteClick(boardid)}>
          삭제
        </button>
        <button onClick={() => setIsModalOpen(true)} className='boardBtn'>
          + 등록
        </button>

      </div>

      /

      <div className='board'>
        <div className='titleCount'>총 {boardData.length}건 </div>
        <div className='bulletinBoard'>
          
          {/* 최신등록글이 상단에 오도록 수정 */}
          {[...boardData].reverse().map((boardItem, index) => (
            <BoardList key={index}
                      boardNum={boardData.length - index}
                      boardid={boardItem.id}
                      username={boardItem.user}
                      boardData={boardData}
                       selectedItems={selectedItems}
                      handleCheckboxChange={handleCheckboxChange}
                      {...boardItem} />
          ))}
        </div>
      </div>
      {isModalOpen && <Modal onClose={handleCloseModal} />}
    </>
  );
};

export default Board;