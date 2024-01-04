import {useRef, useState, useCallback, useEffect} from "react";
import Webcam from "react-webcam";
import Image, { StaticImageData } from 'next/image';
import CameraImage from "../../../public/camera_3d.png"
import "@/app/styles/camera_setting.css"
import CorrectImage from "../../../public/correct_image.png"
import IncorrectImage from "../../../public/incorrect_image.png"
import idkImage from "../../../public/idknow.png"
import { css } from "@emotion/css";
import { Camera } from "@mediapipe/camera_utils";
import { Hands, Results } from "@mediapipe/hands";
import { drawCanvas } from "@/app/utils/drawCanvas";

const webCam = () => {
    const [isCaptureEnable, setCaptureEnable] = useState<boolean>(false);
    const webcamRef = useRef<Webcam>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const resultsRef = useRef<Results>();
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
    const onResults = useCallback((results: Results) => {
    resultsRef.current = results;

    // ==============================================
    // styles

    const canvasCtx = canvasRef.current!.getContext("2d")!;
    drawCanvas(canvasCtx, results);
  }, []);

    useEffect(() => {
        const hands = new Hands({
          locateFile: (file) => {
            return `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`;
          },
        });

        hands.setOptions({
          maxNumHands: 2,
          modelComplexity: 1,
          minDetectionConfidence: 0.5,
          minTrackingConfidence: 0.5,
        });

        hands.onResults(onResults);

        if (
          typeof webcamRef.current !== "undefined" &&
          webcamRef.current !== null
        ) {
          const camera = new Camera(webcamRef.current.video!, {
            onFrame: async () => {
              await hands.send({ image: webcamRef.current!.video! });
            },
            width: 1280,
            height: 720,
          });
          camera.start();
        }
  }, [onResults]);

  /*  랜드마크들의 좌표를 콘솔에 출력 */
  const OutputData = () => {
    const results = resultsRef.current!;
    console.log(results.multiHandLandmarks);
  };

  const styles = {
      container: css`
        position: relative;
        width: 100vw;
        height: 100vh;
        overflow: hidden;
        display: flex;
        justify-content: center;
        align-items: center;
      `,
      canvas: css`
        width: auto;
        height: 55vh;
        background-color: #fff;
      `,
      buttonContainer: css`
        position: absolute;
        top: 20px;
        left: 20px;
      `,
      button: css`
        color: #fff;
        background-color: #0082cf;
        font-size: 1rem;
        border: none;
        border-radius: 5px;
        padding: 10px 10px;
        cursor: pointer;
      `,
    };

  return (
    <>
      {/*{isCaptureEnable || (*/}
      {/*  <>*/}
      {/*      <p className="camera_plz">수어 인식을 위한 카메라가 필요해요 📷🙏</p>*/}
      {/*      <div className="camera_right" onClick={() => setCaptureEnable(true)}>*/}
      {/*          <Image className="camera_image" src={CameraImage} alt="camera_img"></Image>*/}
      {/*          <div className="camera_text">카메라 허용하러 가기</div>*/}
      {/*      </div>*/}
      {/*  </>*/}
      {/*)}*/}
      {/*{isCaptureEnable && (*/}
        <><div className="whole_camera">
            <div className="cameraFrame {styles.container}">
                <Webcam
                    audio={false}
                    width={1280}
                    height={720}
                    ref={webcamRef}
                    screenshotFormat="image/jpeg"
                    videoConstraints={{width: 1280, height: 720, facingMode: "user"}}
                    className="real_cameara"
                    style={{objectFit: "cover"}}
                />
                <canvas
                    ref={canvasRef}
                    className={styles.canvas}
                    width={1280}
                    height={720}
                />
                {/* 좌표 출력 */}
                <div className={styles.buttonContainer}>
                    <button className={styles.button} onClick={OutputData}>
                        Output Data
                    </button>
                </div>
            </div>
            <div className="answer_btn">
                <div className="question">
                    <div className="quest-text">단어</div>
                </div>
                <div className="check" style={{backgroundColor: getAnswers.color}}>
                    <div className="answer_text">{getAnswers.text}</div>
                    <Image className="answer_img" src={getAnswers.image} alt="answer_img"></Image>
                </div>
            </div>
        </div>
        </>
      {/*)}*/}
    </>
  );
};

export default webCam;