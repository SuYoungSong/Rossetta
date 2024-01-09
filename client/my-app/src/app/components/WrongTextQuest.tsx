import React, { useEffect, useState } from "react";
import idkImage from "../../../public/idknow.png";
import CorrectImage from "../../../public/correct_image.png";
import IncorrectImage from "../../../public/incorrect_image.png";
import "@/app/styles/answerModal.css"
import Image from "next/image";
import axios from "axios";
import AnswerModalProps from "@/app/components/WrongModal";
import {usePathname} from "next/navigation";

interface GetTextQuestions {
    type: string;
    situation?: string;
    chapter: number;
    word_num: number;
    total: number;
    path?: string;
}

interface Problem {
  1: {id:number, word: string };
  2: {id:number, word: string };
  3: {id:number, word: string };
  4: {id:number, word: string };
  video: string;
}

//문제들 가져오기
const WrongTextQuest: React.FC<GetTextQuestions> = ({ type, situation="hospital", chapter, word_num, total, path }) => {
    let accessToken = localStorage.getItem('accessToken');
    const [isLoading, setIsLoading] = useState(true);
    const [videoPath, setVideoPath] = useState("");
    const [resultLabel, setResultLabel] = useState<string>('');
    let userId = typeof window !== 'undefined' ? localStorage.getItem('id') : null;
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isAnswerCorrect, setIsAnswerCorrect] = useState(false);
    const [selectedOption, setSelectedOption] = useState(null);
    const [allTextQuestion, setTextQuestion] = useState<string[][]>([]);
    const [answer, setAnswer] = useState<string>('');
    const [answer_key, setKey] = useState<number>(0);
    const [questions, setQuestions] = useState<string[]>([]);
    const [videoUrl, setVideoUrl] = useState<string[]>([]);
    const site: Record<string, string> = {'hospital': '병원', 'school': '학교', 'job': '직업'};

    let param = {};
    let API_URL = '';

    if (type == '단어') {
        API_URL = 'http://localhost:8000/api/wrongwordquestion/';
        param = {
            id: userId, type: type, situation: site[situation], chapter: chapter, is_deaf: true
        }
    } else {
        API_URL = 'http://localhost:8000/api/wrongsentecequestion/';
        param = {
            id: userId, type: type, chapter: chapter, is_deaf: true
        }
    }

const getQuests = () => {
    axios.post(API_URL, param, { headers: { 'Authorization': `Token ${accessToken}` } })
      .then((res) => {

        const problems: Problem[] = res.data["문제"];
        if (problems !== undefined) {
          const videoList = problems.map(problem => "http://localhost:8000" + problem.video);
          const wordsList = problems.map(problem => [
            problem[1].word,
            problem[2].word,
            problem[3].word,
            problem[4].word
          ]);
          const keysList = problems.map(problem => [
            problem[1].id,
            problem[2].id,
            problem[3].id,
            problem[4].id
          ]);
          setAnswer(wordsList[word_num][0]);
          setKey(keysList[word_num][0]);
          setQuestions(shuffleArray(wordsList[word_num]));
          setVideoUrl(videoList);
          console.log(videoList);
        }
      })
      .catch((err) => {
        console.log('err >>', err.response.data);
      });
  };

    useEffect(() => {
        getQuests();

    }, []);

    console.log(path);

    // 단어 순서를 섞어서
    // 표시되는 위치를 변경.
    const shuffleArray = (array: any[]) => {
        const shuffledArray = Array.from(array);
        for (let i = shuffledArray.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [shuffledArray[i], shuffledArray[j]] = [shuffledArray[j], shuffledArray[i]];
        }
        return shuffledArray;
    };

    //오답노트 맞은 문제 처리
    async function CorrectWrong(){
        const apiUrl = 'http://localhost:8000/api/practice-note';
        const correctId = Number(answer_key);
          const dataToUpdate = {
            is_deaf:true
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
    const checkAnswer = (selectedAnswer: string) => {

        // 정답 여부에 따라 표시되는 문구 설정
        if (selectedAnswer === answer) {
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

    const handleRadioChange = (event) => {
        setSelectedOption(event.target.value);
    };

    //채점 결과 띄우기
    const getAnswers = () => {
          if (isAnswerCorrect === null) {
            return { text: '모르겠어요', color: '#FFE6B5', image: idkImage };
          } else if (isAnswerCorrect) {
              total = total - 1;
              word_num = word_num - 1;
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
            <div>
                <div className='question-content'>
                    <div className='question-video-zone'>
                        <video controls className="video" src={videoUrl[word_num]} style={{ width: '700px' }}></video>
                    </div>

                    <div className='question-choice-zone'>
                        <div className='back_white'>

                            <fieldset>
                                <div className="fixed-question">수화가 뜻하는 것은?</div>
                                <div>
                                    {questions.map((word, idx) => (
                                        <label className={`radio-btn ${selectedOption === word ? 'selected' : ''}`} htmlFor={`radio_${idx}`} key={idx}>
                                            <div className="plan">
                                                <input type="radio" id={`radio_${idx}`} name="input-radio" value={word} onChange={handleRadioChange} />
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
                {isModalOpen && (
                    <div className="answerCheckModal-overlay">
                      <div className="answerCheckModal"  style={{backgroundColor: getAnswer.color}}>
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

export default WrongTextQuest;
