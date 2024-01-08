"use client"
import Link from 'next/link'
import '@/app/styles/selectBtn.css'
import SelectionButton from '@/app/components/selectionButton';
import Hospital from '../../../../../../public/hospital.jpg'
import School from '../../../../../../public/school.jpg';
import Job from "../../../../../../public/job.jpg";
import Chapter from "@/app/components/wrongChapters";
import {usePathname} from "next/navigation";
import {StaticImageData} from "next/image";

type LanguageItem = {
  [key: string]: [string, StaticImageData];
};

const site: LanguageItem = {
  'hospital': ['병원', Hospital],
  'school': ['학교', School],
    'job': ['직업', Job]
};

export default function WrongChap() {
    const currentPath = usePathname().split("/");
    const place = currentPath[3];
    const type = currentPath[2]


  return (
    <>
      <div className='path'>
          <div className='detail_title'>오답노트 &gt; 단어</div>
          <div className='top_hr'></div>
          <Chapter imagePath={site[place][1]} selectName={site[place][0]} type={type}/>
      </div>

    </>


  );
}