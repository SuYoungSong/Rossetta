import { drawConnectors, drawLandmarks } from "@mediapipe/drawing_utils";
import {HAND_CONNECTIONS, POSE_CONNECTIONS, Results} from "@mediapipe/holistic";

export const drawCanvas = (ctx: CanvasRenderingContext2D, results: Results) => {
  const width = ctx.canvas.width;
  const height = ctx.canvas.height;

  ctx.save();
  ctx.clearRect(0, 0, width, height);
  // canvas의 좌우 반전
  ctx.scale(-1, 1);
  ctx.translate(-width, 0);
  // capture image 그리기
  ctx.drawImage(results.image, 0, 0, width, height);
  // 손의 묘사
  if (results.leftHandLandmarks) {
    // 골격 묘사
    for (const landmarks of results.leftHandLandmarks) {
      drawConnectors(ctx, results.poseLandmarks, POSE_CONNECTIONS,
                 {color: '#00FF00', lineWidth: 4});
      drawLandmarks(ctx, results.poseLandmarks,
                {color: '#FF0000', lineWidth: 2});
      drawConnectors(ctx, results.leftHandLandmarks, HAND_CONNECTIONS,
                 {color: '#CC0000', lineWidth: 5});
      drawLandmarks(ctx, results.leftHandLandmarks,
                    {color: '#00FF00', lineWidth: 2});
      drawConnectors(ctx, results.rightHandLandmarks, HAND_CONNECTIONS,
                     {color: '#00CC00', lineWidth: 5});
      drawLandmarks(ctx, results.rightHandLandmarks,
                    {color: '#FF0000', lineWidth: 2});
        }
  }
  ctx.restore();
};