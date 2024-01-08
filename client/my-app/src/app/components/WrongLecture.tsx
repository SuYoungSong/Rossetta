import React, { useEffect, useState } from 'react';
import {useRouter, useSearchParams} from 'next/navigation';
import Image from 'next/image';
import VideoPlayer from "@/app/components/VideoPlayer";
import "@/app/styles/situation_num.css"
import backBtn from '../../../public/arrow_back.png'
import axios from "axios";

interface LectureProps {
    situation?: string;
    chapter: number;
    type: string;
    is_deaf: boolean;
    word_num: number;
}

interface VideoData {
    id: number;
    type: string;
    situation: string;
    chapter: number;
    sign_video_url: string;
    sign_answer: string;
}

interface WrongData {
  answer: string;
  video: string;
}

const WrongLecture: React.FC<LectureProps> = ({type, situation, chapter, is_deaf, word_num}) => {
    const userId = typeof window !== 'undefined' ? localStorage.getItem('id') : null;
    const accessToken = typeof window !== 'undefined' ? localStorage.getItem('accessToken') : null;
    const [length_wrong, setIsChapLength] = useState<number>(0);
    const [videoData, setVideoData] = useState<VideoData[]>([]);
    const [wrong, setWrong] = useState<string[][]>([]);
    const searchParams = useSearchParams();
    const router = useRouter();
    const total = parseInt(searchParams.get('total'));
    let URL:string;
    let param = {};
   if (type=='word'){
       URL = "http://localhost:8000/api/wordwrongcount/"
       param = {
           id: userId, type: "단어", situation: situation, chapter: chapter, is_deaf:is_deaf
       }
   }
   else if (type=='sentence'){
       URL = "http://localhost:8000/api/sentencewrongcount/"
       param = {
           id: userId, type:"문장", chapter: chapter, is_deaf: is_deaf
       }
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

    return (
        <>
            <div className='path' style={{margin: 'auto auto auto 18vw'}}>
                <div className='back-title'>
                    <Image className="backbtn" src={backBtn} alt='back' onClick={() => router.back()}></Image>
                    <div className='title_collection'>
                        <div className='detail_title'>{situation} &gt; 오답노트{chapter}</div>
                        <div className='top_hr'></div>
                    </div>
                </div>
            </div>

            <div className='section_lecture'>
                <VideoPlayer src_url={urls} count={chapter}/>
                <div className='word_part'>{videoData[chapter]?.sign_answer}</div>
            </div>
        </>
  );
};

export default WrongLecture;