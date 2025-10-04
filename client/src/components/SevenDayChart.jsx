import React from "react";
import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

export const SevenDayChart = ({ historyData = [], data = [] }) => {
  // historyData[7] = data[0];
  // console.log(historyData);
  const labels = [
    // lịch sử (7 ngày)
    // ...historyData.map((_, i) => {
    //   const date = new Date();
    //   date.setDate(date.getDate() - (historyData.length - i - 1));
    //   return date.toLocaleDateString("vi-VN", {
    //     weekday: "short",
    //     day: "numeric",
    //     month: "numeric",
    //   });
    // }),

    ...data.slice(1).map((_, i) => {
      const date = new Date();
      date.setDate(date.getDate() + i + 1);
      return date.toLocaleDateString("vi-VN", {
        weekday: "short",
        day: "numeric",
        month: "numeric",
      });
    }),
  ];

  const chartData = {
    labels,
    datasets: [
      historyData.length > 0 && {
        data: historyData,
        borderColor: "rgba(192,75,192,1)",
        backgroundColor: "rgba(192,75,192,0.2)",
        tension: 0.3,
      },
      data.length > 0 && {
        data: Array(historyData.length).fill(null).concat(data),
        borderColor: "rgba(75,192,192,1)",
        backgroundColor: "rgba(75,192,192,0.2)",
        tension: 0.3,
      },
    ].filter(Boolean),
  };

  const options = {
    responsive: true,
    plugins: {
      legend: {
        display: false,
      },
      title: {
        display: false,
      },
    },
    scales: {
      x: {
        grid: {
          display: false,
          drawTicks: false,
        },
      },
      y: {
        grid: {
          display: false,
          drawTicks: false,
        },
      },
    },
  };

  return <Line data={chartData} options={options} />;
};
