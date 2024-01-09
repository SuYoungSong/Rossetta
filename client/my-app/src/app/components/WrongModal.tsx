import React, { FC, useState } from 'react';
import idkImage from "../../../public/idknow.png";
import CorrectImage from "../../../public/correct_image.png";
import IncorrectImage from "../../../public/incorrect_image.png";
import Image from "next/image";
import "@/app/styles/answerModal.css"
interface AnswerModalProps {
  isOpen: boolean;
  isAnswerCorrect: boolean;
  wordNum:number;
  path:string;
}


const answerModal: FC<AnswerModalProps> = ({ isOpen, isAnswerCorrect , wordNum, path}) => {
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
            window.location.replace(`wrong_note/record/text/${wordNum + 1}${path}`)
          };

        // 문제 푸는걸 종료하고 메인으로 가는 로직
          const handleClose = () => {
            window.location.href = '/';
          };

  return (
    <>
      {isOpen && (
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
    </>
  );
};

export default answerModal;
