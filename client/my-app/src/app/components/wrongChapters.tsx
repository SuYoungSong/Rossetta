"use client"
import React, {useEffect, useState} from 'react';
import Link from 'next/link';
import Image, { StaticImageData } from 'next/image';
// import { useRouter } from 'next/router';
import "@/app/styles/condition_1.css"

import { usePathname, useRouter } from 'next/navigation';
import Chart from "@/app/components/donut";
import axios from "axios";

interface ChapterProps {
  imagePath?: StaticImageData;
  selectName: string;
  type: string;
  isdeaf: boolean;
}

interface ChapterItem {
  chapter: number;
  paper_all_count: number;
  correct_count: number;
  wrong_count: number;
  unsolved_count: number;
}

const wrongChapters: React.FC<ChapterProps> = ({imagePath, selectName, type, isdeaf}) => {
   const userId = typeof window !== 'undefined' ? localStorage.getItem('id') : null;
   const accessToken = typeof window !== 'undefined' ? localStorage.getItem('accessToken'):null;
   const [islength, setIsChapLength] = useState<number>(0);
   const [chapterState, setChapterState] = useState<ChapterItem[]>([]);
   const [isLoding, setIsLoding] = useState(true);
   const currentPath = usePathname();
   const pathParts = currentPath.split('/'); // 경로를 '/'로 나눕니다.
    const lastPartUrl = pathParts[pathParts.length - 1]; // 마지막 부분을 가져옵니다.


   let URL:string;
   let param = {};
   let subUrl = ''
    let subPageLastUrl = ''

   if (type=='word'){
       URL = "http://localhost:8000/api/wordwrongcount/"
       param = {
           id: userId, type: "단어", situation: selectName
       }
       subUrl = selectName
       subPageLastUrl = 'text_wrong'
   }
   else if (type=='sentence'){
       URL = "http://localhost:8000/api/sentencewrongcount/"
       param = {
           id: userId, type:"문장"
       }
       subUrl = '문장'
       subPageLastUrl = 'text-wrong'
   }

   const setChapLength = (n: number): number[] => {
      return Array.from({ length: n }, (_, index) => index + 1);
    };

  useEffect(() => {
      axios.post(URL, param, {headers: {'Authorization': `Token ${accessToken}`}})
          .then((res) => {

              setChapterState([])
              const dataList = res.data[subUrl]

              dataList.forEach(item => {

                  const correctCountKey = lastPartUrl == subPageLastUrl ? 'correct_deaf_count' : 'correct_deaf_not_count';
                  const wrongCountKey = lastPartUrl == subPageLastUrl ? 'wrong_deaf_count' : 'wrong_deaf_not_count';
                  const unsolvedCountKey = lastPartUrl == subPageLastUrl ? 'unsolved_deaf_count' : 'unsolved_deaf_not_count';

                  const newItem: ChapterItem = {
                    chapter: item.chapter,
                    paper_all_count: item.paper_all_count,
                    correct_count: item[correctCountKey],
                    wrong_count: item[wrongCountKey],
                    unsolved_count: item[unsolvedCountKey]
                  };
                  // 틀린문제가 있는 경우만 저장한다.
                  if (newItem.wrong_count > 0){
                    setChapterState(prevChapterState => [...prevChapterState, newItem]);
                  }
                });

              setIsLoding(false)

            })
          .catch((err) => {
              console.log(err)
          });
  }, []);

    useEffect(() => {
        // setIsLoding(false)
    }, [chapterState]);

    const chapters = setChapLength(islength);
      const handleBack = () => {
        window.location.href = '/wrong_note';
      };
return (
  <div className="chapter">


    {isLoding ? (
      <>
          <div className="loading-container">
              <div className="loading"></div>
              <div id="loading-text">loading</div>
          </div>
      </>
    ) : (
        <>
            {chapterState.length > 0 ? (
                <>
                <div className="spot-area">
                    <Image className='btn-image' src={imagePath} alt="btn-image"/>
                    <div className="gradient-overlay"></div>
                    <span className="spot-text">{selectName}</span>
                </div>
                <div className="chapter-area">
                    {chapterState.map((chapterItem, index) => (
                        <Link
                            href={`../../../${currentPath}/${chapterItem.chapter}/0?total=${chapterItem.paper_all_count - chapterItem.unsolved_count}`}
                            key={index}>
                            <div className="chapter-btn">
                                <div className="dnchart">
                                    <Chart
                                        allCount={chapterItem.wrong_count + chapterItem.correct_count}
                                        correct={chapterItem.correct_count}
                                    />
                                </div>
                                <div className='btnText'>Chapter {chapterItem.chapter}</div>
                            </div>
                        </Link>
                    ))}
                </div>
                </>
            ) : (
                <>
                    <div className="solved">
                        <p className="solve_txt">오답 문제가 없습니다.</p>
                        <button onClick={handleBack}>돌아가기</button>
                    </div>
                </>
            )}
        </>
    )}
  </div>
);
}
export default wrongChapters;