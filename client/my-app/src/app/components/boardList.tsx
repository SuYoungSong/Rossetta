import React from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';

interface BoardListItemProps {
  boardNum: number;
  boardTitle: string;
  boardContent: string;
 
}

const BoardListItem: React.FC<BoardListItemProps> = ({ boardNum, boardTitle, boardContent }) => {
  return (
    
    <div className='boardList'>
      <div className='boardNum'>{boardNum}</div>
      <div className='boardMain'>
        <h4 className='boardTitle'>{boardTitle}</h4>
        <p className='boardContent'>{boardContent}</p>
      </div>
      <div className='waitBtn'>답변대기</div>
    </div>
    
  );
};

export default BoardListItem;




