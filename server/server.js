const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');

const app = express();
app.use(cors());

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "http://localhost:3000", // Your React app's URL
    methods: ["GET", "POST"]
  }
});

// Store active games
const games = new Map();

const checkCapture = (board, row, col, playerNumber) => {
  const directions = [
    { dr: 0, dc: 1 }, // horizontal
    { dr: 1, dc: 0 }, // vertical
    { dr: 1, dc: 1 }, // diagonal
    { dr: 1, dc: -1 } // anti-diagonal
  ];

  const opponentNumber = playerNumber === 1 ? 2 : 1;
  let capturedPieces = 0;
  const newBoard = board.map(row => [...row]);

  for (const { dr, dc } of directions) {
    // Check forward
    const r1 = row + dr;
    const c1 = col + dc;
    const r2 = row + 2 * dr;
    const c2 = col + 2 * dc;
    const r3 = row + 3 * dr;
    const c3 = col + 3 * dc;
    if (
      r3 >= 0 && r3 < 15 && c3 >= 0 && c3 < 15 &&
      newBoard[r1][c1] === opponentNumber &&
      newBoard[r2][c2] === opponentNumber &&
      newBoard[r3][c3] === playerNumber
    ) {
      newBoard[r1][c1] = null;
      newBoard[r2][c2] = null;
      capturedPieces += 2;
    }
    // Check backward
    const br1 = row - dr;
    const bc1 = col - dc;
    const br2 = row - 2 * dr;
    const bc2 = col - 2 * dc;
    const br3 = row - 3 * dr;
    const bc3 = col - 3 * dc;
    if (
      br3 >= 0 && br3 < 15 && bc3 >= 0 && bc3 < 15 &&
      newBoard[br1][bc1] === opponentNumber &&
      newBoard[br2][bc2] === opponentNumber &&
      newBoard[br3][bc3] === playerNumber
    ) {
      newBoard[br1][bc1] = null;
      newBoard[br2][bc2] = null;
      capturedPieces += 2;
    }
  }

  return { newBoard, capturedPieces };
};

const checkVictory = (board, row, col, playerNumber, capturedPieces) => {
  const directions = [
    { dr: 0, dc: 1 }, // horizontal
    { dr: 1, dc: 0 }, // vertical
    { dr: 1, dc: 1 }, // diagonal
    { dr: 1, dc: -1 } // anti-diagonal
  ];

  // Check for 5 in a row
  for (const { dr, dc } of directions) {
    let count = 1;

    // Check forward
    for (let i = 1; i < 5; i++) {
      const r = row + dr * i;
      const c = col + dc * i;
      if (r < 0 || r >= 15 || c < 0 || c >= 15 || board[r][c] !== playerNumber) break;
      count++;
    }

    // Check backward
    for (let i = 1; i < 5; i++) {
      const r = row - dr * i;
      const c = col - dc * i;
      if (r < 0 || r >= 15 || c < 0 || c >= 15 || board[r][c] !== playerNumber) break;
      count++;
    }

    if (count >= 5) return true;
  }

  // Check for 10 captures
  if (capturedPieces >= 10) return true;

  return false;
};

const hasNeighbor = (board, row, col) => {
  // Check all 8 directions for neighbors
  const directions = [
    { dr: -1, dc: -1 }, { dr: -1, dc: 0 }, { dr: -1, dc: 1 },
    { dr: 0, dc: -1 },                     { dr: 0, dc: 1 },
    { dr: 1, dc: -1 },  { dr: 1, dc: 0 },  { dr: 1, dc: 1 }
  ];

  for (const { dr, dc } of directions) {
    const r = row + dr;
    const c = col + dc;
    if (r >= 0 && r < 15 && c >= 0 && c < 15 && board[r][c] !== null) {
      return true;
    }
  }
  return false;
};

