import {useRef, useState, useCallback, useEffect} from "react";
import Webcam from "react-webcam";
import CameraImage from "../../../public/camera_3d.png"
import "@/app/styles/camera_setting.css"
import { css } from "@emotion/css";
import { Camera } from "@mediapipe/camera_utils";
import {HAND_CONNECTIONS, Holistic, POSE_CONNECTIONS, Results} from "@mediapipe/holistic";
import {drawCanvas} from "@/app/utils/drawCanvas";

const WebCam = () => {
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

    const canvasCtx = canvasRef.current!.getContext("2d")!;
    drawCanvas(canvasCtx, results);
  }, []);

    useEffect(() => {
        const holistic = new Holistic({
          locateFile: (file) => {
            return `https://cdn.jsdelivr.net/npm/@mediapipe/holistic/${file}`;
          },
        });

        holistic.setOptions({
            modelComplexity: 1,
            enableSegmentation: true,
            smoothSegmentation: true,
            minTrackingConfidence: 0.5,
            minDetectionConfidence: 0.5
        });
        holistic.onResults(onResults);

        if (
          typeof webcamRef.current !== "undefined" &&
          webcamRef.current !== null
        ) {
          const camera = new Camera(webcamRef.current.video!, {
            onFrame: async () => {
              await holistic.send({ image: webcamRef.current!.video! });
            },
            width: 640,
            height: 480,
          });
          camera.start();
        }
        const intervalId = setInterval(() => {
          const result = resultsRef.current;

          if (result && result.poseLandmarks && (result.leftHandLandmarks || result.rightHandLandmarks)) {
            OutputData();
          }
        }, 100); // 1초에 10번 불러옴

        return () => {
          clearInterval(intervalId);
        };
  }, [onResults]);

  /*  랜드마크들의 좌표를 콘솔에 출력 */
  const OutputData = () => {
    const results = resultsRef.current!;
    console.log({"poseLandmarks":results.poseLandmarks, "leftHandLandmarks":results.leftHandLandmarks, "rightHandLandmarks":results.rightHandLandmarks});
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
          margin-top: 50vw;
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
                    width={640}
                    height={480}
                    ref={webcamRef}
                    screenshotFormat="image/jpeg"
                    videoConstraints={{width: 640, height: 480, facingMode: "user"}}
                    className="real_cameara"
                    style={{objectFit: "cover"}}
                />
                <canvas
                    ref={canvasRef}
                    className={styles.canvas}
                    width={640}
                    height={480}
                />
                {/* 좌표 출력 */}
                <div className={styles.buttonContainer}>
                    <button className={styles.button} onClick={OutputData}>
                        Output Data
                    </button>
                </div>
            </div>
        </div>
        </>
    </>
  );
};

export default WebCam;