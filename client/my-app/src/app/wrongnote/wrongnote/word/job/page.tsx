import Link from 'next/link'
import React from 'react';
import ChapterList from '../../../../components/chapters';
import '@/app/styles/condition.css'
// import '@/app/sign-edu/selectBtn.css'
import Jobpic from '../../../../../../public/job.jpg'

export default function Job() {
    let chapter = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
  
    return (
      <>
        <div className='path'>
            <div className='detail_title'>오답노트 &gt; 단어 &gt; 직업</div>
            <div className='top_hr'></div>
        </div>
        <ChapterList imagePath={Jobpic}  selectName='직업'/>
      </>
    );
  }