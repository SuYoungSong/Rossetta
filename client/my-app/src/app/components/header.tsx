"use client"

import { Inter } from 'next/font/google';
import Link from 'next/link';
import Image from 'next/image';
import '@/app/styles/globals.css'
import RoLogo from '../../../public/Rossetta_logo.png';
import Login from "../../../public/login.png";
import {useSelector, useDispatch} from "react-redux";
import { clearUser } from "@/app/components/reducer/userSlice.js";

const logout = () => {
    let accessToken = localStorage.getItem('accessToken');
    localStorage.removeItem('accessToken')
    window.location.reload();
};

const Header = () => {
    const dispatch = useDispatch();
    const user = useSelector((state) => state.data);
    const Logout = () => {
        dispatch(clearUser(user));
    }
    return (
        <>
            <div className="nav_basic">
                <Link href="/"><Image className="logo" src={RoLogo} alt='logo'/></Link>
                <Link className='nav_btn' href='/sign-edu'>수어교육</Link>
                <Link className='nav_btn' href='/'>수어실습</Link>
                <Link className='nav_btn' href='/wrongnote'>오답노트</Link>
                <Link className='nav_btn' href='/'>1:1 문의</Link>
            </div>

              {user ? (
                <>
                  <div>
                    <div onClick={() => Logout()} className='login-part'>
                      <Image src={Login} alt='login_png'></Image>
                      <div className='login'>로그아웃</div>
                    </div>
                    <div>
                      <div>{`${user.name}`}님</div>
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