io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  // Handle player joining a game
  socket.on('joinGame', (gameId) => {
    console.log('Join game request:', { socketId: socket.id, gameId });
    
    if (!gameId) {
      // Create new game
      const newGameId = Date.now().toString();
      console.log('Creating new game:', newGameId);
      
      games.set(newGameId, {
        players: [socket.id],
        currentTurn: socket.id,
        board: Array(15).fill().map(() => Array(15).fill(null)),
        captures: { 1: 0, 2: 0 }
      });
      
      socket.join(newGameId);
      console.log('Emitting gameJoined for new game:', { gameId: newGameId, playerNumber: 1 });
      socket.emit('gameJoined', { gameId: newGameId, playerNumber: 1 });
    } else {
      // Join existing game
      console.log('Attempting to join existing game:', gameId);
      const game = games.get(gameId);
      
      if (game && game.players.length < 2) {
        game.players.push(socket.id);
        socket.join(gameId);
        console.log('Player joined game:', { gameId, playerNumber: 2 });
        socket.emit('gameJoined', { gameId, playerNumber: 2 });
        
        console.log('Emitting gameStart:', { 
          gameId,
          players: game.players,
          currentTurn: game.currentTurn
        });
        io.to(gameId).emit('gameStart', { 
          gameId,
          players: game.players,
          currentTurn: game.currentTurn
        });
      } else {
        console.log('Game join failed:', { gameId, exists: !!game, players: game?.players?.length });
        socket.emit('error', 'Game is full or does not exist');
      }
    }
  });

  // Handle player moves
  socket.on('makeMove', ({ gameId, row, col }) => {
    console.log('Move attempt:', { socketId: socket.id, gameId, row, col });
    
    if (!gameId) {
      console.error('No gameId provided for move');
      socket.emit('error', 'No game ID provided');
      return;
    }

    const game = games.get(gameId);
    if (!game) {
      console.error('Game not found:', gameId);
      socket.emit('error', 'Game not found');
      return;
    }

    if (game.currentTurn !== socket.id) {
      console.error('Not player\'s turn:', { socketId: socket.id, currentTurn: game.currentTurn });
      socket.emit('error', 'Not your turn');
      return;
    }

    if (game.board[row][col] !== null) {
      console.error('Cell already occupied:', { row, col });
      socket.emit('error', 'Cell already occupied');
      return;
    }

    const playerNumber = game.players.indexOf(socket.id) + 1;
    
    // Check for first move (must be in center)
    if (game.board.every(row => row.every(cell => cell === null))) {
      if (row !== 7 || col !== 7) {
        socket.emit('error', 'First move must be in the center');
        return;
      }
    } else {
      // Check for adjacent piece
      if (!hasNeighbor(game.board, row, col)) {
        socket.emit('error', 'Must place piece adjacent to an existing piece');
        return;
      }
    }

    // Make the move
    game.board[row][col] = playerNumber;

    // Check for captures
    const { newBoard, capturedPieces } = checkCapture(game.board, row, col, playerNumber);
    game.board = newBoard;
    game.captures[playerNumber] += capturedPieces;

    // Check for victory
    const hasWon = checkVictory(game.board, row, col, playerNumber, game.captures[playerNumber]);

    // Update turn
    game.currentTurn = game.players.find(id => id !== socket.id);
    
    console.log('Move made:', {
      gameId,
      row,
      col,
      player: playerNumber,
      currentTurn: game.currentTurn,
      captures: game.captures
    });
    
    io.to(gameId).emit('moveMade', {
      row,
      col,
      player: playerNumber,
      currentTurn: game.currentTurn,
      captures: game.captures,
      hasWon,
      board: game.board
    });

    if (hasWon) {
      io.to(gameId).emit('gameOver', {
        winner: playerNumber,
        reason: game.captures[playerNumber] >= 10 ? 'captures' : 'five-in-a-row'
      });
    }
  });

  // Handle disconnection
  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
    // Clean up games when players disconnect
    games.forEach((game, gameId) => {
      if (game.players.includes(socket.id)) {
        console.log('Cleaning up game after disconnect:', gameId);
        io.to(gameId).emit('playerDisconnected');
        games.delete(gameId);
      }
    });
  });
});

const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
}); 