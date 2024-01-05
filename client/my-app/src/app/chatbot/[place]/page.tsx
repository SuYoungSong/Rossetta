"use client"
import React from 'react';
import '@/app/styles/training.css';
import '@/app/components/VideoPlayer';
import Link from 'next/link'
import Image,{ StaticImageData } from 'next/image';
import NextBtn from '../../../../public/right_direct.png';
import axios from 'axios';

const Chatbot = ({params}:{params: {place: string}}) => {
    const type = (params.place)
    const dic: Record<string, string> = { "hospital": "병원", "taxi": "택시", "store": "마트" };
    const accessToken = localStorage.getItem('accessToken');

    axios.post("http://localhost:8000/api/scenario/", {"situation": dic[type]}, {headers: {'Authorization': `Token ${accessToken}`}})
            .then((res) => {
                console.log(res)
            })
            .catch((err) => {
                console.log(err.response)
            });

    return(
        <>
            <div className='path_1'>
                    <div className='detail_title'>수어실습 &gt; {dic[type]}</div>
                    <div className='top_hr'></div>
                </div>
            <div className='section-lecture'>
                <div className='trainContainer'>
                    <div className='box avatarBox'>
                        <video controls className="video" src={"http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4"}></video>
                        <div className='avatar'>이렇게 이해했어요</div>
                        <div className='avatar_sentance'>sssss{}</div>
                        {/* <VideoProps> */}
                        <div className='avatar'>AI:</div>
                        <div className='avatar_said'>ssssds{}</div>
                    </div>
                    <div className='box webcamBox'></div>
                </div>
            </div>

            <Link className="next_word" href=""><div className='nextBtn'>
              <div className='next_txt'>종료</div>
              <Image src={NextBtn} alt="next-button" className='next_image'></Image>
          </div></Link>
        </>
    );


}
export default Chatbot;