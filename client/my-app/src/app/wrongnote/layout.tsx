"use client"
import React, { Children, useEffect, useState } from 'react';
import '@/app/styles/sign_edu.css';
import withAuth from "@/app/HOC/withAuth";

const WrongLayout = ({
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
}

export default withAuth(WrongLayout);