import React, { useState } from 'react';
import Piece from './Piece';

const Board = () => {
    const initialBoard = Array.from({ length: 15 }, () => Array(15).fill(0));

    const [board, setBoard] = useState(initialBoard);
    const [isBlackNext, setIsBlackNext] = useState(true);

    const isThereNeighbor = (row, col) => {
        if (board === initialBoard) return true;

        if (row < 14 && board[row + 1][col]) return true;
        if (row > 0 && board[row - 1][col]) return true;
        if (col < 14 && board[row][col + 1]) return true;
        if (col > 0 && board[row][col - 1]) return true;
        if (col < 14 && row < 14 && board[row + 1][col + 1]) return true;
        if (col > 0 && row > 0 && board[row - 1][col - 1]) return true;
        if (row > 0 && col < 14 && board[row - 1][col + 1]) return true;
        if (row < 14 && col > 0 && board[row + 1][col - 1]) return true;

        return false;
    };


    const handleClick = (row, col) => {
        if (board[row][col] !== 0) return;

        if (!isThereNeighbor(row, col)) return alert('Action impossible')

        const newBoard = board.map(row => row.slice());
        newBoard[row][col] = isBlackNext ? 1 : -1;

        setBoard(newBoard);

        if (!checkVictory(row, col)) {
            setIsBlackNext(!isBlackNext);
        }
    };

    return (
        <div className="board">
            {board.map((row, rowIndex) => (
                <div key={rowIndex} className="board-row">
                    {row.map((cell, colIndex) => (
                        <Piece
                            key={`${rowIndex}-${colIndex}`}
                            value={cell === 0 ? null : cell}
                            onClick={() => handleClick(rowIndex, colIndex)}
                        />
                    ))}
                </div>
            ))}
        </div>
    );
};

export default Board;
