import Link from 'next/link';
import dynamic from 'next/dynamic';
import '@/app/styles/sign_edu.css';

export default function WrongNote(){
  return(
    <>
      <div className='top_title'>오답노트</div>
      <div className='top_hr'></div>
      <div className="e_btn_all">
        <Link href="/wrong_note/word">
          <div className="edu_btn g_btn">
            <div className="edu_pic"><img src="../word.jpg" alt="단어"/></div>
            <div className="edu_btn_txt">단어</div>
          </div>
        </Link>
        <Link href="/wrong_note/sentence">
          <div className="edu_btn b_btn">
            <div className="edu_pic"><img src="../sentence.jpg" alt="문장"/></div>
            <div className="edu_btn_txt">문장</div>
          </div>
        </Link>
      </div>
    </>
  );
}
