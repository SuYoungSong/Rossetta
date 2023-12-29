"use client";

import { useRef, useEffect,useState } from "react";
import { Chart } from "chart.js/auto";

export default function DoughnutChart() {
  const chartRef = useRef(null);
  const [chartData, setChartData] = useState({ correct: 0, incorrect: 0 });

  useEffect(() => {
    if (chartRef.current) {
      if (chartRef.current.chart) {
        chartRef.current.chart.destroy();
      }

      const context = chartRef.current.getContext("2d");

      const newChart = new Chart(context, {
        type: "doughnut",
        data: {
          labels: ["맞은문제","틀린문제"],
          datasets: [
            {
              label: "Info",
              data: [chartData.correct, chartData.incorrect],
              backgroundColor: [
                "rgba(44, 133, 141, 0.8)",
                "rgba(235, 235, 235, 1)",
              ],
              borderColor: [
                "rgba(44, 144, 141, 0.8)",
                "rgba(235, 235, 235, 1)",
              ],
              borderWidth: 0.3,
              borderRadius: 50,
            },
          ],
        },
        options: {
          

          // 도넛 가운데 공간 뚫어주는 옵션
          cutout: '80%',
          plugins: {
            legend: {
              display: false,
            }
          },
          // 그래프 처음 나올때 애니메이션
          animation: {
            animateRotate:true,
            animateScale:true,
          },
          // 그림자설정옵션
          elements: {
            arc: {
              shadowColor: 'rgba(0, 0, 0, 0.8)',
              shadowBlur: 10,
              shadowOffset: 10,
              shadowOffset: 10,
            }
          },

        },
      });

      chartRef.current.chart = newChart;
    }
  }, [chartData]);


  // 임시로 챕터 데이터를 업데이트하는 함수
  const updateChartData = () => {
    // 실제로는 서버에서 데이터를 받아 state를 업데이트해야함
    setChartData({ correct: 6, incorrect: 4 });
  };

    // 컴포넌트가 마운트될 때 초기 데이터를 불러오도록 설정
    useEffect(() => {
      updateChartData();
    }, []);



  return (
    <div style={{ position: "relative", width: "8vw", height: "8vw" }}>

      {/* 도넛가운데 글자 설정 */}
      <div className="chartText" style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%, -50%)", textAlign: "center", color: "black", }}>
      {`${chartData.correct}/${chartData.correct + chartData.incorrect}`}
      </div>

      <canvas ref={chartRef} />
    </div>
  );
}

