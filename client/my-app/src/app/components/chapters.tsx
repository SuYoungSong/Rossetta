"use client"

import React from 'react';
import Link from 'next/link';
import Image, { StaticImageData } from 'next/image';
// import { useRouter } from 'next/router';
import "@/app/styles/condition.css"
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

interface ChapterProps {
  imagePath: StaticImageData;
  selectType: string;
  selectName: string;
}

const ChapterList: React.FC<ChapterProps> = ({imagePath, selectType, selectName}) => {
  const [chapters, setChapters] = useState([1, 2, 3, 4, 5, 6, 7, 8, 9, 10]);
  const currentPath = usePathname();
  const [data, setData] = useState<any>(null); // 데이터 상태
  const [loading, setLoading] = useState(true); // 로딩 상태

  useEffect(() => {
    const fetchData = async () => {
      try {
        var API_URL;
        if (selectType =='단어'){
          API_URL = `http://127.0.0.1:8000/api/paper/word/${selectType}/${selectName}/`
        }else{
          API_URL = `http://127.0.0.1:8000/api/paper/sentence/${selectName}/`
        }
        const response = await fetch(API_URL);
        const jsonData = await response.json();

        const endChapter = jsonData.chapter
        setChapters((prevChapters) => prevChapters.slice(0, endChapter)); // 이전 상태를 활용하여 chapters 갱신

        setData(jsonData); // 받아온 JSON 데이터를 상태에 저장
        setLoading(false); // 로딩 상태 변경
      } catch (error) {
        console.error('Error fetching data:', error);
        setLoading(false); // 에러가 발생하더라도 로딩 상태 변경
      }
    };

    fetchData(); // 함수 실행
  }, []); // 빈 배열을 두어 컴포넌트가 마운트될 때 한 번만 실행

  // 여기서 data를 이용하여 화면을 구성하면 됩니다.

  return (
    <div>
      {loading ? (
        // 로딩 중일 때의 화면 구성
        <p>Loading...</p>
      ) : data ? (
        <>
          <div className="chapter">
            <div className="spot-area">
              <Image className='btn-image' src={imagePath} alt="btn-image" />
              <div className="gradient-overlay"></div>
              <span className="spot-text">{selectName}</span>
            </div>
            <div className="chapter-area">
              {chapters.map((chapterNumber, index) => (
                <Link href={`../../${currentPath}/${chapterNumber}/0`} key={index}>
                  <div className="chapter-btn">Chapter {chapterNumber}</div>
                </Link>
              ))}
            </div>
          </div>
        </>
      ) : (
        // 데이터가 없을 때의 화면 구성
        <>
          <div className="chapter">
            <div className="spot-area">
              <Image className='btn-image' src={imagePath} alt="btn-image" />
              <div className="gradient-overlay"></div>
              <span className="spot-text">{selectName}</span>
            </div>
            <div className="chapter-area">
              {chapters.map((chapterNumber, index) => (
                <Link href={`../../${currentPath}/${chapterNumber}/0`} key={index}>
                  <div className="chapter-btn">Chapter {chapterNumber}</div>
                </Link>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default ChapterList;