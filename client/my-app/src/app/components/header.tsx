"use client"

import { Inter } from 'next/font/google';
import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import '@/app/styles/globals.css'
import RoLogo from '../../../public/Rossetta_logo.png';
import Login from "../../../public/login.png";
import axios from 'axios';
import { Dropdown } from 'flowbite-react';
import { HiCog, HiLogout} from 'react-icons/hi';
import { useRouter } from 'next/navigation';
import { usePathname, useSearchParams } from 'next/navigation'

interface HeaderProps{
    username: string;
    status: boolean;
    token: string;
}

const Header = ({username, status, token}: HeaderProps) => {
    const router = useRouter();
    const [activeNavBtn, setActiveNavBtn] = useState<string | null>(null);

    const logout = () => {
    let accessToken = localStorage.getItem('accessToken');
    axios.post("http://localhost:8000/api/logout/", null,{ headers: {'Authorization':`Token ${accessToken}`}})
      .then((res) => {
          console.log("res >>",res);
          localStorage.removeItem('accessToken');
          localStorage.removeItem('username');
          localStorage.removeItem('id');
          localStorage.removeItem("real_script")
          localStorage.removeItem('is_staff');
          router.push('/');
          window.location.replace('/');
      })
      .catch((err) => {
        console.log("err >> ", err);
      });
    };

    const goHome = () =>{
        window.location.replace("/");
    }
    const Chatreload = () => {
        window.location.replace("/chatbot");
    }

    // 로그인 유효 시간을 갱신하는 POST
    const loginTimeUpdate = () => {
    let accessToken = localStorage.getItem('accessToken');

    if (accessToken){
        axios.post("http://localhost:8000/api/renewaltokentime/", null,{
        headers: {
            'Authorization':`Token ${accessToken}`
        }})

      .then((res) => {
          // 요청에 성공한 경우
          // 처리할 내용 없음
      })
      .catch((err) => {
          // 요청에 실패한 경우
        console.log("err >> ", err);
      });
    }

};

    // 자동 로그아웃 API 를 체크하는 함수
    const autoLogoutTimeCheck = () => {
        let accessToken = localStorage.getItem('accessToken');
        axios.post("http://localhost:8000/api/autologout/", null, {headers: {'Authorization': `Token ${accessToken}`}})
            .then((res) => {
                // 정상적으로 200 응답이 온 경우 로그인 시간이 유효하기 때문에
                // 아무 작업을 하지 않습니다.
                // 아무것도 없다고 놀라지 마세요 이게 맞아요.
            })
            .catch((err) => {
                // 404 에러코드가 응답으로 오는 경우
                // 로그인 유효시간이 만료로 logout 처리합니다.
                logout();
            });
    }


  const pathname = usePathname()
  const searchParams = useSearchParams()
  useEffect(() => {
      // login 상태일 경우 페이지를 이동하면 로그인 유효시간을 갱신한다.
      if (localStorage.getItem('accessToken')) {
          loginTimeUpdate();
      }
  }, [pathname, searchParams])


    useEffect(() => {
        // 1분마다 실행되는 setInterval 설정
        const autoLogoutIntervalId = setInterval(() => {
            // 로그인 시간이 유효한지 체크하는 POST request
            // 로그인 한 경우에만 체크하게 accessToken 값이 있는지 없는지 체크 후 작동한다.
            if (localStorage.getItem('accessToken')) {
                autoLogoutTimeCheck();
            }
        }, 1 * 60 * 1000); // 1분(60,000 밀리초)

        // 컴포넌트가 언마운트되면 clearInterval을 사용하여 interval을 중지합니다.
        return () => clearInterval(autoLogoutIntervalId);
    }, []);

    return (
        <>
            <div className="nav_basic">
                <Link  href="/" onClick={() => setActiveNavBtn(null)}><Image className="logo" src={RoLogo} alt='logo'/></Link>
                <Link className={`nav_btn ${activeNavBtn === 'sign-edu' ? 'active' : ''}`} href='/sign-edu' onClick={() => setActiveNavBtn('sign-edu')}>수어교육</Link>
                <Link className={`nav_btn ${activeNavBtn === 'chatbot' ? 'active' : ''}`} href='/chatbot' onClick={() => setActiveNavBtn('chatbot')}>수어실습</Link>
                <Link className={`nav_btn ${activeNavBtn === 'wrong_note' ? 'active' : ''}`} href='/wrong_note' onClick={() => setActiveNavBtn('wrong_note')}>오답노트</Link>
                <Link className={`nav_btn ${activeNavBtn === 'board' ? 'active' : ''}`} href='/board' onClick={() => setActiveNavBtn('board')}>1:1 문의</Link>
            </div>



              {status ? (
                <>
                  <div className="right-nav">
                      {/*<div onClick={logout} className='login-part'>*/}
                      {/*  <Image src={Logout} alt='logout_png'></Image>*/}
                      {/*  <div className='login'>로그아웃</div>*/}
                      {/*</div>*/}
                      <div className='user_name'>
                        <Dropdown label={`${username}님`} inline className="dropdown-container">
                          <Link href='/mypage' ><Dropdown.Item icon={HiCog} onClick={() => setActiveNavBtn(null)}>내 정보</Dropdown.Item></Link>
                          <Dropdown.Divider className="divider-drop"/>
                          <Dropdown.Item icon={HiLogout} onClick={() => {logout(); setActiveNavBtn(null);}}>로그아웃</Dropdown.Item>
                        </Dropdown>
                      </div>
                  </div>
                </>
              ): (
                <>
                  <Link href="/auth">
                    <div className='login-part'>
                      <Image src={Login} alt='login_png'></Image>
                      <div className='login'>로그인</div>
                    </div>
                  </Link>
                </>
            )}
        </>
    );
};
export default Header;