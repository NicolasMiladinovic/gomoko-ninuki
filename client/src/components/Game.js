import React, { useState, useEffect, useCallback } from 'react';
import Board from './Board';
import socketService from '../socket';

const Game = ({ gameId, playerNumber, isGameStarted, currentTurn: initialCurrentTurn }) => {
  const [gameState, setGameState] = useState({
    board: Array(15).fill().map(() => Array(15).fill(null)),
    currentTurn: initialCurrentTurn,
    captures: { 1: 0, 2: 0 },
    gameOver: false,
    winner: null,
    winReason: null
  });

  useEffect(() => {
    socketService.onMoveMade(({ row, col, player, currentTurn, captures, hasWon, board }) => {
      console.log('Move made event received:', { row, col, player, currentTurn, captures, hasWon, board });
      setGameState(prev => {
        return {
          ...prev,
          board: board || prev.board,
          currentTurn,
          captures: captures || prev.captures,
          gameOver: hasWon || false,
          winner: hasWon ? player : null,
          winReason: hasWon ? (captures && captures[player] >= 10 ? 'captures' : 'five-in-a-row') : null
        };
      });
    });

    socketService.onGameOver(({ winner, reason }) => {
      setGameState(prev => ({
        ...prev,
        gameOver: true,
        winner,
        winReason: reason
      }));
    });

    socketService.onError((message) => {
      alert(message);
    });

    return () => {
      if (socketService.socket) {
        socketService.socket.off('moveMade');
        socketService.socket.off('gameOver');
        socketService.socket.off('error');
      }
    };
  }, []);

  useEffect(() => {
    setGameState(prev => ({
      ...prev,
      currentTurn: initialCurrentTurn
    }));
  }, [initialCurrentTurn]);

  const handleCellClick = useCallback((row, col) => {
    if (gameState.gameOver || !isGameStarted || gameState.currentTurn !== socketService.socket.id) {
      return;
    }
    socketService.makeMove(row, col);
  }, [gameState.gameOver, isGameStarted, gameState.currentTurn]);

  const getStatusMessage = () => {
    if (gameState.gameOver) {
      const winnerText = gameState.winner === playerNumber ? 'You' : 'Opponent';
      const reasonText = gameState.winReason === 'captures' ? 'by capturing 10 pieces' : 'by getting 5 in a row';
      return `Game Over! ${winnerText} won ${reasonText}`;
    }
    if (!isGameStarted) {
      return 'Waiting for opponent...';
    }
    return gameState.currentTurn === socketService.socket.id ? 'Your turn' : 'Opponent\'s turn';
  };

  return (
    <div className="game">
      <div className="game-info">
        <div className="status">{getStatusMessage()}</div>
        <div className="captures">
          <div>Your captures: {gameState.captures[playerNumber] || 0}</div>
          <div>Opponent's captures: {gameState.captures[playerNumber === 1 ? 2 : 1] || 0}</div>
        </div>
      </div>
      <Board
        board={gameState.board}
        onCellClick={handleCellClick}
        currentTurn={gameState.currentTurn === socketService.socket.id && isGameStarted}
      />
    </div>
  );
};

export default Game;
