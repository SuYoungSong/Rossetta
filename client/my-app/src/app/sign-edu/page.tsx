import Link from 'next/link';
import { useState } from 'react';
import dynamic from 'next/dynamic';
import "./sign_edu.css"

export default function Edu(){
  return(
    <>
      <div className='top_title'>수어교육</div>
      <div className='top_hr'></div>
      <div className="e_btn_all">
        <Link href="/sign-edu/jimunja">
          <div className="edu_btn">
            <div className="edu_pic"><img src="../jinumber.jpg" alt="지숫자"/></div>
            <div className="edu_btn_txt">지숫자</div>
          </div>
        </Link>
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