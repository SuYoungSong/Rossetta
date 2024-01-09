import React, {useEffect, useRef, useState} from "react";
import idkImage from "../../../public/idknow.png";
import CorrectImage from "../../../public/correct_image.png";
import IncorrectImage from "../../../public/incorrect_image.png";
import Image from "next/image";
import "@/app/styles/answerModal.css"
import axios from "axios";
import AnswerModalProps from "@/app/components/WrongModal";
import {usePathname} from "next/navigation";
import WebCamMemorize from "@/app/components/webCamMemorize";
import {NormalizedLandmarkList} from "@mediapipe/holistic";
import ProgressBar from "@/app/components/ProgressBar";

interface GetSignQuestions {
    type: string;
    situation?: string;
    chapter: number;
    word_num: number;
    total: number;
    path?: string;
}

interface WrongData {
  id: number;
  answer: string;
}

interface Answer {
  id: number;
  word: string;
}

//문제들 가져오기
const WrongSignQuest: React.FC<GetSignQuestions> = ({ type, situation="hospital", chapter, word_num, total, path }) => {
    let accessToken = localStorage.getItem('accessToken');
    const [landmarks, setLandmarks] = useState<Record<string, NormalizedLandmarkList>>({});
    const [isStart, setIsStart] = useState<boolean>(false);
    const isInitialRender = useRef(true);
    const [questionNumber, setQuestionNumber] = useState(0);
    const [disabled, setDisabled] = useState(false);
    const [resultLabel, setResultLabel] = useState<string>('');
    let userId = typeof window !== 'undefined' ? localStorage.getItem('id') : null;
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isAnswerCorrect, setIsAnswerCorrect] = useState(false);
    const [allTextQuestion, setTextQuestion] = useState<string[][]>([]);
    const [answer, setAnswer] = useState<string>('');
    const [answer_key, setKey] = useState<number>(0);
    const [questions, setQuestions] = useState<string[]>([]);
    const [videoUrl, setVideoUrl] = useState<string[]>([]);
    const [progress, setProgress] = useState(0);

    const site: Record<string, string> = {'hospital': '병원', 'school': '학교', 'job': '직업'};

    let param = {};
    let API_URL = '';
    let MODEL_API_URL = '';
    let second = 1;
    if (type == '단어') {
        API_URL = 'http://localhost:8000/api/wrongwordquestion/';
        MODEL_API_URL = "http://localhost:8000/api/wordmodel/"
        param = {
            id: userId, type: type, situation: site[situation], chapter: chapter, is_deaf: false
        }
    } else {
        API_URL = 'http://localhost:8000/api/wrongsentecequestion/';
        MODEL_API_URL = "http://localhost:8000/api/sentencemodel/"
        param = {
            id: userId, type: type, chapter: chapter, is_deaf: false
        }
        second = 4
    }

