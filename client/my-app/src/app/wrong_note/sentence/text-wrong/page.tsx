"use client"
import Link from 'next/link'
import '@/app/styles/selectBtn.css'
import Sen from "../../../../../public/sentence_btn.jpg";
import Chapter from "@/app/components/wrongChapters";
import {usePathname} from "next/navigation";
import {StaticImageData} from "next/image";

export default function WrongChap() {
    const currentPath = usePathname().split("/");
    const type = currentPath[2];
    const isdeaf = (currentPath[3] === 'text-wrong');

  return (
    <>
      <div className='path'>
          <div className='detail_title'>오답노트 &gt; 문장</div>
          <div className='top_hr'></div>
          <Chapter imagePath={Sen} selectName={"문장"} type={type} isdeaf={isdeaf}/>
      </div>
    </>
  );
}