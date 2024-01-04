import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import VideoPlayer from "@/app/components/VideoPlayer";
import "@/app/styles/situation_num.css"
import backBtn from '../../../public/arrow_back.png'

interface LectureProps {
    situation: string;
    chapnum: number;
    wordnum: number;
}

interface VideoData {
    id: number;
    type: string;
    situation: string;
    chapter: number;
    sign_video_url: string;
    sign_answer: string;
}

const LecturePage: React.FC<LectureProps> = ({situation, chapnum, wordnum=0}) => {
    const [videoData, setVideoData] = useState<VideoData[]>([]);
    const router = useRouter();

    useEffect(() => {
    
        var API_URL;
        if (situation == "문장") {
            API_URL = `http://127.0.0.1:8000/api/paper/sentence/${situation}/${chapnum}`;
        } else {
            API_URL = `http://127.0.0.1:8000/api/paper/word/단어/${situation}/${chapnum}`;
        }
        
        fetch(API_URL)
            .then(response => response.json())
            .then(data => setVideoData(data));
    }, [situation, chapnum]);

    const urls = videoData.filter(video => video.situation === situation && video.chapter === chapnum)
        .map(video => video.sign_video_url);

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
                <div className='word_part'>{videoData[wordnum]?.sign_answer}</div>
            </div>
        </>
  );
};

export default LecturePage;