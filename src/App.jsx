import React, { useState, useEffect, useCallback, useRef } from 'react';
import { COLS, ROWS, SHAPES, COLORS } from './constants';

const createGrid = () => Array.from({ length: ROWS }, () => Array(COLS).fill(0));

const getRandomPiece = () => {
  const keys = Object.keys(SHAPES);
  const type = keys[Math.floor(Math.random() * keys.length)];
  return {
    shape: SHAPES[type],
    color: COLORS[type],
    x: Math.floor(COLS / 2) - Math.floor(SHAPES[type][0].length / 2),
    y: 0
  };
};

export default function App() {
  const [grid, setGrid] = useState(createGrid());
  const [currentPiece, setCurrentPiece] = useState(getRandomPiece());
  const [score, setScore] = useState(0);
  
  // Game states: 'IDLE' | 'PLAYING' | 'GAME_OVER'
  const [gameState, setGameState] = useState('IDLE');
  
  const gameLoopRef = useRef();
  
  // Ref for handling touch gestures
  const touchRef = useRef({ x: 0, y: 0, hasMoved: false	});

  const dropPieceRef = useRef(); 

  const checkCollision = useCallback((piece, board, moveX, moveY, rotatedShape = null) => {
    const shape = rotatedShape || piece.shape;
    for (let r = 0; r < shape.length; r++) {
      for (let c = 0; c < shape[r].length; c++) {
        if (shape[r][c]) {
          const nextX = piece.x + c + moveX;
          const nextY = piece.y + r + moveY;
          if (nextX < 0 || nextX >= COLS || nextY >= ROWS) return true;
          if (nextY >= 0 && board[nextY][nextX]) return true;
        }
      }
    }
    return false;
  }, []);

  const mergePieceToGrid = useCallback(() => {
    const newGrid = grid.map(row => [...row]);
    
    currentPiece.shape.forEach((row, r) => {
      row.forEach((value, c) => {
        if (value && currentPiece.y + r >= 0) {
          newGrid[currentPiece.y + r][currentPiece.x + c] = currentPiece.color;
        }
      });
    });

    let clearedLines = 0;
    const filteredGrid = newGrid.filter(row => {
      const isLineFull = row.every(cell => cell !== 0);
      if (isLineFull) clearedLines++;
      return !isLineFull;
    });

    while (filteredGrid.length < ROWS) {
      filteredGrid.unshift(Array(COLS).fill(0));
    }

    if (clearedLines > 0) setScore(prev => prev + clearedLines * 100);
    setGrid(filteredGrid);

    const nextPiece = getRandomPiece();
    if (checkCollision(nextPiece, filteredGrid, 0, 0)) {
      setGameState('GAME_OVER');
    } else {
      setCurrentPiece(nextPiece);
    }
  }, [grid, currentPiece, checkCollision]);

  const moveLeft = useCallback(() => {
    if (!checkCollision(currentPiece, grid, -1, 0)) {
      setCurrentPiece(prev => ({ ...prev, x: prev.x - 1 }));
    }
  }, [currentPiece, grid, checkCollision]);

  const moveRight = useCallback(() => {
    if (!checkCollision(currentPiece, grid, 1, 0)) {
      setCurrentPiece(prev => ({ ...prev, x: prev.x + 1 }));
    }
  }, [currentPiece, grid, checkCollision]);

  const dropPiece = useCallback(() => {
    if (!checkCollision(currentPiece, grid, 0, 1)) {
      setCurrentPiece(prev => ({ ...prev, y: prev.y + 1 }));
    } else {
      mergePieceToGrid();
    }
  }, [currentPiece, grid, checkCollision, mergePieceToGrid]);

  const rotatePiece = useCallback(() => {
    const rotated = currentPiece.shape[0].map((_, index) =>
      currentPiece.shape.map(row => row[index]).reverse()
    );
    if (!checkCollision(currentPiece, grid, 0, 0, rotated)) {
      setCurrentPiece(prev => ({ ...prev, shape: rotated }));
    }
  }, [currentPiece, grid, checkCollision]);

  // Touch handlers for mobile
  const handleTouchStart = (e) => {
    if (gameState !== 'PLAYING') return;
    const touch = e.touches[0];

    touchRef.current.hasMoved = false;
    touchRef.current.x = touch.clientX;
    touchRef.current.y = touch.clientY;
  };

  const handleTouchMove = (e) => {
    if (gameState !== 'PLAYING') return;
    if (!touchRef.current.x || !touchRef.current.y) return;

    const touch = e.touches[0];
    const deltaX = touch.clientX - touchRef.current.x;
    const deltaY = touch.clientY - touchRef.current.y;
 
    // If finger moves more than 10px, it's no longer a tap
    if (Math.abs(deltaX) > 10 || Math.abs(deltaY) > 10) {
      touchRef.current.hasMoved = true;
    }

    // Movement threshold (swipe 30px to move a block)
    const SWIPE_THRESHOLD = 30;

    if (Math.abs(deltaX) > SWIPE_THRESHOLD) {
      if (deltaX > 0) moveRight();
      else moveLeft();
      
      // Reset anchor to allow continuous dragging
      touchRef.current.x = touch.clientX; 
      touchRef.current.y = touch.clientY;
    } else if (deltaY > SWIPE_THRESHOLD) {
      dropPiece();
      touchRef.current.y = touch.clientY;
      touchRef.current.x = touch.clientX;
    }
  };

  const handleTouchEnd = () => {
    if (gameState !== 'PLAYING') return;

   // If the finger lifted without dragging, trigger rotation
    if (!touchRef.current.hasMoved) {
	rotatePiece();
}
    // Clear drag coordinates when finger is lifted
    touchRef.current.x = 0;
    touchRef.current.y = 0;
  };

  // Keyboard controls (still active for desktop testing)
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (gameState !== 'PLAYING') return;
      if (e.key === 'ArrowLeft') moveLeft();
      if (e.key === 'ArrowRight') moveRight();
      if (e.key === 'ArrowDown') dropPiece();
      if (e.key === 'ArrowUp') rotatePiece();
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [gameState, moveLeft, moveRight, dropPiece, rotatePiece]);

  // Automatic Game Tick Loop
    // Keep the ref updated with the latest drop action
   useEffect(() => {
      dropPieceRef.current = dropPiece;
   }, [dropPiece]);

  // Automatic Game Tick Loop (Timer never resets on move/tap now)
   useEffect(() => {
        if (gameState !== 'PLAYING') return;
                  
        gameLoopRef.current = setInterval(() => {
        dropPieceRef.current();
     }, 800);
                                    
    return () => clearInterval(gameLoopRef.current);
  }, [gameState]);

  // Start & Restart handlers
  const startGame = () => {
    setGrid(createGrid());
    setCurrentPiece(getRandomPiece());
    setScore(0);
    setGameState('PLAYING');
  };

  // Combine fixed grid and active dropping piece
  const displayGrid = grid.map(row => [...row]);
  if (gameState === 'PLAYING') {
    currentPiece.shape.forEach((row, r) => {
      row.forEach((value, c) => {
        if (value && currentPiece.y + r >= 0) {
          displayGrid[currentPiece.y + r][currentPiece.x + c] = currentPiece.color;
        }
      });
    });
  }

  // Common button styling
  const btnStyle = {
    padding: '12px 24px',
    fontSize: '1.2rem',
    cursor: 'pointer',
    background: '#00f000',
    color: '#000',
    border: 'none',
    borderRadius: '6px',
    fontWeight: 'bold',
    marginTop: '15px'
  };
  return (
    <div style={{ 
      display: 'flex', 
      flexDirection: 'column', 
      alignItems: 'center', 
      fontFamily: 'sans-serif', 
      background: '#1a1a1a', 
      color: '#fff', 
      height: '100svh', // Locked to exact screen height
      padding: '10px', 
      touchAction: 'none',
      overflow: 'hidden', // Prevents scrolling completely
      boxSizing: 'border-box'
    }}>
      {/* Shrunk margins to save vertical space on mobile */}
      <h1 style={{ margin: '5px 0', fontSize: '1.5rem' }}>React Tetris</h1>
      <h2 style={{ margin: '0 0 10px 0', fontSize: '1.2rem' }}>Score: {score}</h2>
      
      <div 
        style={{ position: 'relative', border: '4px solid #333', background: '#111', touchAction: 'none' }}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        {displayGrid.map((row, r) => (
          <div key={r} style={{ display: 'flex' }}>
            {row.map((cell, c) => (
              <div
                key={c}
                style={{
                  // Dynamically size the blocks based on screen height
		  width: 'min(40px, 4.5svh)',
                  height: 'min(30px, 3.5svh)',
                  backgroundColor: cell || 'transparent',
                  border: cell ? '1px solid rgba(255,255,255,0.2)' : '1px solid #222',
                  boxSizing: 'border-box'
                }}
              />
            ))}
          </div>
        ))}

        {gameState === 'IDLE' && (
          <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.85)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
            <button onClick={startGame} style={btnStyle}>Start Game</button>
          </div>
        )}

        {gameState === 'GAME_OVER' && (
          <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.85)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
            <h2 style={{ color: '#ff4d4d', fontSize: '1.8rem', margin: 0 }}>Game Over</h2>
            <button onClick={startGame} style={btnStyle}>Play Again</button>
          </div>
        )}
      </div>

      <div style={{ marginTop: 'auto', marginBottom: '10px', textAlign: 'center', color: '#aaa', fontSize: '0.8rem', maxWidth: '300px' }}>
        <p style={{ margin: '5px 0' }}>Mobile: Drag horizontally to move.</p>
        <p style={{ margin: '5px 0' }}>Drag down to drop. Tap to rotate.</p>
      </div>
    </div>
  );

}

