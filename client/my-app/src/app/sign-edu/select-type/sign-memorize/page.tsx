"use client"

import WebCam from "@/app/components/webCam";
import getAnswer from "@/app/components/getAnswer";
import React, {useEffect, useRef} from "react";
import { useSearchParams } from 'next/navigation';
import axios from "axios";
import { useState } from "react";
import Image from "next/image";
import AnswerModalProps from '../answerModal';
import WebCamMemorize from "@/app/components/webCamMemorize";
import {NormalizedLandmarkList} from "@mediapipe/holistic";
import {Timer} from "@/app/components/timer";

export default function SignMemory() {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const searchParams = useSearchParams()

    const type = searchParams.get('type')
    const situation = searchParams.get('situation')
    const chapter = Number(searchParams.get('chapter'))
    const [answer, setAnswer] = useState("");

    const userId = typeof window !== 'undefined' ? localStorage.getItem('id') : null;
    const [isAnswerCorrect, setIsAnswerCorrect] = useState(false);
    const [landmarks, setLandmarks] = useState<Record<string, NormalizedLandmarkList>>({});
    const [isStart, setIsStart] = useState<boolean>(false);
    const isInitialRender = useRef(true);
    const [questionNumber, setQuestionNumber] = useState(0);

    const handleLandmarksChange = (newLandmarks: Record<string, NormalizedLandmarkList>) => {
        setLandmarks(newLandmarks);
  };

    let param = {};
    let API_URL = '';
    let MODEL_API_URL = '';
    let second = 1;
    if (type == '단어') {
        second = 1;
        API_URL = "http://localhost:8000/api/wordquestion/"
        MODEL_API_URL = "http://localhost:8000/api/wordmodel/"
        param = {
            id: userId, type: type, situation: situation, chapter: chapter, is_deaf: false
        }
    } else {
        second = 4;
        API_URL = "http://localhost:8000/api/sentencequestion/"
        MODEL_API_URL = "http://localhost:8000/api/sentencemodel/"
        param = {
            id: userId, type: type, chapter: chapter, is_deaf: false
        }
    }
        const getQuestion = () => {
            const accessToken = localStorage.getItem('accessToken');
            axios.post(API_URL, param, {headers: {'Authorization': `Token ${accessToken}`}})
                .then((res) => {
                    // '문제'가 존재하고 'answer'가 존재하며 'word'가 존재할 때 값을 설정
                  if (res.data && res.data['문제'] && res.data['문제'].answer && res.data['문제'].answer.word) {
                    setAnswer(res.data['문제'].answer.word);
                    setQuestionNumber(res.data['문제'].answer.id)
                  } else {
                    // 위 조건 중 하나라도 만족하지 않으면 null로 설정
                    setAnswer('null');
                 }
                    // console.log(res)
                })
                .catch((err) => {
                    console.log(err)
                });
        };


        useEffect(() => {
            getQuestion();
            // handleOpenModal();
         }, []);

        useEffect(() => {
            // 초기 렌더링일 경우 실행하지 않음
            if (isInitialRender.current) {
              isInitialRender.current = false;
              return;
            }

            if(Object.keys(landmarks).length == second*30){
                const accessToken = localStorage.getItem('accessToken');

                axios.post(MODEL_API_URL, landmarks,{
                headers: {
                    'Authorization':`Token ${accessToken}`
                }})
                .then((res) => {
                    checkAnswer(res.data.predict);
                })
                .catch((err) => {
                    console.log(err)
                });
            }
        }, [landmarks]);


        
    // 이용자가 문제를 푼 경우 상태를 서버에 전달
      const questionState = (is_answer: boolean) => {
        let accessToken = localStorage.getItem('accessToken');
        let userId = localStorage.getItem('id');

        const param = {
            is_answer: is_answer,
            paper: Number(questionNumber),
            user: userId,
            is_deaf: false
        }

        axios.post("http://localhost:8000/api/practice-note/", param, {
            headers: {
                'Authorization': `Token ${accessToken}`
            }
        })

            .then((res) => {
                // 요청에 성공한 경우
                // 처리할 내용 없음
            })
            .catch((err) => {
                // 요청에 실패한 경우
                console.log("err >> ", err);
            });
    };


    // 정답 여부 체크
    const checkAnswer = (predictAnswer: string) => {

          // 정답 여부에 따라 표시되는 문구 설정
        if (predictAnswer === answer) {
          setIsAnswerCorrect(true);
          questionState(true);
        } else {
          setIsAnswerCorrect(false);
          questionState(false);
        }
        handleOpenModal();
    };



    // 정답 결과를 제공하는 modal을 open하는 로직
    const handleOpenModal = () => {
        setIsModalOpen(true);
      };

    const handleBack = () => {
        window.location.href = '/sign-edu';
    };


        return (
              <>
                {answer !== 'null' ? (
                  // 해당 챕터에 남은 문제가 있는 경우
                  <div className="whole_camera">
                    <WebCamMemorize onLandmarksChange={handleLandmarksChange} frameNumber={second * 30} isStart={isStart} />
                    <div className="answer_btn">
                      <div className="question">
                        <div className="quest-text">{answer}</div>
                      </div>
                        <div className="check" onClick={() => setIsStart(true)}>
                            <div className='startQuiz'>문제 풀기</div>
                            {/*버튼 누르면 글자 타이머로 바뀌게*/}
                            {/*{!isStart?*/}
                            {/*    <>*/}
                            {/*        <div className='startQuiz'>문제 풀기</div>*/}
                            {/*    </> :*/}
                            {/*    <>*/}
                            {/*        /!*<Timer sec_num={second}/>*!/*/}
                            {/*    </>}*/}
                            <p>버튼을 클릭하면 <b>{second}초</b> 안에 <br/>동작을 해주세요. </p>
                        </div>
                    </div>
                      <AnswerModalProps isOpen={isModalOpen} isAnswerCorrect={isAnswerCorrect} />
                  </div>
                ) : (
                  // 해당 챕터에 모든 문제를 푼 경우 (정답 여부 상관 없이)
                  <>
                    <p>모든 문제를 풀었습니다.</p>
                    <button onClick={handleBack}>돌아가기</button>
                  </>
                )}
              </>
            );
}