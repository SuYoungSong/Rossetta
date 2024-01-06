"use client"
import React, {useEffect, useRef, useState} from 'react';
import '@/app/styles/training.css';
import Link from 'next/link';
import Image,{ StaticImageData } from 'next/image';
import "@/app/styles/situation_num.css"
import axios from 'axios';
import {usePathname, useRouter} from "next/navigation";
import Video from "@/app/components/playVideo";
import ExitBtn from "../../../../../public/exit.png";
import NextBtn from "../../../../../public/right_direct.png";

const Chatbot = ({params}:{params: {place: string, num: number}}) => {
    const type = (params.place)
    const dic: Record<string, string> = { "hospital": "병원", "taxi": "택시", "store": "마트" };
    const accessToken = localStorage.getItem('accessToken');
    const [totalLength, setTotalLength] = useState<number>(0);
    const [isCorrect, setIsCorrect] = useState<boolean>(false);
    const [scripts, setScripts] = useState<string[]>([]);

  useEffect(() => {
      axios.post("http://localhost:8000/api/scenario/", {"situation": dic[type]}, {headers: {'Authorization': `Token ${accessToken}`}})
          .then((res) => {
              const script = res.data[dic[type]];
              if (script != undefined) {
                  setScripts(script)
                  console.log(scripts)
              }
          })
          .catch((err) => {
              console.log(err)
          });
  }, []);
      const currentPath = usePathname();
      const nextPath = currentPath.slice(0, -1);

      let nextWordNum = Number(params.num) + 1;
      let nextHref = `${nextPath}/${nextWordNum}`;

  //임시로 수화가 인식된 상황 선언
    const delayedFunction = () => {
        setTimeout(() => {
          setIsCorrect(true);
          setTotalLength(totalLength - 1)
          console.log("3 seconds elapsed, isVariableTrue is now true");
        }, 5000);
      };

    const response = scripts[params.num];
    let totallength, btnText, btnImg, nextLink;

    if (response) {
        totallength = scripts.length-1;
        btnText = (nextWordNum == totallength ? "종료" : "다음");
        btnImg = (nextWordNum == totallength ? ExitBtn : NextBtn);
    }

    const Chatreload = () => {
        window.location.replace("/chatbot");
    }

    return(
        <>
            <div className='path_1'>
                <div className='detail_title'>수어실습 &gt; {dic[type]}</div>
                <div className='top_hr'></div>
            </div>
            {response && (<Video take={response.take} role={response.role} subtitle={response.subtitle}
                                 video={response.video} total_length={totallength - 1}/>)}
            <Link href={nextWordNum === totallength? "/chatbot": nextHref} className="next_word">
                <div className='nextBtn' onClick={nextWordNum === totallength? Chatreload : undefined}>
                    <div className='next_txt'>{btnText}</div>
                    <Image src={btnImg} alt="next-button" className='next_image'></Image>
                </div>
            </Link>
        </>

    );
}
export default Chatbot;