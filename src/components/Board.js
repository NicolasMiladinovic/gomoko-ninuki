import React, { useState } from 'react';
import Piece from './Piece';
import ResetBtn from './ResetBtn'

const Board = () => {
    const initialBoard = Array.from({ length: 15 }, () => Array(15).fill(0));

    const [board, setBoard] = useState(initialBoard);
    const [isBlackNext, setIsBlackNext] = useState(true);
    const [blackCaptured, setBlackCaptured] = useState(0);
    const [whiteCaptured, setWhiteCaptured] = useState(0);

    const isThereNeighbor = (row, col) => {
        if (JSON.stringify(board) === JSON.stringify(initialBoard)) return true;

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


    const checkCapture = (row, col) => {
        const directions = [
            { dr: 0, dc: 1 }, // row check
            { dr: 1, dc: 0 }, // column check
            { dr: 1, dc: 1 }, // diagonal
            { dr: 1, dc: -1 } // opposite diagonal
        ];

        const currentPlayer = isBlackNext ? 1 : -1;
        const opponentPlayer = currentPlayer === 1 ? -1 : 1;
        let capturedPieces = 0;
        const newBoard = board.map(row => row.slice());

        for (const { dr, dc } of directions) {
            const opponentPlayer1Row = row + dr;
            const opponentPlayer1Col = col + dc;
            const opponent2PlayerRow = row + 2 * dr;
            const opponent2PlayerCol = col + 2 * dc;
            const forwardCurrentPlayerRow = row + 3 * dr;
            const forwardCurrentPlayerCol = col + 3 * dc;

            if (
                opponentPlayer1Row >= 0 && opponentPlayer1Row < 15 &&
                opponentPlayer1Col >= 0 && opponentPlayer1Col < 15 &&
                opponent2PlayerRow >= 0 && opponent2PlayerRow < 15 &&
                opponent2PlayerCol >= 0 && opponent2PlayerCol < 15 &&
                forwardCurrentPlayerRow >= 0 && forwardCurrentPlayerRow < 15 &&
                forwardCurrentPlayerCol >= 0 && forwardCurrentPlayerCol < 15
            ) {
                if (
                    newBoard[opponentPlayer1Row][opponentPlayer1Col] === opponentPlayer &&
                    newBoard[opponent2PlayerRow][opponent2PlayerCol] === opponentPlayer &&
                    newBoard[forwardCurrentPlayerRow][forwardCurrentPlayerCol] === currentPlayer
                ) {
                    newBoard[opponentPlayer1Row][opponentPlayer1Col] = 0;
                    newBoard[opponent2PlayerRow][opponent2PlayerCol] = 0;
                    capturedPieces += 2;
                }
            }

            // Check backward
            const opponentPlayer1RowBack = row - dr;
            const opponentPlayer1ColBack = col - dc;
            const opponent2PlayerRowBack = row - 2 * dr;
            const opponent2PlayerColBack = col - 2 * dc;
            const backwardCurrentPlayerRow = row - 3 * dr;
            const backwardCurrentPlayerCol = col - 3 * dc;

            if (
                opponentPlayer1RowBack >= 0 && opponentPlayer1RowBack < 15 &&
                opponentPlayer1ColBack >= 0 && opponentPlayer1ColBack < 15 &&
                opponent2PlayerRowBack >= 0 && opponent2PlayerRowBack < 15 &&
                opponent2PlayerColBack >= 0 && opponent2PlayerColBack < 15 &&
                backwardCurrentPlayerRow >= 0 && backwardCurrentPlayerRow < 15 &&
                backwardCurrentPlayerCol >= 0 && backwardCurrentPlayerCol < 15
            ) {
                if (
                    newBoard[opponentPlayer1RowBack][opponentPlayer1ColBack] === opponentPlayer &&
                    newBoard[opponent2PlayerRowBack][opponent2PlayerColBack] === opponentPlayer &&
                    newBoard[backwardCurrentPlayerRow][backwardCurrentPlayerCol] === currentPlayer
                ) {
                    newBoard[opponentPlayer1RowBack][opponentPlayer1ColBack] = 0;
                    newBoard[opponent2PlayerRowBack][opponent2PlayerColBack] = 0;
                    capturedPieces += 2;
                }
            }

            // Add new piece
            newBoard[row][col] = currentPlayer;
        }

        if (capturedPieces > 0) {
            setBoard(newBoard);
            if (currentPlayer === 1) {
                setBlackCaptured(blackCaptured + capturedPieces);
            } else {
                setWhiteCaptured(whiteCaptured + capturedPieces);
            }
            console.log(`Captured ${capturedPieces} pieces by ${currentPlayer === 1 ? 'Black' : 'White'}`);
        }
    };

    const checkVictory = (row, col) => {
        const currentPlayer = isBlackNext ? 1 : -1; // 1 black, -1 white

        const directions = [
            { dr: 0, dc: 1 }, // row check
            { dr: 1, dc: 0 }, // column check
            { dr: 1, dc: 1 }, // diagonal
            { dr: 1, dc: -1 } // opposite diagonal
        ];

        for (const { dr, dc } of directions) {
            let count = 1; // the new piece

            for (let step = 1; step < 5; step++) {
                const r = row + dr * step;
                const c = col + dc * step;
                if (r < 0 || r > 14 || c < 0 || c > 14 || board[r][c] !== currentPlayer) {
                    break;
                }
                count++;
            }

            for (let step = 1; step < 5; step++) {
                const r = row - dr * step;
                const c = col - dc * step;
                if (r < 0 || r > 14 || c < 0 || c > 14 || board[r][c] !== currentPlayer) {
                    break;
                }
                count++;
            }

            if (count >= 5) {
                alert(`${currentPlayer === 1 ? 'Black' : 'White'} has won !`);
                return true;
            }
        }

        return false;
    };

    const handleClick = (row, col) => {
        if (board[row][col] !== 0) return;

        if (!isThereNeighbor(row, col)) return alert('Action forbidden')

        const newBoard = board.map(row => row.slice());
        newBoard[row][col] = isBlackNext ? 1 : -1;

        setBoard(newBoard);

        if (!checkVictory(row, col)) {
            checkCapture(row, col)
            setIsBlackNext(!isBlackNext);
        }
    };

    const resetBoard = () => {
        setBoard(initialBoard.map(row => row.slice()));
        setIsBlackNext(true);
        setBlackCaptured(0);
        setWhiteCaptured(0);
    };

    return (
        <>
            <ResetBtn
                className="reset-btn"
                onClick={resetBoard}
            />
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
        </>
    );
};

export default Board;
