"use client"
import Image from 'next/image'
import "@/app/styles/App.css";
import downside from "../../public/downside.svg";
import main_img from "../../public/main_img.png";
import area from "../../public/area.jpg";
import {useInView} from 'react-intersection-observer';
import profile from '../../public/profile.svg';
import { useRef, useEffect, useState } from "react";

import styles from "./style_animation.module.scss";

export default function Home() {

  const tpgRef = useRef(null);
  const spgRef = useRef(null);
  const mvbxRef = useRef(null);

  useEffect(() => {
    console.log('로딩완료');

    const tpg = tpgRef.current;
    const spg = spgRef.current;
    const mvbx = mvbxRef.current;

    const movePage = () => {
      console.log(window.scrollY);

      const retVal = (x) => x.getBoundingClientRect().top;
      let tgpos = retVal(tpg);
      console.log("바운딩값: ", tgpos);

      // 적용구간 설정 0이하 -2000px 이상
      if (tgpos <= 0 && tgpos >= -3600) mvbx.style.left = tgpos + "px";
      else if (tgpos > 0) mvbx.style.left = '0';
    };
  
      // 스크롤 이벤트 리스너 등록
      window.addEventListener("scroll", movePage);
  
      // 컴포넌트가 언마운트될 때 이벤트 리스너를 제거
      return () => {
        window.removeEventListener("scroll", movePage);
      };
    }, [tpgRef, spgRef, mvbxRef]);

  // 타이틀 글자 천천히
  const [isVisible, setIsVisible] = useState(false)
  useEffect(()=> {
    const TimeoutId = setTimeout(()=> {
      setIsVisible(true);
    }, 1000)
    return ()=> clearTimeout(TimeoutId)
  }, [])
  // 

  // 페이지 이동버튼
  const handleScroll = (elementId) => {
    const element = document.getElementById(elementId);

    if (element) {
      element.scrollIntoView({
        behavior: 'smooth', // 부드러운 스크롤을 위한 옵션
        block: 'start',     // 시작 지점에 스크롤
      });
    }
  };
  // 

  
  // const { ref: myRef, inView: myElementIsVisible } = useInView();
  const { ref: magicSectionRef, inView: magicSectionIsVisible } = useInView();
  const { ref: eduRef, inView: eduRefIsVisible } = useInView();
  const { ref: contentRef, inView: contentRefIsVisible } = useInView();
  const { ref: realRef, inView: realRefIsVisible } = useInView();
  const { ref: onebyRef, inView: onebyRefIsVisible } = useInView();
 

  return (
    <>
      <div className="App">
        <main>
          {/* 메인이미지 */}
          {/* <MainContentFirst /> */}
          <section>
            <div>
              <div className="main_img-div" >
                <Image alt="" src={main_img} className="main_img"/>
                <div className={`myText ${isVisible ? 'show' : ''}`}>
                  <h1 >
                    모든 청각장애인들을 위한
                    <br />
                    AI기반 교육 서비스
                  </h1>
                </div>
                <div className="downside_icon-div">
                  <a onClick={() => handleScroll('section1')}>
                    <Image alt="" src={downside} className="downside_icon" />
                  </a>
                </div>
              </div>
            </div>
          </section>
          {/* <MainContentFirst /> */}
          <div id="section1">
            <div className="div-text">
              청각장애인의 약 90%가 수어를 모른다는것을 알고 계셨나요??<br/>
              후천적 청각장애인들은 한순간에 소통의 수단을 잃었습니다.
            </div>
          </div>
          {/* <MainContentSecond /> */}

          {/* 현장방문 사진 */}
          <div className="section">
            <div className="Honecontainer">
              <div className="Homeinner-container">
                
                <div ref={eduRef} className={`${styles.areadiv} ${eduRefIsVisible ? styles.animateareadiv : ''}`}>
                  <Image className="area" src={area} alt="현장사진"/>
                </div>

                <div className="text-container">
                  <div className="div-text">
                  문제를 현장에서 경험하시는분과 인터뷰를통해 <br/>적합한 서비스를 만들고자 노력했습니다.
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* 기능설명 */}
          <div className="main_form">
            <div className="form_img"></div>
            <div ref={contentRef} className={`${styles.content} ${contentRefIsVisible ? styles.animatecontent : ''}`} >
              <h2>수어교육</h2>
              <h1>
                지문자, 지숫자와
                <br />
                단어, 문장을 학습할 수 있어요
              </h1>
            </div>
            <div ref={contentRef} className={`${styles.content} ${contentRefIsVisible ? styles.animatecontent : ''}`}>
                <h1>수어교육</h1>
            </div>
          </div>
          {/* <MainContentSecond /> */}

          {/* <MainContentThird /> */}
          {/* <section ref={magicSectionRef}>
            
            <span className={`${styles.rocket} ${magicSectionIsVisible ? styles.animateRocket : ''}`}>
            🚀
            </span>
          
          </section> */}
          {/* <MainContentThird /> */}

          {/* <MainContentForth /> */}
          <div className="main_form">
            <div className="form_img"></div>
            <div ref={realRef} className={`${styles.real} ${realRefIsVisible ? styles.animatereal : ''}`} >
              <h2>수어교육</h2>
              <h1>
                지문자, 지숫자와
                <br />
                단어, 문장을 학습할 수 있어요
              </h1>
            </div>
            <div ref={realRef} className={`${styles.real} ${realRefIsVisible ? styles.animatereal : ''}`}>
                <h1>수어교육</h1>
            </div>
          </div>
          {/* <MainContentForth /> */}
          <div className="main_form">
            <div className="form_img"></div>
            <div ref={onebyRef} className={`${styles.oneby} ${onebyRefIsVisible ? styles.animateoneby : ''}`} >
              <h2>수어교육</h2>
              <h1>
                지문자, 지숫자와
                <br />
                단어, 문장을 학습할 수 있어요
              </h1>
            </div>
            <div ref={onebyRef} className={`${styles.oneby} ${onebyRefIsVisible ? styles.animateoneby : ''}`}>
                <h1>수어교육</h1>
            </div>
          </div>
          {/* <MainContentCard /> */}
          <div className="tpg" ref={tpgRef}>
            <div className="slidePg" ref={spgRef}>
              <ul ref={mvbxRef}>
                <li><Image src={profile} alt=""/></li>
                <li className="profilemargin"><Image src={profile} alt=""/></li>
                <li><Image src={profile} alt=""/></li>
                <li className="profilemargin"><Image src={profile} alt=""/></li>
                <li><Image src={profile} alt=""/></li>
                <li className="profilemargin"><Image src={profile} alt=""/></li>
                <li><Image src={profile} alt=""/></li>
                <li className="profilemargin"><Image src={profile} alt=""/></li>
              </ul>
            </div>
          </div>
          {/* <MainContentCard /> */}
        </main>

        {/* <Footer /> */}
        <footer>
          <div>KT_aivle_bigproject</div>
          <div>
            
              <h1>한혜주 github</h1>
              <h1>이자영 github</h1>
              <h1>전우진 github</h1>
              <h1>이수빈 github</h1>
              <h1>김형진 github</h1>
              <h1>송수영 github</h1>
              <h1>천영성 github</h1>
              <h1>설형호 github</h1>
            
          </div>
        </footer>
        {/* <Footer /> */}
      </div>
    </>
  )
}
