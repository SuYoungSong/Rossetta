import Link from 'next/link'
import React from 'react';
import ChapterList from '@/app/components/chapters';
import '@/app/styles/condition.css'
import Numpic from '../../../../../public/numbers.jpg'

export default function Sentence() {
    let chapter = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
  
    return (
      <>
        <div className='path'>
            <div className='detail_title'>오답노트 &gt; 문장</div>
            <div className='top_hr'></div>
        </div>
        <ChapterList imagePath={Numpic} selectName='문장'/>
      </>
    );
  }