const getQuests = () => {
    axios.post(API_URL, param, { headers: { 'Authorization': `Token ${accessToken}` } })
      .then((res) => {
        const problems =  res.data
        console.log(problems);
        if (problems !== undefined) {
              const wrongData: WrongData[] = res.data['문제'];
              const wrong: (string | number)[][] = wrongData.map(item => [
                  item.answer.id,
                  item.answer.word
              ]);
          setAnswer(wrong[word_num][1]);
          setKey(wrong[word_num][0]);
        }
      })
      .catch((err) => {
        console.log('err >>', err.response);
      });
  };

    useEffect(() => {
        getQuests();

    }, []);

        useEffect(() => {
            // 초기 렌더링일 경우 실행하지 않음
            if (isInitialRender.current) {
              isInitialRender.current = false;
              return;
            }

            // progressbar 값 설정
            setProgress(Object.keys(landmarks).length);

            if(Object.keys(landmarks).length == second*30){
                const accessToken = localStorage.getItem('accessToken');

                axios.post(MODEL_API_URL, landmarks,{
                headers: {
                    'Authorization':`Token ${accessToken}`
                }})
                .then((res) => {
                    checkAnswer(res.data.predict);
                    console.log('모델 예측값:', res.data.predict)
                })
                .catch((err) => {
                    console.log(err)
                });
            }
        }, [landmarks]);

        //오답노트 맞은 문제 처리
    async function CorrectWrong(){
        const apiUrl = 'http://localhost:8000/api/practice-note';
        const correctId = Number(answer_key);
          const dataToUpdate = {
            is_deaf:false
          };

      try {
        const response = await axios.put(`${apiUrl}/${correctId}/${userId}/`, dataToUpdate, { headers: { 'Authorization': `Token ${accessToken}` } });
        console.log('Update successful:', response.data);
        // Handle successful response
      } catch (error) {
        console.error('Error updating resource:', error);
        // Handle error
      }
    }

    // 정답 여부 체크
    const checkAnswer = (predictAnswer: string) => {

          // 정답 여부에 따라 표시되는 문구 설정
        if (predictAnswer === answer) {
          setIsAnswerCorrect(true);
          CorrectWrong();
        } else {
          setIsAnswerCorrect(false);
        }
        handleOpenModal();
    };



    // 정답 결과를 제공하는 modal을 open하는 로직
    const handleOpenModal = () => {
        setIsModalOpen(true);
    };

    const handleLandmarksChange = (newLandmarks: Record<string, NormalizedLandmarkList>) => {
        setLandmarks(newLandmarks);
  };

    //채점 결과 띄우기
    const getAnswers = () => {
          if (isAnswerCorrect === null) {
            return { text: '모르겠어요', color: '#FFE6B5', image: idkImage };
          } else if (isAnswerCorrect) {
            return { text: '정답이에요', color: '#D0E8FF', image: CorrectImage };
          } else {
            return { text: '틀렸어요', color: '#FFC7C7', image: IncorrectImage };
          }
        };

    const getAnswer = getAnswers();

      // 다음 문제를 푸는 로직
        const handleNextQuestion = () => {
            if (type == '단어'){
                 window.location.replace(`${word_num + 1}?type=word&chapter=${chapter}&total=${total}&situation=${situation}`)
            }
            else{
                 window.location.replace(`${word_num + 1}?type=sentence&chapter=${chapter}&total=${total}`)
            }

          };

        // 문제 푸는걸 종료하고 메인으로 가는 로직
          const handleClose = () => {
            window.location.href = '/';
          };



    return (
        <>
            <div className="whole_camera">
                <WebCamMemorize onLandmarksChange={handleLandmarksChange} frameNumber={second * 30} isStart={isStart}/>
                <div className="answer_btn">
                    <div className="question">
                        <div className="quest-text">{answer}</div>
                    </div>
                    <ProgressBar max={second*30} progress={progress}/>
                    <div className={`check ${disabled ? 'disabled' : ''}`} onClick={() => {
                        if (!disabled) {
                            setIsStart(true);
                            setDisabled(true);
                        }
                    }}>
                        <div className='startQuiz'>문제 풀기</div>
                        <p>버튼을 클릭하면 <b>{second}초</b> 안에 <br/>동작을 해주세요. </p>
                    </div>
                </div>
                {isModalOpen && (
                    <div className="answerCheckModal-overlay">
                        <div className="answerCheckModal" style={{backgroundColor: getAnswer.color}}>
                            <div className="answerCheckModal-header">
                                <h2>{getAnswer.text}</h2>
                            </div>
                            <div className="answerCheckModal-body">
                                <Image className="answer_img" src={getAnswer.image} alt="answer_img"/>
                            </div>
                            <div className="answerCheckModal-footer">
                                <button onClick={handleNextQuestion}>다음 문제 풀기</button>
                                <button onClick={handleClose}>메인으로</button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </>
    );
};

export default WrongSignQuest;
