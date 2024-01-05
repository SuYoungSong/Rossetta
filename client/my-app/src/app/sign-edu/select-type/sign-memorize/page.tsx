"use client"
import WebCam from "@/app/components/webCam";
import React from "react";
import getAnswer from "@/app/components/getAnswer";
import { useSearchParams } from 'next/navigation';
import axios from "axios";
export default function SignMemory() {
    const isAnswerCorrect = true

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
        <WebCam/>;
      </>
    );
  }