"use client"

import WebCam from "@/app/components/webCam";
import getAnswer from "@/app/components/getAnswer";
import React from "react";
import { useSearchParams } from 'next/navigation';
import axios from "axios";
import { useState, useEffect } from "react";
import Image from "next/image";
import AnswerModalProps from '../answerModal';
import WebCamMemorize from "@/app/components/webCamMemorize";
export default function SignMemory() {

    const [isModalOpen, setIsModalOpen] = useState(false);
    const searchParams = useSearchParams()

    const type = searchParams.get('type')
    const situation = searchParams.get('situation')
    const chapter = Number(searchParams.get('chapter'))
    const [answer, setAnswer] = useState("");

    const userId = typeof window !== 'undefined' ? localStorage.getItem('id') : null;


    const [isAnswerCorrect, setIsAnswerCorrect] = useState(false);



    let param = {};
    let API_URL = '';

    if (type == '단어') {
        API_URL = "http://localhost:8000/api/wordquestion/"
        param = {
            id: userId, type: type, situation: situation, chapter: chapter, is_deaf: false
        }
    } else {
        API_URL = "http://localhost:8000/api/sentencequestion/"
        param = {
            id: userId, type: type, chapter: chapter, is_deaf: false
        }
    }
        const getQuestion = () => {
            const accessToken = localStorage.getItem('accessToken');
            axios.post(API_URL, param, {headers: {'Authorization': `Token ${accessToken}`}})
                .then((res) => {
                    setAnswer(res.data['문제'].answer.word);
                    console.log(res)
                })
                .catch((err) => {
                    console.log(err)
                });
        };


        useEffect(() => {
            getQuestion();
            // handleOpenModal();
         }, []);



        // 정답 결과를 제공하는 modal을 open하는 로직
        const handleOpenModal = () => {
            setIsModalOpen(true);
          };


        return (
            <>
                <div className="whole_camera">
                    <WebCamMemorize/>
                    <div className="answer_btn">
                        <div className="question">
                            <div className="quest-text">{answer}</div>
                        </div>
                        <div className="check">
                            <button className='startQuiz'>문제 풀기</button>
                        </div>
                    </div>
                </div>
                <AnswerModalProps isOpen={isModalOpen} isAnswerCorrect={isAnswerCorrect} />
            </>
        );
}