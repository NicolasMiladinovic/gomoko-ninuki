import { io } from 'socket.io-client';

class SocketService {
  constructor() {
    this.socket = null;
    this.gameId = null;
    this.playerNumber = null;
    this.isGameStarted = false;
    this.currentTurn = null;
    
    // Bind methods to preserve context
    this.makeMove = this.makeMove.bind(this);
    this.createGame = this.createGame.bind(this);
    this.joinGame = this.joinGame.bind(this);
    this.connect = this.connect.bind(this);
    this.disconnect = this.disconnect.bind(this);
  }

  connect() {
    this.socket = io('http://localhost:3001');
    
    this.socket.on('connect', () => {
      console.log('Connected to server');
    });

    this.socket.on('disconnect', () => {
      console.log('Disconnected from server');
      this.gameId = null;
      this.playerNumber = null;
    });

    return this.socket;
  }

  createGame() {
    console.log('Creating new game...');
    this.socket.emit('joinGame');
  }

  joinGame(gameId) {
    console.log('Joining game:', gameId);
    this.socket.emit('joinGame', gameId);
  }

  makeMove(row, col) {
    console.log('Attempting to make move:', { gameId: this.gameId, row, col });
    if (!this.gameId) {
      console.error('Cannot make move: No game ID available');
      return;
    }
    this.socket.emit('makeMove', { gameId: this.gameId, row, col });
  }

  onGameJoined(callback) {
    this.socket.on('gameJoined', ({ gameId, playerNumber }) => {
      console.log('Game joined event received:', { gameId, playerNumber });
      this.gameId = gameId;
      this.playerNumber = playerNumber;
      console.log('Updated socket service state:', { gameId: this.gameId, playerNumber: this.playerNumber });
      callback({ gameId, playerNumber });
    });
  }

  onGameStart(callback) {
    this.socket.on('gameStart', (data) => {
      console.log('Game start event received:', data);
      callback(data);
    });
  }

  onMoveMade(callback) {
    this.socket.on('moveMade', (data) => {
      console.log('Move made event received:', data);
      callback(data);
    });
  }

  onError(callback) {
    this.socket.on('error', (error) => {
      console.error('Socket error received:', error);
      callback(error);
    });
  }

  onPlayerDisconnected(callback) {
    this.socket.on('playerDisconnected', () => {
      console.log('Player disconnected event received');
      this.gameId = null;
      this.playerNumber = null;
      callback();
    });
  }

  onGameOver(callback) {
    this.socket.on('gameOver', callback);
  }

  disconnect() {
    if (this.socket) {
      console.log('Disconnecting socket...');
      this.socket.disconnect();
      this.gameId = null;
      this.playerNumber = null;
    }
  }
}

const socketService = new SocketService();
export default socketService;