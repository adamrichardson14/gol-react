"use client";

import { useEffect, useRef, useState } from "react";

const WIDTH = 800;
const HEIGHT = 800;
const CELL_SIZE = 10;
const NUM_ROWS = Math.floor(WIDTH / CELL_SIZE);
const NUM_COLS = Math.floor(HEIGHT / CELL_SIZE);

const colors = ["black", "white"];

type Board = number[][];
function createBoard(): Board {
  return Array.from({ length: NUM_ROWS }, () => new Array(NUM_ROWS).fill(0));
}
export default function Home() {
  const initialBoard = createBoard();
  const [boardState, setBoardState] = useState<Board>(initialBoard);
  const [isPlaying, setIsPlaying] = useState(false);
  const canvasRef = useRef<null | HTMLCanvasElement>(null);

  useEffect(() => {
    if (!isPlaying) {
      return;
    }
    const interval = setInterval(computeNextBoardSeeds, 100);
    return () => clearInterval(interval);
  }, [isPlaying, computeNextBoardSeeds]);

  useEffect(() => {
    if (canvasRef.current) {
      const ctx = canvasRef.current.getContext("2d");
      if (!ctx) return;

      ctx.clearRect(0, 0, WIDTH, HEIGHT);
      ctx.strokeStyle = "gray";
      ctx.lineWidth = 0.1;

      for (let r = 0; r < NUM_ROWS; ++r) {
        for (let c = 0; c < NUM_COLS; ++c) {
          ctx.fillStyle = colors[boardState[r][c]];

          ctx.fillRect(
            Math.floor((WIDTH / NUM_ROWS) * r),
            Math.floor((HEIGHT / NUM_COLS) * c),
            CELL_SIZE,
            CELL_SIZE
          );

          ctx.strokeRect(
            Math.floor((WIDTH / NUM_ROWS) * r),
            Math.floor((HEIGHT / NUM_COLS) * c),
            CELL_SIZE,
            CELL_SIZE
          );
        }
      }
    }
  }, [boardState, canvasRef]);

  function countNbors(r0: number, c0: number) {
    let count = 0;
    for (let dr = -1; dr <= 1; ++dr) {
      for (let dc = -1; dc <= 1; ++dc) {
        if (dr != 0 || dc != 0) {
          const r = (r0 + dr + NUM_ROWS) % NUM_ROWS;
          const c = (c0 + dc + NUM_COLS) % NUM_COLS;

          if (boardState[r][c] === 1) {
            ++count;
          }
        }
      }
    }
    return count;
  }

  function computeNextBoardGol() {
    setBoardState((prevBoardState) => {
      let newBoard = prevBoardState.map((row) => [...row]);

      for (let r = 0; r < NUM_ROWS; ++r) {
        for (let c = 0; c < NUM_COLS; ++c) {
          const aliveCount = countNbors(r, c);
          if (prevBoardState[r][c] === 0) {
            if (aliveCount === 3) {
              newBoard[r][c] = 1;
            }
          } else {
            if (aliveCount !== 2 && aliveCount !== 3) {
              newBoard[r][c] = 0;
            }
          }
        }
      }
      return newBoard;
    });
  }

  function computeNextBoardSeeds() {
    setBoardState((prevBoardState) => {
      let newBoard = prevBoardState.map((row) => [...row]);

      for (let r = 0; r < NUM_ROWS; ++r) {
        for (let c = 0; c < NUM_COLS; ++c) {
          const aliveCount = countNbors(r, c);
          if (prevBoardState[r][c] === 0) {
            if (aliveCount === 2) {
              newBoard[r][c] = 1;
            }
          } else {
            newBoard[r][c] = 0;
          }
        }
      }
      return newBoard;
    });
  }

  function resetBoard() {
    const board = createBoard();
    setBoardState(board);
  }

  return (
    <div>
      <h1 className="text-3xl text-center font-mono mt-4">Game of Life</h1>

      <div className="flex justify-center flex-col items-center">
        <div className="flex space-x-3">
          <button
            className="py-4"
            onClick={computeNextBoardSeeds}
          >
            Next
          </button>
          <button
            className="py-4"
            onClick={resetBoard}
          >
            Reset
          </button>
          <button
            className="py-4"
            onClick={() => setIsPlaying(!isPlaying)}
          >
            {isPlaying ? "Stop" : "Play"}
          </button>
        </div>
        <canvas
          onClick={(e) => {
            const x = Math.floor(e.nativeEvent.offsetX / CELL_SIZE);
            const y = Math.floor(e.nativeEvent.offsetY / CELL_SIZE);

            let updatedBoardState = [...boardState];
            if (updatedBoardState[x][y] === 0) {
              updatedBoardState[x][y] = 1;
            } else {
              updatedBoardState[x][y] = 0;
            }
            setBoardState(updatedBoardState);
          }}
          ref={canvasRef}
          width={WIDTH}
          height={HEIGHT}
          className="bg-gray-900"
        ></canvas>
      </div>
    </div>
  );
}
