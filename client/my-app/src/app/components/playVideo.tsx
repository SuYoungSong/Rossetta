import '@/app/styles/training.css';
import WebCam from "@/app/components/webCam";
import Image from "next/image";
import React, {useEffect, useRef, useState} from 'react';
import ExitBtn from "../../../public/exit.png";
import NextBtn from "../../../public/next.svg"
import "@/app/styles/situation_num.css"

interface VideoProps {
    take: number;
    role: string;
    video?: string;
    subtitle: string;
    total_length: number;
}

interface SplitProps {
    response: VideoProps
}
const VideoPlayer: React.FC<VideoProps> = ({take, role, video, subtitle,total_length}) => {
        const videoRef = useRef<HTMLVideoElement | null>(null);
        const videourl = "http://localhost:8000/" + video
        let preVideo, prescript;
        if (video != undefined) {
            localStorage.setItem("video_real", videourl);
            localStorage.setItem("real_script", subtitle);
        }
        else{
            preVideo = localStorage.getItem("video_real");
            prescript = localStorage.getItem("real_script")
        }
        const handleLinkClick = () => {
                window.location.href = '/';
              };
        console.log(video)

    useEffect(() => {
    // 비디오가 마운트되면 자동으로 재생
        if (videoRef.current) {
            videoRef.current.play().catch(error => {
                console.error('Autoplay failed:', error);
              });
        }
      }, []);

  return (
    <>
        {video !== undefined && take != undefined && (
        <>
          <div className='section-lecture'>
            <div className='trainContainer'>
              <div className='box avatarBox'>
                <video controls className="video" src={videourl}></video>
                  <div className="whole_avatar">
                      <div className='avatar'>AI</div>
                      <div className='avatar_said'>{subtitle}</div>
                  </div>
              </div>
              <div className='box webcamBox'>
                <div className="cam_text">영상을 시청해주세요</div>
              </div>
            </div>
          </div>
        </>
      )}

      {video === undefined && take != undefined && (
        <>
          <div className='section-lecture'>
              <div className='trainContainer'>
                  <div className='box avatarBox'>
                      {prescript && (
                          <>
                              <div className="pre-text">
                                  <div className="whole_avatar">
                                      <div className="avatar">아바타의 이전 표현</div>
                                      <div className='avatar_said'>{prescript}</div>
                                  </div>
                              </div>
                              <video controls className="video" src={preVideo}></video>
                          </>
                      )}
                      {prescript == undefined && (
                              <>
                                  <div className="cam_text">수어 인식을 기다리고 있어요</div>
                              </>
                          )}
                  </div>
                  <div className="user_txt">
                      <div className='customer'>표현해야 할 내용</div>
                      <div className='answer_said'>{subtitle}</div>
                  </div>
                  <div className='box webcamBox'>
                      <WebCam/>
                  </div>
              </div>
          </div>
        </>
      )}
    </>
  )
      ;
};

export default VideoPlayer;