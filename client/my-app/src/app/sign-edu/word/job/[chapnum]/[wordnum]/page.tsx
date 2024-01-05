"use client"
import Link from 'next/link'
import React, { useState, useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import LectureNum from '@/app/components/lecture';
import Image, { StaticImageData } from 'next/image';
import NextBtn from '../../../../../../../public/right_direct.png';
import "@/app/styles/situation_num.css"

export default function Lecture({params}:{params : {chapnum: number, wordnum: number}}) {
  const [wordCount, setWordCount] = useState(0);
  const currentPath = usePathname();
  const nextPath = currentPath.slice(0, -1);
  const totalCnt = 3;
  useEffect(() => {
    fetch('http://127.0.0.1:8000/api/paper/word/단어/직업/${chapnum}/')
      .then(response => response.json())
      .then(data => setWordCount(data.length)); 
  }, []);

  let buttonText = "다음";
  let nextWordNum = Number(params.wordnum) + 1;
  let nextHref = `${nextPath}/${nextWordNum}`;

  if (nextWordNum == totalCnt) {
    buttonText = "암기 시작";
    nextHref = "/sign-edu/select-type";
  }

  return (
    <>
      <LectureNum situation='직업' chapnum={params.chapnum} wordnum={params.wordnum}/>
      <Link className="next_word" href={nextHref}><div className='nextBtn'>
            <div className='next_txt'>{buttonText}</div>
            <Image src={NextBtn} alt="next-button" className='next_image'></Image>
        </div></Link>
    </>
  );
}