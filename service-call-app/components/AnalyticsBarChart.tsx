"use client";

import { useEffect, useRef } from "react";
import Chart from "chart.js/auto";

interface AnalyticsBarChartProps {
  data: { [key: string]: number };
  label: string;
  backgroundColor: string;
  borderColor: string;
}

export default function AnalyticsBarChart({
  data,
  label,
  backgroundColor,
  borderColor,
}: AnalyticsBarChartProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const chartInstance = useRef<Chart | null>(null);

  useEffect(() => {
    if (!canvasRef.current || Object.keys(data).length === 0) return;

    if (chartInstance.current) {
      chartInstance.current.destroy();
    }

    chartInstance.current = new Chart(canvasRef.current, {
      type: "bar",
      data: {
        labels: Object.keys(data),
        datasets: [
          {
            label,
            data: Object.values(data),
            backgroundColor,
            borderColor,
            borderWidth: 1,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          x: {
            ticks: {
              autoSkip: true,
              maxTicksLimit: 8,
              maxRotation: 45,
              minRotation: 0,
              font: { size: 11 },
            },
          },
          y: {
            beginAtZero: true,
            ticks: { stepSize: 1 },
          },
        },
        plugins: {
          legend: { display: false },
          tooltip: {
            backgroundColor: "rgba(0, 0, 0, 0.8)",
            titleColor: "white",
            bodyColor: "white",
          },
        },
      },
    });

    return () => {
      if (chartInstance.current) {
        chartInstance.current.destroy();
      }
    };
  }, [data, label, backgroundColor, borderColor]);

  return <canvas ref={canvasRef} className="w-full h-full" />;
}
