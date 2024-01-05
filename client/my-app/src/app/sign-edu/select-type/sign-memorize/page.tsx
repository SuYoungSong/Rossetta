"use client"

import WebCam from "@/app/components/webCam";
import React from "react";
import { useSearchParams } from 'next/navigation';
import axios from "axios";
import { useState } from "react";
export default function SignMemory() {
    const isAnswerCorrect = true
    const searchParams = useSearchParams()

    const type = searchParams.get('type')
    const situation = searchParams.get('situation')
    const chapter = Number(searchParams.get('chapter'))
    const [answer, setAnswer] = useState("");

    const userId = localStorage.getItem('id');
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
        getQuestion();
        const getAnswer = () => {
            if (isAnswerCorrect === null) {
                return {text: '답변 대기중', color: 'gray'};
            } else if (isAnswerCorrect) {
                return {text: '정답입니다!', color: 'red'};
            } else {
                return {text: '틀렸습니다.', color: 'blue'};
            }
        };

        const getAnswers = getAnswer();

        return (
            <>
                <WebCam answer={answer}/>
            </>
        );
    }