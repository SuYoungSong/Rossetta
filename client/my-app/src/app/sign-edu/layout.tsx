"use client"
import React from 'react';
import '@/app/styles/sign_edu.css';
import withAuth from "@/app/HOC/withAuth";

export default function EduLayout({
    children,
}: {
    children: React.ReactNode
}){
    return(
        <>
            <div className="page_margin"></div>
            {children}
        </>
    )
}