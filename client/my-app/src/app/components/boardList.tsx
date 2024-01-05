import React from 'react';

interface BoardListItemProps {
  boardNum: number;
  username: string;
  title: string;
  state: boolean;
  created: string;
}

const BoardList: React.FC<BoardListItemProps> = ({ boardNum, username, title, state, created }) => {
  // 작성일자를 Date 객체로 파싱
  const createdAt = new Date(created);

  // 작성일자를 원하는 형식으로 표시 (연도부터 분까지)
  const formattedCreatedAt = `${createdAt.getFullYear()}-${(createdAt.getMonth() + 1).toString().padStart(2, '0')}-${createdAt.getDate().toString().padStart(2, '0')} ${createdAt.getHours().toString().padStart(2, '0')}:${createdAt.getMinutes().toString().padStart(2, '0')}`;

  return (
    <div className='boardList'>
      <div className='boardNum'>{boardNum}</div>
      <div className='boardMain'>
        <h4 className='boardTitle'>제목: {title}</h4>
        <p className='boardContent'>작성일자: {formattedCreatedAt || 'N/A'}
            {''}
            작성자:{username}</p>
      </div>
      <div className='waitBtn'>{state ? '답변완료' : '답변대기'}</div>
    </div>
  );
};

export default BoardList;