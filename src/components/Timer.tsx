import Typography from "@mui/material/Typography";
import TimerIcon from "@mui/icons-material/Timer";
import { memo, useEffect, useState } from "react";

const formatTime = (timeInSeconds: number) => {
  const minutes = Math.floor(timeInSeconds / 60);
  const seconds = timeInSeconds - minutes * 60;
  return `${minutes.toString().padStart(2, "0")}:${seconds
    .toString()
    .padStart(2, "0")}`;
};

export const Timer = memo(
  ({
    timeInMinutes,
    onTimerEnd,
  }: {
    timeInMinutes: number;
    onTimerEnd: () => void;
  }) => {
    const targetSeconds = timeInMinutes * 60;
    const [timeInSeconds, setTimeInSeconds] = useState(0);

    useEffect(() => {
      const intervalId = setInterval(() => {
        setTimeInSeconds((t) => t + 1);
      }, 1000);

      const timeotId = setTimeout(() => {
        onTimerEnd();
        clearInterval(intervalId);
      }, targetSeconds * 60 * 1000);

      return () => {
        clearInterval(intervalId);
        clearTimeout(timeotId);
      };
    }, []);

    return (
      <Typography
        variant="body1"
        display={"inline-flex"}
        alignItems={"center"}
        gap={1}
        fontWeight={"bold"}
      >
        <TimerIcon color="action" />
        {formatTime(targetSeconds - timeInSeconds)}
      </Typography>
    );
  }
);
