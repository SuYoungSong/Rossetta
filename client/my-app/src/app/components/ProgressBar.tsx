// components/ProgressBar.js

import React from 'react';

const ProgressBar = ({ max, progress }) => {
  const percentage = (progress / max) * 100;

  const style = {
    width: `${percentage}%`,
    height: '20px',
    backgroundColor: '#4CAF50', // 프로그래스바의 배경색
    position: 'relative',
  };

  const textStyle = {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    color: 'white',
  };

  return (
    <div style={{ border: '1px solid #ddd', borderRadius: '5px', overflow: 'hidden', position: 'relative' }}>
      <div style={style}>
        <div style={textStyle}>{`${percentage.toFixed(0)}%`}</div>
      </div>
    </div>
  );
};

export default ProgressBar;
