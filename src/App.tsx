import { useState } from 'react';
import ConfettiExplosion from 'react-confetti-explosion';

function Game() {
  return (
    <div className='w-screen h-screen flex flex-col justify-center items-center'>
      <h1 className='text-3xl font-bold mb-6'>Colored Balls Matching Game</h1>
      <GameBoard />
    </div>
  );
}

type Ball = { color: string; pos: { x: number; y: number } };
type GameData = {
  color: string;
}[][];

function GameBoard() {
  const [data, setData] = useState<GameData>(generateGame());

  const [win, setWin] = useState(false);

  function handleOnDrag(e: React.DragEvent, ball: Ball) {
    e.dataTransfer.setData('ball', JSON.stringify(ball));
  }

  function handleOnDrop(e: React.DragEvent, colIndex: number) {
    const ball: Ball | null = e.dataTransfer.getData('ball')
      ? JSON.parse(e.dataTransfer.getData('ball'))
      : null;

    if (!ball || !isBallMovable(ball) || data[colIndex].length >= 7) {
      return e.preventDefault();
    }

    // delete the ball object from the data array
    const temp_data = [...data];
    temp_data[ball.pos.x].splice(ball.pos.y, 1);

    // add the ball object to the data array
    temp_data[colIndex].unshift(ball);
    setData(temp_data);
    checkWin();
  }

  function handleOnDragOver(e: React.DragEvent) {
    e.preventDefault();
  }

  function isBallMovable(ball: Ball) {
    return ball.pos.y === 0;
  }

  function checkWin() {
    let win = data.every((col) => {
      if (col.length === 0) return true;

      return (
        col.length === 7 && col.every((ball) => ball.color === col[0].color)
      );
    });

    if (win) {
      setWin(true);
    }
  }

  function generateGame() {
    // randomize the balls accross 3 columns
    const coloredBalls: Record<string, number> = {
      red: 0,
      green: 0,
      yellow: 0,
      blue: 0,
    };

    return [
      ...Array.from({ length: 4 }, () =>
        Array.from({ length: 7 }, () => {
          let color = Object.keys(coloredBalls)[Math.floor(Math.random() * 4)];
          while (coloredBalls[color] >= 7) {
            color = Object.keys(coloredBalls)[Math.floor(Math.random() * 4)];
          }
          coloredBalls[color]++;

          return {
            color,
          };
        })
      ),
      [],
    ];
  }

  function resetGame() {
    setWin(false);
    setData(generateGame());
  }

  return (
    <>
      {win && (
        <ConfettiExplosion
          colors={['#ef4444', '#22c55e', '#eab308', '#3b82f6']}
          particleSize={15}
          particleCount={150}
          duration={2500}
        />
      )}

      <main className='grid grid-cols-5 h-[440px] gap-2 border-2 border-dashed border-black rounded-sm p-2.5'>
        {data.map((column, colIndex) => (
          <div
            key={colIndex}
            className='flex justify-end flex-col gap-1 border-r-2 border-dashed border-r-black pr-2.5 last:pr-0 last:border-r-0'
            onDrop={(e) => handleOnDrop(e, colIndex)}
            onDragOver={handleOnDragOver}
          >
            {column.map((_ball, rowIndex) => {
              const ball: Ball = {
                ..._ball,
                pos: { x: colIndex, y: rowIndex },
              };

              return (
                <div
                  data-pos={`${colIndex}-${rowIndex}`}
                  key={`${colIndex}-${rowIndex}`}
                  {...(isBallMovable(ball) && {
                    draggable: true,
                    onDragStart: (e) => {
                      handleOnDrag(e, ball);
                    },
                  })}
                >
                  <Ball movable={isBallMovable(ball)} color={ball.color} />
                </div>
              );
            })}
          </div>
        ))}
      </main>

      <button
        className='mt-6 inline-block rounded bg-blue-500 px-6 pb-2 pt-2 text-sm font-medium uppercase leading-normal text-white shadow-[0_4px_9px_-4px_#3b71ca] transition duration-150 ease-in-out hover:bg-blue-600 hover:shadow-[0_8px_9px_-4px_rgba(59,113,202,0.3),0_4px_18px_0_rgba(59,113,202,0.2)] focus:bg-blue-600 focus:shadow-[0_8px_9px_-4px_rgba(59,113,202,0.3),0_4px_18px_0_rgba(59,113,202,0.2)] focus:outline-none focus:ring-0 active:bg-blue-700 active:shadow-[0_8px_9px_-4px_rgba(59,113,202,0.3),0_4px_18px_0_rgba(59,113,202,0.2)]'
        onClick={resetGame}
      >
        Reset
      </button>
    </>
  );
}

function Ball({ color, movable }: { color: string; movable: boolean }) {
  return (
    <img
      className={`w-14 h-14 rounded-full ${
        movable ? 'cursor-pointer ' : 'cursor-not-allowed '
      }`}
      src={`/${color}_ball.png`}
      alt={color + ' ball'}
    />
  );
}

export default Game;
