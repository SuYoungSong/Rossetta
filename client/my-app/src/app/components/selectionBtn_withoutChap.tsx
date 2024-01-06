"use client"
import React from 'react';
import Link from 'next/link';
import Image, { StaticImageData } from 'next/image';

const site: Array<[string, string]> = [['병원', 'hospital'], ['학교', 'school'], ['직업', 'job']];

interface SelectionButtonProps {
    site: Array<[string, string]>;
    imagePath: StaticImageData[];
    hrefPrefix: string;
  }

  const dataRemove = () => {
    localStorage.removeItem("video_real");
    localStorage.removeItem("real_script");
}

  const SelectionBtn_withoutChap: React.FC<SelectionButtonProps> = ({site, imagePath, hrefPrefix}) => {
  return (
    <div className="place_btn_all">
      {site.map((a, i) => (
        <Link href={`${hrefPrefix}/${a[1]}/0`} key={i} onClick={dataRemove}>
          <div className="gradient">
            <Image src={imagePath[i]} alt={`이미지 ${i + 1}`} className="gradient-img" />
            <div className="gradient-overlay"></div>
            <div className="btn_text">{a[0]}</div>
          </div>
        </Link>
      ))}
    </div>
  );
};

export default SelectionBtn_withoutChap;