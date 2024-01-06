"use client"
import React, {useEffect, useRef, useState} from 'react';
import '@/app/styles/training.css';
import Link from 'next/link';
import Image,{ StaticImageData } from 'next/image';
import ExitBtn from '../../../../../public/exit.png';
import WebCam from '@/app/components/webCam';
import axios from 'axios';
import {usePathname, useRouter} from "next/navigation";
import Video from "@/app/components/playVideo";

const Chatbot = ({params}:{params: {place: string, num: number}}) => {
    const type = (params.place)
    const dic: Record<string, string> = { "hospital": "병원", "taxi": "택시", "store": "마트" };
    const accessToken = localStorage.getItem('accessToken');
    const [totalLength, setTotalLength] = useState<number>(0);
    const [isCorrect, setIsCorrect] = useState<boolean>(false);
    const videoRef = useRef<HTMLVideoElement | null>(null);
    const [scripts, setScripts] = useState<string[]>([]);

  useEffect(() => {
      axios.post("http://localhost:8000/api/scenario/", {"situation": dic[type]}, {headers: {'Authorization': `Token ${accessToken}`}})
          .then((res) => {
              const script = res.data[dic[type]];
              if (script != undefined) {
                  setScripts(script)
                  console.log(script)
              }
          })
          .catch((err) => {
              console.log(err)
          });
  });
  //   const fetchData = async () => {
  //     try {
  //       const response = await axios.post("http://localhost:8000/api/scenario/", {"situation": dic[type]}, {headers: {'Authorization': `Token ${accessToken}`}});
  //       const script = response.data[dic[type]];
  //       console.log(script)
  //       if(script != undefined){
  //           setScripts(script)
  //           console.log(script)
  //       }
  //     } catch (error) {
  //       console.error('Error fetching data:', error);
  //     }
  //   };
  //   fetchData();
  // }, []);

  console.log(scripts[0]);

      const totalCnt = scripts.length;
      const currentPath = usePathname();
      const nextPath = currentPath.slice(0, -1);

      let buttonText = "다음";
      let nextWordNum = Number(params.num) + 1;
      let nextHref = `${nextPath}/${nextWordNum}`;

    useEffect(() => {
    // 비디오가 마운트되면 자동으로 재생
        if (videoRef.current) {
            setTotalLength(totalLength - 1);
            videoRef.current.play().catch(error => {
                console.error('Autoplay failed:', error);
              });
        }
      }, []);


  //임시로 수화가 인식된 상황 선언
    const delayedFunction = () => {
        setTimeout(() => {
          setIsCorrect(true);
          setTotalLength(totalLength - 1)
          console.log("3 seconds elapsed, isVariableTrue is now true");
          console.log(totalLength)
        }, 5000);
      };

    const handleLinkClick = () => {
        window.location.href = '/';
      };

    const response = scripts[params.num];
    console.log(response)

    return(
        <>
            <div className='path_1'>
                <div className='detail_title'>수어실습 &gt; {dic[type]}</div>
                <div className='top_hr'></div>
            </div>
            <Video response={response}/>

            <div className='nextBtn' onClick={handleLinkClick}>
                <div className='next_txt'>종료</div>
                <Image src={ExitBtn} alt="next-button" className='next_image'></Image>
            </div>

        </>
    );
}
export default Chatbot;