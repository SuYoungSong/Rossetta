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
import fam from '../../public/fam.jpg';


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

  // 스크롤 width 조절이벤트
  const wall1 = useRef(null);
  const wall2 = useRef(null);
  const ImgWall = useRef(null);

  useEffect(() => {
    const ImgWidthControlHandler = () => {
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
          {/* <MainContentFirst /> */}
          <div id="section1">
            <div className="div-text">
              청각장애인의 약 90%가 수어를 모른다는것을 알고 계셨나요??<br/>
              후천적 청각장애인들은 한순간에 소통의 수단을 잃었습니다.
            </div>
          </div>
          <div className="content2" >
                      <div className="content2_item" >
                        <p>2016년 한국수화언어법 제정 <br/>
                        &quot;국가와 지방 자치 단체는 농인등의 가족을 위한 한국수어 교육, 상담 및 관련 서비스등 지원체계를 마련하여야한다.&quot;<br/>
                        그러나 현재 국가에서 운영하는 수어교육원은 성인을 대상으로 전국에 단 네곳뿐입니다.
                        </p>
                      </div>
          </div>
          {/* <MainContentSecond /> */}
          
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

          {/* 기능설명 */}
          <div className="main_form">
            <div className="form_img"></div>
            <div ref={contentRef} className={`${styles.content} ${contentRefIsVisible ? styles.animatecontent : ''}`} >
              <h2>수어교육</h2>
              <h1>
                단어와 문장을 학습할 수 있어요
              </h1>
            </div>
            <div ref={contentRef} className={`${styles.content} ${contentRefIsVisible ? styles.animatecontent : ''}`}>
                <a className='a_button' href='/'>수어교육</a>
            </div>
          </div>
          <div className="main_form">
            <div className="form_img"></div>
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
                <a className='a_button' href='/'>
                  수어실습</a>
            </div>
          </div>
          {/* <MainContentForth /> */}
          <div className="main_form">
            <div className="form_img"></div>
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
                <a className='a_button' href='/'>오답노트</a>
            </div>
          </div>
          <section className="Img_wrap">
            <div className="Img_container">
                <div className="Img_wallpaper" ref={ImgWall}>
                    <h1>소리가 없어도<br/> 마음을 전할수 있어요</h1>
                    <div className="Img_wallpaper_wall">
                        <div className="Img_wall" ref={wall1}></div>
                        <div className="Img_wall" ref={wall2}></div>
                    </div>
                </div>
            </div>
        </section>
        <div className='main_form'>
        <div className="container_inner">
                    <div className="content1">
                      <h1>수어로<br/>세상을 열다.</h1></div>
                      <Image src={child} alt="girl" className='con_img'></Image>
                      <div className="content1_textwrap" >
                          <h2>KODA <span>우리의 미래, 아이들을 위해</span></h2>
                          <p >청각장애인 부모를둔 비장애인 아이들을 KODA라고 해요.
                            <br/>현재 KODA를 위한 수어 공식 교육기관은 단 한곳도 없어요.
                          </p>
                    </div>
                    
                   
                    <div className="textwrap">
                        <h2 >수어<br/>
                        <span>학습부터 소통까지<br/>
                        벽을 허무는 여정</span></h2>
                      <div className='imgbox'><Image src={fam} alt='' className='fam'></Image></div>
                      
                    </div>

                    <div className="content3">
                        <div className="textwrap2">
                            <h2>마음을 전하는 수어<br/> <span>꾸준히 배우고 연습해보세요</span></h2>
                            <p>말이 없어도, 소리가 없어도 마음은 전해집니다.<br/>
                                수어 학습부터, 소통까지, 수어를 통해 새로운 세상으로<br/>
                                손의 말로 청각장애인과의 소통의 벽을 허무는 여정에 함께하세요. </p>
                        </div>
                    </div>
                </div>
              </div>
          {/* <MainContentCard /> */}
          <div className="tpg" ref={tpgRef}>
            <div className="slidePg" ref={spgRef}>
              <ul ref={mvbxRef}>
                <li><Image src={profile} alt=""/>
                <div className='li-profile'>github</div></li>
                <li className="profilemargin"><Image src={profile} alt=""/>
                <div>github</div></li>
                <li><Image src={profile} alt=""/>
                <div>github:</div></li>
                <li className="profilemargin">
                <Image src={profile} alt=""/><div>github</div></li>
                <li><Image src={profile} alt=""/>
                <div>github</div></li>
                <li className="profilemargin"><Image src={profile} alt=""/>
                <div>github</div></li>
                <li><Image src={profile} alt=""/>
                <div>github</div></li>
                <li className="profilemargin"><Image src={profile} alt=""/>
                <div>github</div></li>
              </ul>
            </div>
          </div>
          {/* <MainContentCard /> */}
        </main>
      </div>
    </>
  )
}
