import React from 'react';
import '@/app/styles/sign_edu.css';

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