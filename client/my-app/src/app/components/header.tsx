"use client"

import { Inter } from 'next/font/google';
import Link from 'next/link';
import Image from 'next/image';
import '@/app/styles/globals.css'
import RoLogo from '../../../public/Rossetta_logo.png';
import Login from "../../../public/login.png";
import axios from 'axios';
import { Dropdown } from 'flowbite-react';
import { HiCog, HiLogout} from 'react-icons/hi';
import { useRouter } from 'next/navigation';

interface HeaderProps{
    username: string;
    status: boolean;
    token: string;
}

const Header = ({username, status, token}: HeaderProps) => {
    const router = useRouter();

    const logout = () => {
    let accessToken = localStorage.getItem('accessToken');
    axios.post("http://localhost:8000/api/logout/", null,{ headers: {'Authorization':"Token " + accessToken}})
      .then((res) => {
          console.log("res >>",res);
          localStorage.removeItem('accessToken');
          localStorage.removeItem('username');
          router.push('/');
          window.location.replace('/');
      })
      .catch((err) => {
        console.log("err >> ", err);
      });
};



    return (
        <>
            <div className="nav_basic">
                <Link href="/"><Image className="logo" src={RoLogo} alt='logo'/></Link>
                <Link className='nav_btn' href='/sign-edu'>수어교육</Link>
                <Link className='nav_btn' href='/'>수어실습</Link>
                <Link className='nav_btn' href='/wrongnote'>오답노트</Link>
                <Link className='nav_btn' href='/board'>1:1 문의</Link>
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
                              <Link href='/mypage'><Dropdown.Item icon={HiCog}>내 정보</Dropdown.Item></Link>
                              <Dropdown.Divider className="divider-drop"/>
                              <Dropdown.Item icon={HiLogout} onClick={logout}>로그아웃</Dropdown.Item>
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