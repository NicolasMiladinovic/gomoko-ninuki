import React, { useState, useEffect } from 'react';
import './App.css';
import Game from './components/Game';
import socketService from './socket';

function App() {
  const [isConnected, setIsConnected] = useState(false);
  const [gameId, setGameId] = useState(null);
  const [inputGameId, setInputGameId] = useState('');
  const [playerNumber, setPlayerNumber] = useState(null);
  const [isGameStarted, setIsGameStarted] = useState(false);
  const [currentTurn, setCurrentTurn] = useState(null);

  useEffect(() => {
    socketService.connect();
    setIsConnected(true);

    socketService.onGameJoined(({ gameId, playerNumber }) => {
      console.log('Game joined:', { gameId, playerNumber });
      setGameId(gameId);
      setPlayerNumber(playerNumber);
    });

    socketService.onGameStart(({ players, currentTurn }) => {
      console.log('Game started:', { players, currentTurn });
      setIsGameStarted(true);
      setCurrentTurn(currentTurn);
    });

    socketService.onPlayerDisconnected(() => {
      console.log('Player disconnected');
      setIsGameStarted(false);
      setGameId(null);
      setPlayerNumber(null);
      setCurrentTurn(null);
    });

    return () => {
      socketService.disconnect();
    };
  }, []);

  const handleCreateGame = () => {
    socketService.createGame();
  };

  const handleJoinGame = () => {
    if (!inputGameId) {
      alert('Please enter a game ID');
      return;
    }
    socketService.joinGame(inputGameId);
  };

  return (
    <div className="App">
      <h1>Gomoku Ninuki</h1>
      {!gameId ? (
        <div className="connection-screen">
          <button onClick={handleCreateGame}>Create New Game</button>
          <div className="join-game">
            <input
              type="text"
              placeholder="Enter Game ID"
              value={inputGameId}
              onChange={(e) => setInputGameId(e.target.value)}
            />
            <button onClick={handleJoinGame}>Join Game</button>
          </div>
        </div>
      ) : (
        <div>
          <div className="game-info">
            <p>Game ID: {gameId}</p>
            <p>You are Player {playerNumber}</p>
            {!isGameStarted && <p>Waiting for opponent to join...</p>}
          </div>
          <Game 
            gameId={gameId}
            playerNumber={playerNumber}
            isGameStarted={isGameStarted}
            currentTurn={currentTurn}
          />
        </div>
      )}
    </div>
  );
}

export default App;
