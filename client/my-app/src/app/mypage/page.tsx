"use client"
import {useEffect, useState} from 'react';
import Info from '@/app/components/info';
import axios from 'axios';



const Mypage = () => {
    const [username, setUsername] = useState("");
    const [useremail, setUseremail] = useState("");
    const [userid, setUserid] = useState("");

    useEffect(() => {
    const searchInfo = async () => {
        const accessToken = localStorage.getItem('accessToken');
        const user_id = localStorage.getItem('id');
        try{
            const response = await axios.get('http://localhost:8000/api/user', {
                headers: { 'Authorization': `Token ${accessToken}` },
                params: { id: user_id }
            });
            setUsername(response.data.name);
            setUseremail(response.data.email);
            setUserid(response.data.id);
            // 여기서 데이터를 상태로 관리하거나 다른 로직을 수행할 수 있습니다.
      } catch (error) {
        console.log("err >> ", error);
      }
    };

    searchInfo();
  }, []); // 빈 배열은 컴포넌트가 마운트될 때 한 번만 실행됨

  return (
    <>
      <Info id={userid} email={useremail} name={username}/>
    </>
  );
};

export default Mypage;
