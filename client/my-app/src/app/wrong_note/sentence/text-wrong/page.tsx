"use client"
import React from 'react';
import Link from 'next/link';
import Image, { StaticImageData } from 'next/image';
// import { useRouter } from 'next/router';
import "@/app/styles/condition_1.css"

import { usePathname, useRouter } from 'next/navigation';
import DoughnutChart from "@/app/components/DoughnutChart";

interface ChapterProps {
  imagePath: StaticImageData;
  selectName: string;
}

const ChapterList: React.FC<ChapterProps> = ({imagePath, selectName}) => {
  const chapters = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
  const currentPath = usePathname();


  return (
    <div className="chapter">
      <div className="spot-area">
        <Image className='btn-image' src={imagePath} alt="btn-image" />
        <div className="gradient-overlay"></div>
        <span className="spot-text">{selectName}</span>
      </div>
      <div className="chapter-area">
        {chapters.map((chapterNumber, index) => (
          <Link href={`../../${currentPath}/${chapterNumber}/0`} key={index}>
            <div className="chapter-btn"><div className="dnchart"><DoughnutChart/> </div> <div className='btnText'>Chapter {chapterNumber}</div></div>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default ChapterList;

