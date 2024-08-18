
import { useEffect, useRef, useState } from 'react';
import './App.css';

function App() {

  const [quantity, setQuantity] = useState(3);
  const [time, setTime] = useState(0);
  const [isPlay, setIsPlay] = useState(true);
  const [isTimekeeping, setIsTimekeeping] = useState(false);
  const [circles, setCircles] = useState([]);
  const [isGameOver, setIsGameOver] = useState(false)
  const canvasRef = useRef(null);

  const timeIncrement = 0.1;
  const timeInterVal = timeIncrement * 1000;

  const xCoordinateStart = 0;
  const yCoordinateStart = 0;
  const canvasHeight = 500;
  const canvasWidth = 500;
  const radiusCircles = 30;
  const lineWidth = 2;
  const startAngle = 0;
  const endAngle = Math.PI * 2;
  const backgroundBasicCircles = 'white';
  const backgroundAfterExactChoice = 'red';
  const colorBorderCircles = 'black';
  const colorNumberInCircles = 'black';
  const fontNumberInCircles = 'bold 24px Arial';
  const textAlignNumberInCircles = 'center';
  const textBaselineNumberInCircles = 'middle';
  const maxXCoordinate = canvasWidth - radiusCircles;
  const maxYCoordinate = canvasHeight - radiusCircles;
  const minXCoordinate = xCoordinateStart + radiusCircles;
  const minYCoordinate = yCoordinateStart + radiusCircles;

  useEffect(() => {
    if (isTimekeeping) {
      var timeout = setTimeout(() => {
        setTime(time + timeIncrement)
      }, timeInterVal)
    }
    return () => {
      clearTimeout(timeout);
    };
  }, [isTimekeeping, time, timeInterVal])

  const handleChange = (e) => {
    setQuantity(Number(e.target.value));
  };

  const toggle = (e) => {
    if (quantity) {
      setIsPlay(false);
      setIsTimekeeping(true);
      setTime(0);
      setCircles([]);
      setIsGameOver(false);
      handleCanvas();
    }
  };

  useEffect(() => {
    if (isTimekeeping && circles.length === 0 && quantity) {
      setIsTimekeeping(false);
      setIsGameOver(true);
    }
  }, [isTimekeeping, circles, quantity])

  const handleClick = (event) => {
    const canvas = canvasRef.current;
    const context = canvas.getContext('2d');

    const rect = canvas.getBoundingClientRect();
    const mouseX = event.clientX - rect.left;
    const mouseY = event.clientY - rect.top;

    if (circles.length && !isGameOver) {
      const distance = Math.sqrt((mouseX - circles[0].x) ** 2 + (mouseY - circles[0].y) ** 2);
      if (distance <= circles[0].radius) {
        handleAfterExactChoice({ canvas, context, isDelete: false });
      } else {
        for (let i = 1; i < circles.length; i++) {
          const distanceWrongChoice = Math.sqrt((mouseX - circles[i].x) ** 2 + (mouseY - circles[i].y) ** 2);
          if (distanceWrongChoice <= circles[i].radius) {
            setIsGameOver(true);
            setIsTimekeeping(false);
          }
        }
      }
    }
  }

  const handleAfterExactChoice = async ({ canvas, context, isDelete }) => {
    await new Promise(() => setTimeout(() => {
      context.clearRect(xCoordinateStart, yCoordinateStart, canvas.width, canvas.height);
      for (let i = circles.length - 1; i > 0; i--) {
        footballDraw({ context, number: circles[i].number, xCoordinateRandom: circles[i].x, yCoordinateRandom: circles[i].y, background: backgroundBasicCircles, saveCircles: false });
      }
      if (!isDelete) {
        footballDraw({ context, number: circles[0].number, xCoordinateRandom: circles[0].x, yCoordinateRandom: circles[0].y, background: backgroundAfterExactChoice, saveCircles: false });
        setCircles((prevItems) => prevItems.slice(1));
        handleAfterExactChoice({ canvas, context, isDelete: true });
      }
    }, 200));
  }

  const handleCanvas = () => {
    const canvas = canvasRef.current;
    const context = canvas.getContext('2d');
    context.clearRect(xCoordinateStart, yCoordinateStart, canvas.width, canvas.height);
    for (let i = quantity; i > 0; i--) {
      const xCoordinateRandom = Math.floor(Math.random() * (maxXCoordinate - minXCoordinate + 1)) + minXCoordinate;
      const yCoordinateRandom = Math.floor(Math.random() * (maxYCoordinate - minYCoordinate + 1)) + minYCoordinate;
      footballDraw({ context, number: i, xCoordinateRandom, yCoordinateRandom, background: backgroundBasicCircles, saveCircles: true });
    }
  };

  const footballDraw = ({ context, number, xCoordinateRandom, yCoordinateRandom, background, saveCircles }) => {
    context.strokeStyle = colorBorderCircles;
    context.lineWidth = lineWidth;
    context.beginPath();
    context.arc(xCoordinateRandom, yCoordinateRandom, radiusCircles, startAngle, endAngle);
    context.stroke();

    context.fillStyle = background;
    context.fill();

    context.fillStyle = colorNumberInCircles;
    context.font = fontNumberInCircles;
    context.textAlign = textAlignNumberInCircles;
    context.textBaseline = textBaselineNumberInCircles;
    context.fillText(number, xCoordinateRandom, yCoordinateRandom);

    if (saveCircles) {
      setCircles((prevItems) => [{
        number,
        x: xCoordinateRandom,
        y: yCoordinateRandom,
        radius: radiusCircles,
      }, ...prevItems]);
    }
  };

  return (
    <div className='container'>
      <form >
        {isGameOver && circles.length === 0 && quantity ? <h1 style={{ color: 'green' }}>ALL CLEARED</h1> : (isGameOver ? <h1 style={{ color: 'red' }}>GAME OVER</h1> : <h1>LET'S PLAY</h1>)}
        <div className='row'>Points: <input value={quantity} onChange={handleChange} ></input></div>
        <div className='row'>Time: <span>{time.toFixed(1)}s</span></div>
        <div className='row'>
          {isPlay ? <button type='button' onClick={toggle}>Play</button> : <button type='button' onClick={toggle}>Restart</button>}
        </div>
      </form>
      <div className='content'>
        <canvas ref={canvasRef} id="myCanvas" onClick={handleClick} height={canvasHeight} width={canvasWidth}></canvas>
      </div>
    </div>
  );
}

export default App; 