"use client"
import Link from 'next/link'
import React from 'react';
import { usePathname, useRouter } from 'next/navigation';
import LectureNum from '@/app/components/lecture';
import Image, { StaticImageData } from 'next/image';
import NextBtn from '../../../../../../../public/right_direct.png';
import "@/app/styles/situation_num.css"

export default function Lecture({params}:{params : {chapnum: number, wordnum: number}}) {
  const words = [["단어", "단어1"], ["병원1", "병원2"]]
  const currentPath = usePathname();
  const nextPath = currentPath.slice(0, -1);

  let buttonText = "다음";
  let nextWordNum = Number(params.wordnum) + 1;
  let nextHref = `${nextPath}/${nextWordNum}`;

  if (nextWordNum === words[params.chapnum].length) {
    buttonText = "암기 시작";
    nextHref = "/sign-edu/select-type";
  }

    return (
      <>
        <LectureNum situation='병원' chapnum={params.chapnum} wordnum={params.wordnum} word_str={words}/>
        <Link className="next_word" href={nextHref}><div className='nextBtn'>
              <div className='next_txt'>{buttonText}</div>
              <Image src={NextBtn} alt="next-button" className='next_image'></Image>
          </div></Link>
      </>
    );
  }