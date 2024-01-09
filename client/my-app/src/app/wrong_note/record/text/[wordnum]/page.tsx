"use client"
import React, {useState, useEffect } from "react";
import {usePathname, useSearchParams} from "next/navigation";
import axios from "axios";
import AnswerModalProps from "@/app/sign-edu/select-type/answerModal";
import "@/app/styles/text_memo.css";
import Questions from '@/app/components/WrongTextQuest';


export default function TextMemory() {
    const searchParams = useSearchParams()
    const k_type = {'word' : "단어", 'sentence': "문장"};
    const site = {'hospital': '병원', 'school': '학교', 'job': '직업'};
    const type = searchParams.get('type');
    const total = Number(searchParams.get('total'));
    const situation = searchParams.get('situation');
    const chapter = Number(searchParams.get('chapter'));
    const real_current = usePathname().split("?");
    const wordnums = parseInt(real_current[0].slice(-1));

    const handleBack = () => {
            window.location.href = '/wrong_note';
        };

    return (
        <>
            {wordnums-1 == total?(
                <>
                    <div className="solved">
                        <p className="solve_txt">모든 문제를 풀었습니다.</p>
                        <button onClick={handleBack}>돌아가기</button>
                    </div>
                </>
            ) : (
                <>
                    <Questions type={k_type[type]} situation={site[situation]} chapter={chapter} word_num={wordnums} total={total}/>
                </>
            )}
        </>
    );

}