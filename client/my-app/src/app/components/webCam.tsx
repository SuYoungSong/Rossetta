import { useRef, useState, useCallback } from "react";
import Webcam from "react-webcam";
import Image, { StaticImageData } from 'next/image';
import CameraImage from "../../../public/camera_3d.png"
import "@/app/styles/camera_setting.css"
import CorrectImage from "../../../public/correct_image.png"
import IncorrectImage from "../../../public/incorrect_image.png"
import idkImage from "../../../public/idknow.png"

const videoConstraints = {
  width: 900,
  height: 800,
  facingMode: "user",
};

const webCam = () => {
    const [isCaptureEnable, setCaptureEnable] = useState<boolean>(false);
    const webcamRef = useRef<Webcam>(null);
    const [url, setUrl] = useState<string | null>(null);
    const isAnswerCorrect = false
    const getAnswer = () => {
        if (isAnswerCorrect === null) {
            return { text: '모르겠어요', color: '#FFE6B5', image: idkImage};
            } else if (isAnswerCorrect) {
            return { text: '정답', color: '#D0E8FF', image: CorrectImage};
            } else {
            return { text: '오답', color: '#FFC7C7', image: IncorrectImage};
            }
    };

    const getAnswers = getAnswer();
  return (
    <>
      {isCaptureEnable || (
        <>
            <p className="camera_plz">수어 인식을 위한 카메라가 필요해요 📷🙏</p>
            <div className="camera_right" onClick={() => setCaptureEnable(true)}>
                <Image className="camera_image" src={CameraImage} alt="camera_img"></Image>
                <div className="camera_text">카메라 허용하러 가기</div>
            </div>
        </>
      )}
      {isCaptureEnable && (
        <><div className="whole_camera">
            <div className="cameraFrame">
                <Webcam
                audio={false}
                width="100%"
                height="100%"
                //   ref={webcamRef}
                //   screenshotFormat="image/jpeg"
                videoConstraints={videoConstraints}
                className="real_cameara"
                style={{objectFit:"cover"}}
                />
            </div>
            <div className="answer_btn">
                <div className="question"><div className="quest-text">단어</div></div>
                <div className="check" style={{backgroundColor: getAnswers.color}}>
                    <div className="answer_text">{getAnswers.text}</div>
                    <Image className="answer_img" src={getAnswers.image} alt="answer_img"></Image>
                </div>
            </div>
            {/* <button onClick={capture}>capture</button> */}
        </div>
        </>
      )}
    </>
  );
};

export default webCam;