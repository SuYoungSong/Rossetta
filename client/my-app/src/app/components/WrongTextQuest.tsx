import React, { useEffect, useState } from "react";
import idkImage from "../../../public/idknow.png";
import CorrectImage from "../../../public/correct_image.png";
import IncorrectImage from "../../../public/incorrect_image.png";
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
  1: { word: string };
  2: { word: string };
  3: { word: string };
  4: { word: string };
  video: string;
}

//문제들 가져오기
const WrongTextQuest: React.FC<GetTextQuestions> = ({ type, situation, chapter, word_num, total, path }) => {
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
    const [questions, setQuestions] = useState<string[]>([]);
    const [videoUrl, setVideoUrl] = useState<string[]>([]);

    let param = {};
    let API_URL = '';

    if (type == '단어') {
        API_URL = 'http://localhost:8000/api/wrongwordquestion/';
        param = {
            id: userId, type: type, situation: situation, chapter: chapter, is_deaf: true
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
          setAnswer(wordsList[word_num][0]);
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

    // 정답 여부 체크
    const checkAnswer = (selectedAnswer: string) => {

        // 정답 여부에 따라 표시되는 문구 설정
        if (selectedAnswer === answer) {
            setIsAnswerCorrect(true);

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
                <AnswerModalProps isOpen={isModalOpen} isAnswerCorrect={isAnswerCorrect} wordNum={word_num} path={path}/>
            </div>
        </>
    );
};

export default WrongTextQuest;
