"use client"

import React from 'react';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import Link from 'next/link';
import Image, { StaticImageData } from 'next/image';
import VideoPlayer from "@/app/components/VideoPlayer";
import "@/app/styles/situation_num.css"
import backBtn from '../../../public/arrow_back.png'

interface LectureProps {
    situation: string;
    chapnum : number;
    wordnum : number;
    word_str: string[][];
}

const LecturePage: React.FC<LectureProps> = ({situation, chapnum, wordnum=0, word_str}) => {
    const router = useRouter();
    const urls = ["http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4", "http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4"]
  
    return (
        <>
            <div className='path' style={{margin: 'auto auto auto 18vw'}}>
                <div className='back-title'>
                    <Image className="backbtn" src={backBtn} alt='back' onClick={() => router.back()}></Image>
                    <div className='title_collection'>
                        <div className='detail_title'>{situation} &gt; 강의 {chapnum}</div>
                        <div className='top_hr'></div>
                    </div>
                </div>    
            </div>

            <div className='section_lecture'>
                <VideoPlayer src_url={urls} count={wordnum}/>
                <div className='word_part'>{word_str[chapnum-1][wordnum]}</div>
            </div>
        </>
        
  );
};

export default LecturePage;