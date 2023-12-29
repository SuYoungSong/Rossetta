import Link from 'next/link'
import React from 'react';
import ChapterList from '../../../components/wchapters';
import '@/app/styles/condition_1.css'
// import '@/app/sign-edu/selectBtn.css'
import Hospitalpic from '../../../../../public/hospital.jpg'

export default function Hospital() {
    let chapter = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
  
    return (
      <>
        <div className='path'>
            <div className='detail_title'>오답노트 &gt; 단어 &gt; 병원</div>
            <div className='top_hr'></div>
        </div>
        <ChapterList imagePath={Hospitalpic} selectName='병원'/>
      </>
    );
  }