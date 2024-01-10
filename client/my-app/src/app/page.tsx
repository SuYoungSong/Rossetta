"use client"
import Image from 'next/image'
import "@/app/styles/App.css";
import downside from "../../public/downside.svg";
import main_img from "../../public/main_img.png";
import area from "../../public/area.jpg";
import {useInView} from 'react-intersection-observer';
import profile from '../../public/profile2.svg';
import child from '../../public/child.png'
import { useRef, useEffect, useState } from "react";
import word_lecture from '../../public/word_lecture.png';
import signlanguage_practice from '../../public/signlanguage_practice.png'
import wrong_image from '../../public/wrong_note.jpg';
import subin_profile from '../../public/subin_profile.svg'
import woojin_profile from '../../public/woojin_profile.svg'
import hyeongho_profile from '../../public/hyeongho_profile.svg'
import yeongseong_profile from '../../public/yeongseong_profile.svg'
import hyeju_profile from '../../public/hyeju_profile.svg'
import suyeong_profile from '../../public/suyeong_profile.svg'
import jayeong_profile from '../../public/jayeong_profile.svg'
import fam from '../../public/fam.jpg';


import styles from "./style_animation.module.scss";

export default function Home() {

  const tpgRef = useRef(null);
  const spgRef = useRef(null);
  const mvbxRef = useRef(null);

  useEffect(() => {

    const tpg = tpgRef.current;
    const spg = spgRef.current;
    const mvbx = mvbxRef.current;

    const movePage = () => {
      // console.log(window.scrollY);

      const retVal = (x) => x.getBoundingClientRect().top;
      let tgpos = retVal(tpg);
      // console.log("바운딩값: ", tgpos);

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

  // 스크롤 width 조절이벤트
  const wall1 = useRef(null);
  const wall2 = useRef(null);
  const ImgWall = useRef(null);

  useEffect(() => {
    const ImgWidthControlHandler = () => {
      if (ImgWall.current) {
        let difference = window.innerHeight - ImgWall.current.getBoundingClientRect().top;

        if (difference <= 150) {
          wall1.current.style.width = `300px`;
          wall2.current.style.width = `300px`;
        } else if (difference > 150 && difference < 700) {
          let width = `${-(4 / 11) * difference + 300}px`;
          wall1.current.style.width = width;
          wall2.current.style.width = width;
        } else if (difference >= 700) {
          wall1.current.style.width = '0px';
          wall2.current.style.width = '0px';
        }
      }
    };

    window.addEventListener('scroll', ImgWidthControlHandler);

    return () => window.removeEventListener('scroll', ImgWidthControlHandler);
  }, []);

  // opacity 이벤트
  if (typeof document !== 'undefined') {
  const Content1Img = document.querySelector('.con_img')
  const Content1Text = document.querySelector('.content1_textwrap')
  const Content2Img = document.querySelector('.fam')
  const Text = document.querySelector('.textwrap h2')
  const Text2 = document.querySelector('.textwrap2')
  const windowHeight = typeof window !== 'undefined' ? window.innerHeight || document.documentElement.clientHeight || document.body.clientHeight : 0;

  const OpacityEvent = (item)=>{
    if (item) { // item이 null이 아닌 경우에만 실행
      let difference = windowHeight - item.getBoundingClientRect().top;
      if (difference > 150 && difference < item.offsetHeight + 200) {
        item.style.opacity = (difference - 150) / (item.offsetHeight + 50);
      } else if (difference > item.offsetHeight + 200) {
        item.style.opacity = 1;
      } else {
        item.style.opacity = 0;
      }
    }
  }

  const ScrollHandler = ()=>{
      OpacityEvent(Content1Img)
      OpacityEvent(Content1Text)
      OpacityEvent(Content2Img)
      OpacityEvent(Text)
      OpacityEvent(Text2)
  }

  window.addEventListener('scroll', ScrollHandler)};


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

          <div id="section1">

          </div>

          {/* 기능설명 */}
          <div className="main_form">
            <div className="form_img">
              <Image alt="" src={word_lecture}></Image>
            </div>
            <div ref={contentRef} className={`${styles.content} ${contentRefIsVisible ? styles.animatecontent : ''}`} >
              <h2>수어교육</h2>
              <h1>
                단어와 문장을 학습할 수 있어요
              </h1>
            </div>
            <div ref={contentRef} className={`${styles.content} ${contentRefIsVisible ? styles.animatecontent : ''}`}>
            </div>
          </div>
          <div className="main_form">
            <div className="form_img2">
              <Image alt="" src={signlanguage_practice}></Image>
            </div>
            <div ref={realRef} className={`${styles.real} ${realRefIsVisible ? styles.animatereal : ''}`} >
              <h2>수어실습</h2>
              <h1>
                상황을 설정하여
                <br />
                AI 챗봇과 수어로 이야기하며
                <br />
                수어실력을 향상시킬수 있어요
              </h1>
            </div>
            <div ref={realRef} className={`${styles.real} ${realRefIsVisible ? styles.animatereal : ''}`}>
            </div>
          </div>
          {/* <MainContentForth /> */}
          <div className="main_form">
            <div className="form_img">
               <Image className="wrong_img" alt="" src={wrong_image}/>
            </div>
            <div ref={onebyRef} className={`${styles.oneby} ${onebyRefIsVisible ? styles.animateoneby : ''}`} >
              <h2>오답노트</h2>
              <h1>
                수어 교육 단계에서
                <br />
                학습하며 놓쳤던 문제들을
                <br />
                다시 풀어볼수 있어요
              </h1>
            </div>
            <div ref={onebyRef} className={`${styles.oneby} ${onebyRefIsVisible ? styles.animateoneby : ''}`}>
            </div>
          </div>

          {/* 현장방문 사진 */}
          <div className="section">
            <div className="Homecontainer">
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
          
          {/* <MainContentCard /> */}
          <div className="tpg" ref={tpgRef}>
            <div className="slidePg" ref={spgRef}>
              <ul ref={mvbxRef}>
                <li><Image src={subin_profile} alt=""/>
                <div className='li-profile'></div></li>
                <li className="profilemargin">
                  <Image src={woojin_profile} alt=""/>
                <div></div></li>
                <li><Image src={hyeongho_profile} alt=""/>
                <div></div></li>
                <li className="profilemargin">
                <Image src={yeongseong_profile} alt=""/><div></div></li>
                <li><Image src={hyeju_profile} alt=""/>
                <div></div></li>
                <li className="profilemargin">
                  <Image src={suyeong_profile} alt=""/>
                <div></div></li>
                <li><Image src={jayeong_profile} alt=""/>
                <div></div></li>
              </ul>
            </div>
          </div>
          {/* <MainContentCard /> */}
        </main>
      </div>
    </>
  )
}
