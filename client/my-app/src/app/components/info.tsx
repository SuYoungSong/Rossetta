import React from 'react';
import { useRouter } from 'next/router'; // useRouter만 import
import Link from 'next/link';
import Image from 'next/image';
import '@/app/styles/mypage.css'

interface MypageProps{
    email: string;
    id: string;
    name: string;
}

const InfoPage = ({email, id, name}: MypageProps) => {
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
                                            <path d="m14.06 9.02.92.92L5.92 19H5v-.92l9.06-9.06M17.66 3c-.25 0-.51.1-.7.29l-1.83 1.83 3.75 3.75 1.83-1.83c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.2-.2-.45-.29-.71-.29zm-3.6 3.19L3 17.25V21h3.75L17.81 9.94l-3.75-3.75z">
                                            </path>
                                        </svg>

                                    </button>
                                </div>
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </>
    );
};

export default InfoPage;
