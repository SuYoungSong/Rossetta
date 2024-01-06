"use client"
import React, {useEffect, useState} from 'react';
import '@/app/styles/training.css';
import '@/app/components/VideoPlayer';
import Link from 'next/link'
import Image,{ StaticImageData } from 'next/image';
import ExitBtn from '../../../../public/exit.png';
import WebCam from '@/app/components/webCam';
import axios from 'axios';

const Chatbot = ({params}:{params: {place: string}}) => {
    const type = (params.place)
    const dic: Record<string, string> = { "hospital": "병원", "taxi": "택시", "store": "마트" };
    const accessToken = localStorage.getItem('accessToken');
    // const accessToken = typeof window !== 'undefined' ? sessionStorage.getItem('accessToken') : null;
    const [script, setScript] = useState<string[]>([]);

    useEffect(() => {
        axios.post("http://localhost:8000/api/scenario/", {"situation": dic[type]}, {headers: {'Authorization': `Token ${accessToken}`}})
            .then((res) => {
                setScript(res.data[dic[type]])
            })
            .catch((err) => {
                console.log(err.response)
            });
    }, [type]);

    // take를 기준으로 정렬하는 함수
function sortByTake(array: { role: string; subtitle: string; take: number; video?: string }[]) {
  return array.sort((a, b) => a.take - b.take);
}

// 정렬된 결과를 나열하는 함수
function listByTake(array: { role: string; subtitle: string; take: number; video?: string }[]) {
  return array.map((item) => (
    <div key={item.take}>
      <p>{item.role}</p>
      <p>{item.subtitle}</p>
      {item.video && <p>{item.video}</p>}
    </div>
  ));
}
//
// // 결과 출력
// const sortedResponses = sortByTake(responses);
// const finalList = listByTake(sortedResponses);

    return(
        <>
            <div className='path_1'>
                <div className='detail_title'>수어실습 &gt; {dic[type]}</div>
                <div className='top_hr'></div>
            </div>
            <div className='section-lecture'>
                <div className='trainContainer'>
                    <div className='box avatarBox'>
                        <video controls className="video"
                               src={"http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4"}></video>
                        <div className='avatar'>이렇게 이해했어요</div>
                        <div className='avatar_sentance'>sssss{}</div>
                        {/* <VideoProps> */}
                        <div className='avatar'>AI:</div>
                        <div className='avatar_said'>ssssds{}</div>
                    </div>
                    <div className='box webcamBox'>
                        <WebCam/>
                    </div>
                </div>
            </div>

            <Link className="next_word" href="">
                <div className='nextBtn'>
                    <div className='next_txt'>종료</div>
                    <Image src={ExitBtn} alt="next-button" className='next_image'></Image>
                </div>
            </Link>
        </>
    );
}
export default Chatbot;