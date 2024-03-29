import Link from 'next/link';
import dynamic from 'next/dynamic';
import '@/app/styles/sign_edu.css';

export default function Edu() {
  return(
    <>
      <div className='top_title'>수어교육</div>
      <div className='top_hr'></div>
      <div className="e_btn_all">
        <Link href="/sign-edu/word">
          <div className="edu_btn g_btn">
            <div className="edu_pic"><img src="../word.jpg" alt="단어"/></div>
            <div className="edu_btn_txt">단어</div>
          </div>
        </Link>
        <Link href="/sign-edu/sentence">
          <div className="edu_btn b_btn">
            <div className="edu_pic"><img src="../sentence.jpg" alt="문장"/></div>
            <div className="edu_btn_txt">문장</div>
          </div>
        </Link>
      </div>
    </>
  );
}
