import React, { useState } from "react";
import idkImage from "../../../public/idknow.png";
import CorrectImage from "../../../public/correct_image.png";
import IncorrectImage from "../../../public/incorrect_image.png";
import Image from "next/image";

interface GetAnswerProps {
  isAnswerCorrect: boolean | null;
}

const getAnswer: React.FC<GetAnswerProps> = ({ isAnswerCorrect }) => {
  const getAnswers = () => {
    if (isAnswerCorrect === null) {
      return { text: '모르겠어요', color: '#FFE6B5', image: idkImage };
    } else if (isAnswerCorrect) {
      return { text: '정답', color: '#D0E8FF', image: CorrectImage };
    } else {
      return { text: '오답', color: '#FFC7C7', image: IncorrectImage };
    }
  };

  const answers = getAnswers();

  return (
    <>
      <div className="answer_btn">
        <div className="question">
          <div className="quest-text">단어</div>
        </div>
        <div className="check" style={{ backgroundColor: answers.color }}>
          <div className="answer_text">{answers.text}</div>
          <Image className="answer_img" src={answers.image} alt="answer_img" />
        </div>
      </div>
    </>
  );
};

export default getAnswer;
