import React, { useRef, useEffect, useState } from "react";
// @ts-ignore
import { Chart } from "chart.js/auto";

interface CorrectProps {
  allCount: number;
  correct: number;
}

const WrongChapters: React.FC<CorrectProps> = ({ allCount, correct }) => {
  const chartRef = useRef<HTMLCanvasElement | null>(null);
  const [chartData, setChartData] = useState({ correct: 0, total: 0 });

  useEffect(() => {
    if (chartRef.current) {
      if (chartRef.current.chart) {
        chartRef.current.chart.destroy();
      }

      const context = chartRef.current.getContext("2d");

      const newChart = new Chart(context, {
        type: "doughnut",
        data: {
          labels: ["맞은문제", "틀린문제"],
          datasets: [
            {
              label: "Info",
              data: [chartData.correct, chartData.total - chartData.correct],
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
          cutout: "80%",
          plugins: {
            legend: {
              display: false,
            },
            tooltip: {
              // Disable the on-canvas tooltip
              enabled: false,
              external: function (context) {
                // Tooltip Element
                let tooltipEl = document.getElementById('chartjs-tooltip');

                // Create element on first render
                if (!tooltipEl) {
                  tooltipEl = document.createElement('div');
                  tooltipEl.id = 'chartjs-tooltip';
                  tooltipEl.innerHTML = '<table></table>';
                  document.body.appendChild(tooltipEl);
                }
              }
            },
          },
          animation: {
            animateRotate: true,
            animateScale: true,
          },
          elements: {
            arc: {
              shadowColor: "rgba(0, 0, 0, 0.8)",
              shadowBlur: 10,
              shadowOffset: 10,
            },
          },
        },
      });

      // @ts-ignore
      chartRef.current.chart = newChart;
    }
  }, [chartData]);

  useEffect(() => {
    setChartData({ correct: correct, total: allCount });
  }, []);

  return (
    <div style={{ position: "relative", width: "6vw", height: "6vw" }}>
      <div
        className="chartText"
        style={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          textAlign: "center",
          color: "black",
        }}
      >
        {`${chartData.correct}/${chartData.total}`}
      </div>
      <canvas ref={chartRef} />
    </div>
  );
};

export default WrongChapters;