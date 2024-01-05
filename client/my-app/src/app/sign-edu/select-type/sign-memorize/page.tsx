"use client"
import WebCam from "@/app/components/webCam";
import React from "react";
import { useSearchParams } from 'next/navigation';
import axios from "axios";
export default function SignMemory() {
    const isAnswerCorrect = true
    const searchParams = useSearchParams()

    const type = searchParams.get('type')
    const situation = searchParams.get('situation')
    const chapter = Number(searchParams.get('chapter'))



    const getAnswer = () => {
        if (isAnswerCorrect === null) {
            return { text: '답변 대기중', color: 'gray' };
          } else if (isAnswerCorrect) {
            return { text: '정답입니다!', color: 'red' };
          } else {
            return { text: '틀렸습니다.', color: 'blue' };
          }
    };
    
    const getAnswers = getAnswer();

    return (
      <>
          <WebCam />
      </>
    );
  }