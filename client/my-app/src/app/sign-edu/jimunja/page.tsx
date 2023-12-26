import Link from 'next/link'
import React from 'react';
import ChapterList from '@/app/components/chapters';
import '@/app/sign-edu/condition.css'
import Numpic from '../../../../public/numbers.jpg'

export default function School() {
    let chapter = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
  
    return (
      <>
        <div className='short_path'>
            <div className='detail_title'>지숫자</div>
            <div className='short_top_hr'></div>
        </div>
        <ChapterList imagePath={Numpic} selectName='지숫자'/>
      </>
    );
  }