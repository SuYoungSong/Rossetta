"use client"
import Image, { StaticImageData } from 'next/image';
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation';
import SignLearning from '../../../../public/sign_learn.png';
import TextLearning from '../../../../public/text_learn.png';
import "@/app/styles/TypeSelect.css";

export default function SelectType() {
    const currentPath = usePathname();

    return (
      <>
        <div className='Btn_all'>
            <Link href={`${currentPath}/sign-memorize`}>
                <div className='TypeBtn yellow'>
                    <Image className="type_image" src={SignLearning} alt='sign_learning'></Image>
                    <div className='TypeText'>수어 암기</div>
                </div>
            </Link>
            <Link href={`${currentPath}/text-memorize`}>
                <div className='TypeBtn green'>
                    <Image className="type_image" src={TextLearning} alt='sign_learning'></Image>
                    <div className='TypeText'>문자 암기</div>
                </div>
            </Link>
        </div>
      </>
    );
  }