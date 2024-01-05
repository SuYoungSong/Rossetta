"use client"
import React, {useEffect} from 'react';
import '@/app/styles/sign_edu.css';
import {useRouter} from "next/navigation";

export default function BoardLayout({
    children,
}: {
    children: React.ReactNode
}) {
    const router = useRouter();
    const isLogin = localStorage.getItem('accessToken');
    return(
        <>
            <div className="page_margin"></div>
            {children}
        </>
    )
};