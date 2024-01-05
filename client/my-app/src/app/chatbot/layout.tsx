"use client"
import React, {useEffect} from 'react';
import '@/app/styles/sign_edu.css';
import {useRouter} from "next/navigation";

export default function ChatLayout({
    children,
}: {
    children: React.ReactNode
}) {
    const router = useRouter();
    useEffect(() => {
            const isLogin = localStorage.getItem('accessToken');
            if (!isLogin) {
                alert("로그인이 필요합니다.");
                router.push("/auth")
                window.location.replace('/auth');
            }
            else{
                return;
            }
        }, []);
    return(
        <>
            <div className="page_margin"></div>
            {children}
        </>
    )
};