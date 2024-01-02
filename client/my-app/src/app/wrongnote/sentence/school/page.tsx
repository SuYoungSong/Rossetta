

import Link from 'next/link'
import React from 'react';
import ChapterList from '../../../components/wchapters';
import '@/app/sign-edu/condition_1.css'
// import '@/app/sign-edu/selectBtn.css'
import Schoolpic from '../../../../../public/school.jpg'

export default function School() {
    let chapter = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
  
    return (
      <>
        <div className='path'>
            <div className='detail_title'>교육 &gt; 문장 &gt; 학교</div>
            <div className='top_hr'></div>
        </div>
        <ChapterList imagePath={Schoolpic} selectName='학교'/>
      </>
    );
  }

   