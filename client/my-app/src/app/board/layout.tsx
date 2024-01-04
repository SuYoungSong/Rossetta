"use client"
import React from 'react';
import '@/app/styles/sign_edu.css';
import withAuth from "@/app/HOC/withAuth"

const BoardLayout = ({
    children,
}: {
    children: React.ReactNode
}) => {
    return(
        <>
            <div className="page_margin"></div>
            {children}
        </>
    )
};
export default withAuth(BoardLayout);