import React, {useRef, useState, useCallback, useEffect} from "react";
import Webcam from "react-webcam";
import Image, { StaticImageData } from 'next/image';
import CameraImage from "../../../public/camera_3d.png"
import "@/app/styles/camera_setting.css"
import CorrectImage from "../../../public/correct_image.png"
import IncorrectImage from "../../../public/incorrect_image.png"
import idkImage from "../../../public/idknow.png"
import { css } from "@emotion/css";
import { Camera } from "@mediapipe/camera_utils";
import {HAND_CONNECTIONS, Holistic, NormalizedLandmarkList, POSE_CONNECTIONS, Results} from "@mediapipe/holistic";
import {drawCanvas} from "@/app/utils/drawCanvas";

interface CamProps {
  frame_className?: string;
}


const WebCam: React.FC<CamProps> = ({frame_className}) => {
    const [isCaptureEnable, setCaptureEnable] = useState<boolean>(false);
    const webcamRef = useRef<Webcam>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const resultsRef = useRef<Results>();

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
                if (webcamRef.current && webcamRef.current.video) {
                  await holistic.send({ image: webcamRef.current.video! });
                } else {
                    console.log('error: not connect camera')
                }
            },
            width: 640,
            height: 480,
          });
          camera.start();
        }

  }, [onResults]);


    const styles = {
      container: css`
        position: relative;
        //width: 100vw;
        //height: 100vh;
        overflow: hidden;
        display: flex;
        justify-content: center;
        align-items: center;
      `,
      canvas: css`
        //width: auto;
        //height: 55vh;
        background-color: #fff;
      `,
      buttonContainer: css`
        position: absolute;
        top: 20px;
        left: 20px;
      `
    };


  return (
    <>
        <>
            <div className={`${styles.container} ${frame_className || 'cameraFrame'}`}>
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
            </div>
        </>
    </>
  );
};

export default WebCam;