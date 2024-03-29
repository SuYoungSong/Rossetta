"use client"
import Image, { StaticImageData } from 'next/image';
import Link from 'next/link'
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import SignLearning from '../../../../public/sign_learn.png';
import TextLearning from '../../../../public/text_learn.png';
import "@/app/styles/TypeSelect.css";
import axios from "axios";

export default function SelectType({params}:{params : {site:string}}) {
    const currentPath = usePathname();

    return (
      <>
        <div className='Btn_all'>
            <Link href={`${currentPath}/sign-wrong`}>
                <div className='TypeBtn yellow'>
                    <Image className="type_image" src={SignLearning} alt='sign_learning'></Image>
                    <div className='TypeText'>수어 오답</div>
                </div>
            </Link>
            <Link href={`${currentPath}/text-wrong`}>
                <div className='TypeBtn green'>
                    <Image className="type_image" src={TextLearning} alt='sign_learning'></Image>
                    <div className='TypeText'>문자 오답</div>
                </div>
            </Link>
        </div>
      </>
    );
  }
