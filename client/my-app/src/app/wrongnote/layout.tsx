"use client"
import React, { Children, useEffect, useState } from 'react';
import '@/app/styles/sign_edu.css';
import {useRouter} from "next/navigation";

export default function WrongLayout({
    children,
}: {
    children: React.ReactNode
}) {
    const router = useRouter();
    return (
        <>
            <div className="page_margin"></div>
            {children}
        </>
    )
}