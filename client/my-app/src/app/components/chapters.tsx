import React from 'react';
import Link from 'next/link';
import Image, { StaticImageData } from 'next/image';
import "@/app/sign-edu/condition.css"
//whats

interface ChapterProps {
  imagePath: StaticImageData;
  selectName: string;
}

const ChapterList: React.FC<ChapterProps> = ({imagePath, selectName}) => {
  const chapters = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

  return (
    <div className="chapter">
      <div className="spot-area">
        <Image className='btn-image' src={imagePath} alt="btn-image"></Image>
        <div className="gradient-overlay"></div>
        <span className="spot-text">{selectName}</span>
        {/* <img className="spot-img" src="/img1.jpg" alt="spot" /> */}
      </div>
      <div className="chapter-area">
        {chapters.map((chapterNumber, index) => (
          <Link href="#" key={index}>
            <div className="chapter-btn">Chapter {chapterNumber}</div>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default ChapterList;