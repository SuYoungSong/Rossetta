"use client"
import React, { useState, useEffect } from 'react';
import Modal from '@/app/components/modal';
import '@/app/styles/condition.css';
import BoardList from "@/app/components/boardList";
import axios from "axios";


const Board: React.FC = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [boardData, setBoardData] = useState([]);
  const [username, setUsername] = useState(""); // 추가된 부분

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

  

  return (
    <>
      <div className='boardName'>1:1 문의</div>

      <div className='btnRight'>
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
                      {...boardItem} />
          ))}
        </div>
      </div>
      {isModalOpen && <Modal onClose={handleCloseModal} />}
    </>
  );
};

export default Board;