"use client"
import Link from 'next/link'
import React, {useEffect, useState} from 'react';
import { usePathname, useRouter } from 'next/navigation';
import LectureNum from '@/app/components/WrongLecture';
import Image, { StaticImageData } from 'next/image';
import NextBtn from '../../../../../../../public/right_direct.png';
import "@/app/styles/situation_num.css"
import axios from "axios";

interface WrongData {
  answer: string;
  video: string;
}

interface VideoData {
    id: number;
    type: string;
    situation: string;
    chapter: number;
    sign_video_url: string;
    sign_answer: string;
}

export default function wordSign({params}:{params : {chapters: number}}) {
    const userId = typeof window !== 'undefined' ? localStorage.getItem('id') : null;
    const accessToken = typeof window !== 'undefined' ? localStorage.getItem('accessToken') : null;
    const site: { [key: string]: string } = {'hospital': '병원', 'school': '학교', 'job': '직업'};
    const [length_wrong, setIsChapLength] = useState<number>(0);
    const [videoData, setVideoData] = useState<VideoData[]>([]);
    const [wrong, setWrong] = useState<string[][]>([]);
    const router = useRouter();
    const currentPath = usePathname().split("/");
    const nextPath = currentPath.slice(0, -1)
    const place = currentPath[3];
    const type = currentPath[2];
    const is_deaf = (currentPath[4] === 'text_wrong');

    let URL:string;
    let param = {};
    URL = "http://127.0.0.1:8000/api/wordwronginfo/"
    param = {
        id: userId, type: "단어", situation: site[place], chapter: params.chapters, is_deaf:is_deaf
    }

    useEffect(() => {
          axios.post(URL, param, {headers: {'Authorization': `Token ${accessToken}`}})
              .then((res) => {
                    const leng = res.data.wrong.length;
                    if (leng != undefined) {
                        setIsChapLength(leng)
                        const wrongData: WrongData[] = res.data.wrong;

                      const wrong: string[][] = wrongData.map(item => [
                        item.answer,
                        item.video
                    ]);

                    setWrong(wrong);
                    }
                })
              .catch((err) => {
                  console.log(err);
              });
      }, []);
    console.log(wrong);

    return (
      <>
        {/*<LectureNum situation={site[place]} type={type} chapter={params.chapters} is_deaf={isdeaf} />*/}
        <Link className="next_word" href={`${nextPath}/`}><div className='nextBtn'>
              <div className='next_txt'>다음</div>
              <Image src={NextBtn} alt="next-button" className='next_image'></Image>
          </div></Link>
      </>
    );
  }