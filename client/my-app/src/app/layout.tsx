"use client"
"use strict"
import { Inter } from 'next/font/google';
import Link from 'next/link';
import Image from 'next/image';
import '@/app/styles/globals.css'
import Header from '@/app/components/header';
import {useEffect, useState} from 'react';
import {Provider, useSelector} from 'react-redux'
import store from "@/app/components/reducer/store"
import Footer from './components/footer';

const inter = Inter({ subsets: ['latin'] })
// const {user, logout} = useAuth();

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [status, setStatus] = useState(false);
  const [loginName, setLoginName] = useState('');
  const [token, setToken] = useState('');

  useEffect(() => {
    if (localStorage.getItem('accessToken') == null) {
      setStatus(false);
    }
    else {
      setStatus(true);
      setLoginName(localStorage.getItem('username') || 'Undefined');
      setToken(localStorage.getItem('accessToken') || 'Undefined');
    }
  }, []);
  return (
    <html lang="ko">
    <Provider store={store}>
      <head>
        <link rel="stylesheet" as="style" href="https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/variable/pretendardvariable.min.css" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0"/>  
      </head>
      <body>
        <div className='nav_back'>
          <div className='nav_content'>
            <Header status={status} username={loginName} token={token}/>
          </div>
        </div>
        {children} {/*아래 다른 페이지 폴더에서 layout.js 찾기*/}
      <Footer />
      </body>
      </Provider>
    </html>
  )
}
