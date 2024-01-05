"use client"

import WebCam from "@/app/components/webCam";
import getAnswer from "@/app/components/getAnswer";
import React from "react";
import { useSearchParams } from 'next/navigation';
import axios from "axios";
import { useState } from "react";
import Image from "next/image";
import idkImage from "../../../../../public/idknow.png";
import CorrectImage from "../../../../../public/correct_image.png";
import IncorrectImage from "../../../../../public/incorrect_image.png";
export default function SignMemory() {
    const isAnswerCorrect = false
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
        const getAnswers = () => {
            if (isAnswerCorrect === null) {
              return { text: '모르겠어요', color: '#FFE6B5', image: idkImage };
            } else if (isAnswerCorrect) {
              return { text: '정답', color: '#D0E8FF', image: CorrectImage };
            } else {
              return { text: '오답', color: '#FFC7C7', image: IncorrectImage };
            }
          };

        const getAnswer = getAnswers();

        return (
            <>
                <div className="whole_camera">
                    <WebCam answer={answer}/>
                    <div className="answer_btn">
                        <div className="question">
                            <div className="quest-text">단어</div>
                        </div>
                        <div className="check" style={{backgroundColor: getAnswer.color}}>
                            <div className="answer_text">{getAnswer.text}</div>
                            <Image className="answer_img" src={getAnswer.image} alt="answer_img"/>
                        </div>
                    </div>
                </div>
            </>
        );
}