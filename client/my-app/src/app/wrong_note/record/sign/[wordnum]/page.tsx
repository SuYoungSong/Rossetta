"use client"

import WebCam from "@/app/components/webCam";
import getAnswer from "@/app/components/getAnswer";
import React, {useEffect, useRef} from "react";
import {usePathname, useSearchParams} from 'next/navigation';
import axios from "axios";
import { useState } from "react";
import Image from "next/image";
import AnswerModalProps from '@/app/sign-edu/select-type/answerModal';
import WebCamMemorize from "@/app/components/webCamMemorize";
import {NormalizedLandmarkList} from "@mediapipe/holistic";
import {Timer} from "@/app/components/timer";
import "@/app/styles/text_memo.css";
import Questions from "@/app/components/WrongSignQuest";

export default function SignMemory() {
    const searchParams = useSearchParams()
    const k_type = {'word' : "단어", 'sentence': "문장"};
    const currentPath = usePathname()
    const wordnums = parseInt(currentPath.slice(-1));
    const total = Number(searchParams.get('total')) || 0;
    const situation = searchParams.get('situation') || null;
    const chapter = Number(searchParams.get('chapter')) || 0;
    const type = searchParams.get('type');

    const handleBack = () => {
            window.location.href = '/wrong_note';
        };


    return (
   <>
            {wordnums == total?(
                <>
                    <div className="solved">
                        <p className="solve_txt">모든 문제를 풀었습니다.</p>
                        <button onClick={handleBack}>돌아가기</button>
                    </div>
                </>
            ) : (
                <>
                    <Questions type={k_type[type]} situation={situation} chapter={chapter} word_num={wordnums} total={total}/>
                </>
            )}
        </>
    );
}