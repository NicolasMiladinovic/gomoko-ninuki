import React, { useRef } from 'react';
import './Board.css';

const BOARD_SIZE = 15;
const BOARD_PX = 600;
const CELL_SIZE = BOARD_PX / (BOARD_SIZE - 1);

const Board = ({ board, onCellClick, currentTurn }) => {
  const boardRef = useRef(null);

  // Render grid lines
  const lines = [];
  for (let i = 0; i < BOARD_SIZE; i++) {
    const pos = (i / (BOARD_SIZE - 1)) * 100;
    lines.push(
      <div key={`h${i}`} className="h-line" style={{ top: `${pos}%` }} />,
      <div key={`v${i}`} className="v-line" style={{ left: `${pos}%` }} />
    );
  }

  // Render pieces
  const pieces = [];
  for (let row = 0; row < BOARD_SIZE; row++) {
    for (let col = 0; col < BOARD_SIZE; col++) {
      const value = board[row][col];
      if (value) {
        pieces.push(
          <div
            key={`${row}-${col}`}
            className={`piece ${value === 1 ? 'black' : 'white'}`}
            style={{
              left: `${(col / (BOARD_SIZE - 1)) * 100}%`,
              top: `${(row / (BOARD_SIZE - 1)) * 100}%`
            }}
          />
        );
      }
    }
  }

  // Handle click on intersections
  const handleBoardClick = (e) => {
    if (!currentTurn) return;
    const rect = boardRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const col = Math.round((x / rect.width) * (BOARD_SIZE - 1));
    const row = Math.round((y / rect.height) * (BOARD_SIZE - 1));
    onCellClick(row, col);
  };

  return (
    <div
      className="board real-board"
      ref={boardRef}
      style={{ width: BOARD_PX, height: BOARD_PX }}
      onClick={handleBoardClick}
    >
      <div className="grid-lines">{lines}</div>
      <div className="pieces-layer">{pieces}</div>
    </div>
  );
};

export default Board;
