"use client"
import React, { useState, useEffect } from 'react';
import Modal from '@/app/components/modal';
import '@/app/styles/condition.css';
import BoardList from "@/app/components/boardList";
import axios from "axios";


const Board: React.FC = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [boardData, setBoardData] = useState([]);
  // const [boardid, setBoardid] = useState("");
  const [username, setUsername] = useState(""); // 추가된 부분

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  useEffect(() => {
    const accessToken = localStorage.getItem('accessToken');
        const user_id = localStorage.getItem('id');
        const storedUsername = localStorage.getItem('username'); // 로컬 스토리지에서 username 읽기

          if (storedUsername) {
      setUsername(storedUsername);
    }
        const fetchData = async () => {
        try{
            const response = await axios.get(`http://localhost:8000/api/questionlist/${user_id}`, {
                headers: { 'Authorization': `Token ${accessToken}` },
                params: { id: user_id}
            });
            console.log(response.data)
            // setBoardid(response.data.id);
          setBoardData(response.data);

      } catch (error) {
        console.error('Error fetching board data:', error);
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

      <div className='board'>
        <div className='titleCount'>총 {boardData.length}건 </div>
        <div className='bulletinBoard'>
          {boardData.map((boardItem, index) => (
            <BoardList key={index}
                       boardNum={index+1}
                       boardid={boardItem.id}
                       username={username}
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