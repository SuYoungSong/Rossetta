"use client"
import React, {useState} from 'react';
import { useRouter } from 'next/router'; // useRouter만 import
import Link from 'next/link';
import Image from 'next/image';
import '@/app/styles/mypage.css'
import Input from '@/app/components/input';
import ConfirmationModalProps from "@/app/mypage/accountDeleteModal";
import axios from "axios";

interface MypageProps {
    email: string;
    id: string;
    name: string;
}

const InfoPage = ({ email, id, name }: MypageProps) => {

    const [isModalOpen, setIsModalOpen] = useState(false);

    // 회원탈퇴 버튼을 누르면 modal 창이 뜨는 로직
    const handleOpenModal = () => {
    setIsModalOpen(true);
  };

    // 정말로 탈퇴하시겠습니까 모달창에서 유지하기 누르면 modal창이 닫히게 한다.
  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  // 정말로 탈퇴하시겠습니까 에서 회원탈퇴를 누르는 경우 탈퇴처리한다.
  const handleConfirm = () => {
    // 여기에 회원탈퇴 로직을 추가할 수 있습니다.
    accountDeletion();
    // 모달을 닫습니다.
    setIsModalOpen(false);
  };


  const accountDeletion = () => {
      const accessToken = localStorage.getItem('accessToken');

      axios.delete(
        "http://localhost:8000/api/user/asdf",
      {
                headers: { 'Authorization':`Token ${accessToken}`}
        })
      .then((res) => {
        localStorage.removeItem('accessToken');
        localStorage.removeItem('username');
        localStorage.removeItem('id');
        window.location.replace('/');
      })
      .catch((err) => {
          // 요청에 실패한 경우
        console.log("err >> ", err);
      });
    };



    return (
        <>
            <div className='top_title'>내 정보</div>
            <div className='top_hr'></div>

            <div className="info-back">
                <h2 className="h2-info">기본 정보</h2>
                <table>
                    <tbody>
                    <tr>
                        <td className="table-title">이름</td>
                        <td className="td-option">
                            <div className="td-value"><p>{name}</p></div>
                        </td>
                    </tr>
                    <tr>
                        <td className="table-title">아이디</td>
                        <td className="td-option">
                            <div className="td-value"><p>{id}</p></div>
                        </td>
                    </tr>
                    <tr>
                        <td className="table-title">이메일</td>
                        <td className="td-option">
                            <div className="td-value">
                                <p>{email}</p>
                            </div>
                        </td>
                    </tr>
                    <tr>
                        <td className="table-title">비밀번호</td>
                        <td className="td-option">
                            <div className='flex-box'>
                                <div className="td-value"><p>********</p></div>
                                <button type="button" className="td-value btn-edit">비밀번호 수정
                                    <svg className="svgIcon"
                                         focusable="false" aria-hidden="true" viewBox="0 0 24 24"
                                         data-testid="EditOutlinedIcon">
                                        <path
                                            d="m14.06 9.02.92.92L5.92 19H5v-.92l9.06-9.06M17.66 3c-.25 0-.51.1-.7.29l-1.83 1.83 3.75 3.75 1.83-1.83c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.2-.20-.45-.29-.71-.29zm-3.6 3.19L3 17.25V21h3.75L17.81 9.94l-3.75-3.75z">
                                        </path>
                                    </svg>
                                </button>
                                <button onClick={handleOpenModal}>회원탈퇴</button>

                            </div>
                        </td>
                    </tr>
                    </tbody>
                </table>
                <ConfirmationModalProps isOpen={isModalOpen} onClose={handleCloseModal}  onConfirm={handleConfirm}/>
            </div>
        </>

    );
};

export default InfoPage;
