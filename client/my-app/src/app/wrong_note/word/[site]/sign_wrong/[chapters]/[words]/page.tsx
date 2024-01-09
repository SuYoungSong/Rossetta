"use client"
import Link from 'next/link'
import React, {useEffect, useState} from 'react';
import {usePathname, useRouter, useSearchParams} from 'next/navigation';
import LectureNum from '@/app/components/WrongLecture';
import Image, { StaticImageData } from 'next/image';
import NextBtn from '../../../../../../../../public/right_direct.png';
import "@/app/styles/situation_num.css"
import axios from "axios";

export default function wordSign({params}:{params : {chapters: number, words: number}}) {
    const site: { [key: string]: string } = {'hospital': '병원', 'school': '학교', 'job': '직업'};
    const currentPath = usePathname().split("/");
    const searchParams = useSearchParams();
    const total = parseInt(searchParams.get('total'));
    const real_current = usePathname().split("?");
    const nextPath = real_current[0].slice(0, -1) //단어 넘버 뺀 링크
    const place = currentPath[3];
    const type = currentPath[2];
    const is_deaf = (currentPath[4] === 'text_wrong');
    const wordnums = parseInt(real_current[0].slice(-1)); // 단어 넘버
    const nextTxt = (wordnums == total-1) ? "암기 시작" : "다음";
    const nextHref = ((wordnums == total-1) ? `/wrong_note/record/sign/0?type=${type}&chapter=${params.chapters}&situation=${place}&total=${total}` : nextPath + "/" + (wordnums+1) + `?total=${total}`);

    return (
      <>
        <LectureNum situation={site[place]} type={type} chapter={params.chapters} is_deaf={is_deaf} word_num={params.words}/>
        <Link className="next_word" href={nextHref}><div className='nextBtn'>
              <div className='next_txt'>{nextTxt}</div>
              <Image src={NextBtn} alt="next-button" className='next_image'></Image>
          </div></Link>
      </>
    );
  }