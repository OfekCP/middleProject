import React, { useState, useEffect } from 'react';

function Stopwatch() {
  const [isRunning, setIsRunning] = useState(false);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [totalTimeWorked, setTotalTimeWorked] = useState(0); // New state for total time worked
  const [hours, setHours] = useState(0);
  const [minutes, setMinutes] = useState(0);
  const [seconds, setSeconds] = useState(0);
  const [intervalId, setIntervalId] = useState(null);

  function start() {
    if (!isRunning) {
      setIsRunning(true);
      const id = setInterval(() => {
        setElapsedTime((prevTime) => prevTime + 1);
      }, 1000);
      setIntervalId(id);
    }
  }

  function stop() {
    if (isRunning) {
      setIsRunning(false);
      clearInterval(intervalId);
    }
  }

  function reset() {
    setIsRunning(false);
    clearInterval(intervalId);

    // Add the elapsed time to the total time worked only when resetting
    if (elapsedTime > 0) {
      setTotalTimeWorked((prevTotal) => prevTotal + elapsedTime);
    }

    // Reset elapsed time to 0
    setElapsedTime(0);

    // Reset hours, minutes, and seconds to 0
    setHours(0);
    setMinutes(0);
    setSeconds(0);
  }

  useEffect(() => {
    if (isRunning) {
      // Calculate hours, minutes, and seconds
      const h = Math.floor(elapsedTime / 3600);
      const m = Math.floor((elapsedTime % 3600) / 60);
      const s = elapsedTime % 60;
      setHours(h);
      setMinutes(m);
      setSeconds(s);
    }
  }, [elapsedTime, isRunning]);

  useEffect(() => {
    return () => {
      clearInterval(intervalId);
    };
  }, [intervalId]);

  return (
    <div className="stopwatch-container">
      <p>
        Time: {hours}:{minutes.toString().padStart(2, '0')}:{seconds.toString().padStart(2, '0')}
      </p>
      <p>Total: {Math.floor(totalTimeWorked / 3600)}:{Math.floor((totalTimeWorked % 3600) / 60)}:{totalTimeWorked % 60} seconds</p>

      <button onClick={start}>Start</button>
      <button onClick={stop}>Stop</button>
      <button onClick={reset}>Restart</button>
    </div>
  );
}

export default Stopwatch;
