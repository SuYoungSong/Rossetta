import React, {useEffect} from "react";
import '@/app/styles/training.css';
import WebCam from "@/app/components/webCam";
import Image from "next/image";
import ExitBtn from "../../../public/exit.png";

interface VideoProps {
    take: number;
    role: string;
    video?: string;
    subtitle: string;
}

interface SplitProps {
    response: VideoProps
}
const VideoPlayer: React.FC<SplitProps> = ({response}) => {
    const {take, role, video, subtitle} = response
    console.log(take, role, video, subtitle)
    useEffect(() => {

    }, []);
const handleLinkClick = () => {
        window.location.href = '/';
      };

  return (
    <>
        {video !== undefined && take != undefined && (
        <>
          <div className='section-lecture'>
            <div className='trainContainer'>
              <div className='box avatarBox'>
                <video controls className="video" src={video}></video>
                <div className='avatar'>AI:</div>
                <div className='avatar_said'>{subtitle}</div>
              </div>
              <div className='box webcamBox'>
                <div>영상을 시청해주세요</div>
              </div>
            </div>
          </div>

          <div className='nextBtn' onClick={handleLinkClick}>
            <div className='next_txt'>종료</div>
            <Image src={ExitBtn} alt="next-button" className='next_image'></Image>
          </div>
        </>
      )}

      {video === undefined && take != undefined && (
        <>
          <div className='section-lecture'>
            <div className='trainContainer'>
              <div className='box avatarBox'>
                <div>답변을 기다리고 있어요</div>
                <video controls className="video" src={video}></video>
                <div className='avatar'>표현해야 할 내용</div>
                <div className='avatar_sentance'>{subtitle}</div>
              </div>
              <div className='box webcamBox'>
                <WebCam/>
              </div>
            </div>
          </div>

          <div className='nextBtn' onClick={handleLinkClick}>
            <div className='next_txt'>종료</div>
            <Image src={ExitBtn} alt="next-button" className='next_image'></Image>
          </div>
        </>
      )}
    </>
)
    ;
};

export default VideoPlayer;