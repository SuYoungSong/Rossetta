"use client"
import VideoPlayer from "@/app/components/VideoPlayer";
import React, {useState, useEffect } from "react";
import {useSearchParams} from "next/navigation";
import axios from "axios";


export default function TextMemory() {
    const urls = ["http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4", "http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4"]

    const searchParams = useSearchParams()

    const type = searchParams.get('type')
    const situation = searchParams.get('situation')
    const chapter = Number(searchParams.get('chapter'))

    const [videoPath, setVideoPath] = useState("");
    const [questionAnswer, setAnswer] = useState("");
    const [questions, setQuestions] = useState<string[]>([]);

    const [resultLabel, setResultLabel] = useState<string>('');

    const userId = typeof window !== 'undefined' ? localStorage.getItem('id') : null;

    let param = {};
    let API_URL = '';

    if (type == '단어') {
        API_URL = "http://localhost:8000/api/wordquestion/"
        param = {
            id: userId, type: type, situation: situation, chapter: chapter, is_deaf: true
        }
    } else {
        API_URL = "http://localhost:8000/api/sentencequestion/"
        param = {
            id: userId, type: type, chapter: chapter, is_deaf: true
        }
    }

    // 문제를 가져오는 POST API
    const getQuestion = () => {
        const accessToken = localStorage.getItem('accessToken');
        axios.post(API_URL, param, {headers: {'Authorization': `Token ${accessToken}`}})
            .then((res) => {
                // 문제 정보 및 정답 설정
                setAnswer(res.data['문제'][1]['word'])
                const questionArray = [
                    res.data['문제'][1]['word'],
                    res.data['문제'][2]['word'],
                    res.data['문제'][3]['word'],
                    res.data['문제'][4]['word']
                ];
                setResultLabel('');
                setQuestions(shuffleArray(questionArray));
                setVideoPath('http://localhost:8000' + res.data['문제']['video']['url'])
            })
            .catch((err) => {
                console.log('err>>',err)
            });
        };




    useEffect(() => {
        getQuestion();
    }, []);


    // 단어 순서를 섞어서
    // 표시되는 위치를 변경.
    const shuffleArray = (array: any[]) => {
      const shuffledArray = [...array];
      for (let i = shuffledArray.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffledArray[i], shuffledArray[j]] = [shuffledArray[j], shuffledArray[i]];
      }
      return shuffledArray;
    };

    // 정답 여부 체크
    const checkAnswer = (selectedAnswer: string) => {

          // 정답 여부에 따라 표시되는 문구 설정
        if (selectedAnswer === questionAnswer) {
          setResultLabel('정답입니다.');
        } else {
          setResultLabel('오답입니다.');
        }

    };
  
    return (
      <>
        <div>문자 암기 페이지</div>
          <div className='question-content'>

              <div className='question-video-zone'>
                  <video controls className="video" src={videoPath} style={{width: '700px'}}></video>
              </div>

              <div className='question-choice-zone'>
                  {questions.map((word, idx) => (
                       <button key={idx} onClick={() => checkAnswer(word)}>{word}</button>
                    ))}
                  <div>{resultLabel}</div>
              </div>
          </div>


      </>
    );
    
  }