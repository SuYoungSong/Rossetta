"use client"
import VideoPlayer from "@/app/components/VideoPlayer";
import React, {useState, useEffect } from "react";
import {useSearchParams} from "next/navigation";
import axios from "axios";
import AnswerModalProps from "@/app/sign-edu/select-type/answerModal";
import "@/app/styles/text_memo.css";


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


    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isAnswerCorrect, setIsAnswerCorrect] = useState(false);
    const [questionNumber, setQuestionNumber] = useState(0);

    const [selectedOption, setSelectedOption] = useState(null);


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

      const handleBack = () => {
        window.location.href = '/sign-edu';
      };

    // 문제를 가져오는 POST API
    const getQuestion = () => {
        const accessToken = localStorage.getItem('accessToken');
        axios.post(API_URL, param, {headers: {'Authorization': `Token ${accessToken}`}})
            .then((res) => {
                console.log(res)
                // 문제 정보 및 정답 설정
                setAnswer(res.data['문제'][1]['word'])
                const questionArray = [
                    res.data['문제'][1]['word'],
                    res.data['문제'][2]['word'],
                    res.data['문제'][3]['word'],
                    res.data['문제'][4]['word']
                ];
                setQuestionNumber(res.data['문제'][1]['id'])
                setResultLabel('');
                setQuestions(shuffleArray(questionArray));
                setVideoPath('http://localhost:8000' + res.data['문제']['video']['url'])
            })
            .catch((err) => {
                console.log('err>>',err)
            });
        };


    // 이용자가 문제를 푼 경우 상태를 서버에 전달
      const questionState = (is_answer: boolean) => {
          let accessToken = localStorage.getItem('accessToken');
          let userId = localStorage.getItem('id');

          const param = {
              is_answer: is_answer,
              paper: Number(questionNumber),
              user: userId,
              is_deaf: true
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

    const handleRadioChange = (event) => {
    setSelectedOption(event.target.value);
  };


    return (
      <>
          <div>

             {questions.length > 0 ? (
                 // 해당 챕터에 남은 문제가 있는 경우
                 <>
                     <div className='question-content'>
              <div className='question-video-zone'>
                  <video controls className="video" src={videoPath} style={{width: '700px'}}></video>
              </div>

              <div className='question-choice-zone'>
                  <div className='back_white'>

                  {/*{questions.map((word, idx) => (*/}
                  {/*     <button className="select_answer" key={idx} onClick={() => checkAnswer(word)}>{word}</button>*/}
                  {/*  ))}*/}
                      <fieldset>
                          <div className="fixed-question">수화가 뜻하는 것은?</div>
                          <div>
                          {questions.map((word, idx) => (
                                  <label className={`radio-btn ${selectedOption === word ? 'selected' : ''}`} htmlFor={`radio_${idx}`}>
                                      <div className="plan">
                                          <input type="radio" id={`radio_${idx}`} name="input-radio" value={word} onChange={handleRadioChange}/>
                                          <span className="btn-choice">{word}</span>
                                      </div>
                                  </label>
                          ))}
                          </div>
                           {selectedOption && <button className="select_answer" onClick={() => checkAnswer(selectedOption)}>채점하기</button>}
                      </fieldset>

                  </div>
                  <div>{resultLabel}</div>
              </div>
                         </div>
                 </>
             ):(// 해당 챕터에 모든 문제를 푼 경우 (정답 여부 상관 없이)
                 <>
                     <div className="solved">
                        <p className="solve_txt">모든 문제를 풀었습니다.</p>
                        <button onClick={handleBack}>돌아가기</button>
                    </div>
                 </>
             )}

          <AnswerModalProps isOpen={isModalOpen} isAnswerCorrect={isAnswerCorrect} />
          </div>
      </>
    );
    
  }