// =========================
// CONFIGURAÇÕES GLOBAIS
// =========================
const CHESS_CONFIG = {
    pieces: {
        king: { white: '♔', black: '♚' },
        queen: { white: '♕', black: '♛' },
        rook: { white: '♖', black: '♜' },
        bishop: { white: '♗', black: '♝' },
        knight: { white: '♘', black: '♞' },
        pawn: { white: '♙', black: '♟' }
    }
};

// =========================
// ESTADO DO JOGO
// =========================
let gameState = {
    board: [],
    selectedPiece: null,
    currentPlayer: 'white',
    moveHistory: [],
    capturedPieces: { white: [], black: [] },
    gameOver: false,
    turnCount: 1,
    kingPositions: { white: { row: 7, col: 4 }, black: { row: 0, col: 4 } },
    gameMode: 'human',
    pendingPromotion: null
};

// =========================
// INICIALIZAÇÃO
// =========================
document.addEventListener('DOMContentLoaded', () => {
    initGame();
    setupEventListeners();
});

function initGame() {
    gameState = {
        board: createInitialBoard(),
        selectedPiece: null,
        currentPlayer: 'white',
        moveHistory: [],
        capturedPieces: { white: [], black: [] },
        gameOver: false,
        turnCount: 1,
        kingPositions: { white: { row: 7, col: 4 }, black: { row: 0, col: 4 } },
        gameMode: 'human',
        pendingPromotion: null
    };
    
    createChessboard();
    renderBoard();
    updateGameInfo();
    updateModeIndicator();
}

function createInitialBoard() {
    return [
        ['r', 'n', 'b', 'q', 'k', 'b', 'n', 'r'],
        ['p', 'p', 'p', 'p', 'p', 'p', 'p', 'p'],
        ['', '', '', '', '', '', '', ''],
        ['', '', '', '', '', '', '', ''],
        ['', '', '', '', '', '', '', ''],
        ['', '', '', '', '', '', '', ''],
        ['P', 'P', 'P', 'P', 'P', 'P', 'P', 'P'],
        ['R', 'N', 'B', 'Q', 'K', 'B', 'N', 'R']
    ];
}

// =========================
// CRIAÇÃO DO TABULEIRO
// =========================
function createChessboard() {
    const chessboard = document.getElementById('chessboard');
    chessboard.innerHTML = '';
    
    for (let row = 0; row < 8; row++) {
        for (let col = 0; col < 8; col++) {
            const square = document.createElement('div');
            square.className = 'square';
            square.dataset.row = row;
            square.dataset.col = col;
            
            if ((row + col) % 2 === 0) {
                square.classList.add('light');
            } else {
                square.classList.add('dark');
            }
            
            square.addEventListener('click', () => handleSquareClick(row, col));
            chessboard.appendChild(square);
        }
    }
}

// =========================
// RENDERIZAÇÃO
// =========================
function renderBoard() {
    checkForCheck();
    
    for (let row = 0; row < 8; row++) {
        for (let col = 0; col < 8; col++) {
            const square = getSquareElement(row, col);
            const piece = gameState.board[row][col];
            
            square.innerHTML = '';
            square.classList.remove('selected', 'possible-move', 'possible-capture', 'in-check');
            
            if (piece) {
                const pieceDiv = document.createElement('div');
                pieceDiv.className = 'piece';
                pieceDiv.textContent = getPieceSymbol(piece);
                
                if (isWhitePiece(piece)) {
                    pieceDiv.classList.add('white');
                } else {
                    pieceDiv.classList.add('black');
                }
                
                square.appendChild(pieceDiv);
            }
        }
    }
    
    updatePlayerPanels();
}

// =========================
// MANIPULAÇÃO DE CLIQUE
// =========================
function handleSquareClick(row, col) {
    if (gameState.gameOver || gameState.pendingPromotion) return;
    
    if (gameState.gameMode === 'computer' && gameState.currentPlayer === 'black') {
        return;
    }
    
    const piece = gameState.board[row][col];
    const pieceColor = piece ? (isWhitePiece(piece) ? 'white' : 'black') : null;
    
    if (gameState.selectedPiece) {
        const { row: selectedRow, col: selectedCol } = gameState.selectedPiece;
        
        if (selectedRow === row && selectedCol === col) {
            clearSelection();
            return;
        }
        
        if (isValidMove(selectedRow, selectedCol, row, col)) {
            executeMove(selectedRow, selectedCol, row, col);
            clearSelection();
            
            if (gameState.gameMode === 'computer' && !gameState.gameOver && !gameState.pendingPromotion) {
                setTimeout(makeComputerMove, 500);
            }
        } else {
            if (pieceColor === gameState.currentPlayer) {
                selectPiece(row, col);
            } else {
                clearSelection();
            }
        }
    } else {
        if (pieceColor === gameState.currentPlayer) {
            selectPiece(row, col);
        }
    }
}

function selectPiece(row, col) {
    clearSelection();
    
    gameState.selectedPiece = { row, col };
    const square = getSquareElement(row, col);
    square.classList.add('selected');
    
    showPossibleMoves(row, col);
}

function clearSelection() {
    if (gameState.selectedPiece) {
        const { row, col } = gameState.selectedPiece;
        const square = getSquareElement(row, col);
        square.classList.remove('selected');
    }
    
    document.querySelectorAll('.square.possible-move, .square.possible-capture').forEach(sq => {
        sq.classList.remove('possible-move', 'possible-capture');
    });
    
    gameState.selectedPiece = null;
}

// =========================
// EXECUTAR MOVIMENTO
// =========================
function executeMove(fromRow, fromCol, toRow, toCol) {
    const piece = gameState.board[fromRow][fromCol];
    const target = gameState.board[toRow][toCol];
    const pieceType = piece.toLowerCase();
    const isWhite = isWhitePiece(piece);
    
    if (pieceType === 'k') {
        const color = isWhite ? 'white' : 'black';
        gameState.kingPositions[color] = { row: toRow, col: toCol };
    }
    
    gameState.moveHistory.push({
        from: { row: fromRow, col: fromCol },
        to: { row: toRow, col: toCol },
        piece: piece,
        captured: target,
        kingPositions: {...gameState.kingPositions}
    });
    
    if (target) {
        const capturedColor = isWhitePiece(target) ? 'white' : 'black';
        gameState.capturedPieces[capturedColor].push(target);
        
        if (target.toLowerCase() === 'k') {
            endGame(isWhite ? 'white' : 'black');
            return;
        }
    }
    
    gameState.board[toRow][toCol] = piece;
    gameState.board[fromRow][fromCol] = '';
    
    if (pieceType === 'p') {
        const promotionRow = isWhite ? 0 : 7;
        if (toRow === promotionRow) {
            gameState.pendingPromotion = { row: toRow, col: toCol, isWhite: isWhite };
            showPromotionModal(isWhite);
            return;
        }
    }
    
    completeTurn();
}

function completeTurn() {
    gameState.currentPlayer = gameState.currentPlayer === 'white' ? 'black' : 'white';
    gameState.turnCount++;
    
    renderBoard();
    updateGameInfo();
    
    if (isCheckmate()) {
        const winner = gameState.currentPlayer === 'white' ? 'pretas' : 'brancas';
        setTimeout(() => {
            endGame(gameState.currentPlayer === 'white' ? 'black' : 'white');
        }, 100);
    }
}

// =========================
// PROMOÇÃO DO PEÃO
// =========================
function showPromotionModal(isWhite) {
    const modal = document.getElementById('promotionModal');
    modal.style.display = 'flex';
}

function promotePawn(pieceType) {
    if (!gameState.pendingPromotion) return;
    
    const { row, col, isWhite } = gameState.pendingPromotion;
    const promotedPiece = isWhite ? pieceType.toUpperCase() : pieceType.toLowerCase();
    
    gameState.board[row][col] = promotedPiece;
    gameState.pendingPromotion = null;
    
    document.getElementById('promotionModal').style.display = 'none';
    
    completeTurn();
}

// =========================
// COMPUTADOR (IA)
// =========================
function makeComputerMove() {
    if (gameState.gameOver || gameState.pendingPromotion || gameState.currentPlayer === 'white') return;
    
    const captureMove = findCaptureMove();
    if (captureMove) {
        executeMove(captureMove.from.row, captureMove.from.col, captureMove.to.row, captureMove.to.col);
        return;
    }
    
    const randomMove = findRandomMove();
    if (randomMove) {
        executeMove(randomMove.from.row, randomMove.from.col, randomMove.to.row, randomMove.to.col);
    }
}

function findCaptureMove() {
    const captureMoves = [];
    
    for (let fromRow = 0; fromRow < 8; fromRow++) {
        for (let fromCol = 0; fromCol < 8; fromCol++) {
            const piece = gameState.board[fromRow][fromCol];
            if (piece && !isWhitePiece(piece)) {
                const moves = getAllValidMovesForPiece(fromRow, fromCol, true);
                for (const move of moves) {
                    const target = gameState.board[move.row][move.col];
                    if (target && isWhitePiece(target)) {
                        captureMoves.push({
                            from: { row: fromRow, col: fromCol },
                            to: { row: move.row, col: move.col }
                        });
                    }
                }
            }
        }
    }
    
    if (captureMoves.length > 0) {
        return captureMoves[Math.floor(Math.random() * captureMoves.length)];
    }
    
    return null;
}

function findRandomMove() {
    const moves = [];
    
    for (let fromRow = 0; fromRow < 8; fromRow++) {
        for (let fromCol = 0; fromCol < 8; fromCol++) {
            const piece = gameState.board[fromRow][fromCol];
            if (piece && !isWhitePiece(piece)) {
                const pieceMoves = getAllValidMovesForPiece(fromRow, fromCol, true);
                pieceMoves.forEach(move => {
                    moves.push({
                        from: { row: fromRow, col: fromCol },
                        to: { row: move.row, col: move.col }
                    });
                });
            }
        }
    }
    
    if (moves.length > 0) {
        return moves[Math.floor(Math.random() * moves.length)];
    }
    
    return null;
}

function getAllValidMovesForPiece(row, col, includeOnlyValid = false) {
    const piece = gameState.board[row][col];
    if (!piece) return [];
    
    const pieceType = piece.toLowerCase();
    const isWhite = isWhitePiece(piece);
    const moves = [];
    
    switch(pieceType) {
        case 'p':
            const direction = isWhite ? -1 : 1;
            const startRow = isWhite ? 6 : 1;
            
            if (isValidSquare(row + direction, col) && !gameState.board[row + direction][col]) {
                moves.push({ row: row + direction, col });
                if (row === startRow && !gameState.board[row + 2 * direction][col]) {
                    moves.push({ row: row + 2 * direction, col });
                }
            }
            
            [-1, 1].forEach(dc => {
                const newRow = row + direction;
                const newCol = col + dc;
                if (isValidSquare(newRow, newCol)) {
                    const target = gameState.board[newRow][newCol];
                    if (target && isWhitePiece(target) !== isWhite) {
                        moves.push({ row: newRow, col: newCol });
                    }
                }
            });
            break;
            
        case 'r':
            const rookDirs = [[-1, 0], [1, 0], [0, -1], [0, 1]];
            rookDirs.forEach(([dr, dc]) => {
                let r = row + dr;
                let c = col + dc;
                while (isValidSquare(r, c)) {
                    const target = gameState.board[r][c];
                    if (!target) {
                        moves.push({ row: r, col: c });
                    } else {
                        if (isWhitePiece(target) !== isWhite) {
                            moves.push({ row: r, col: c });
                        }
                        break;
                    }
                    r += dr;
                    c += dc;
                }
            });
            break;
            
        case 'n':
            const knightMoves = [
                [-2, -1], [-2, 1], [-1, -2], [-1, 2],
                [1, -2], [1, 2], [2, -1], [2, 1]
            ];
            knightMoves.forEach(([dr, dc]) => {
                const r = row + dr;
                const c = col + dc;
                if (isValidSquare(r, c)) {
                    const target = gameState.board[r][c];
                    if (!target || isWhitePiece(target) !== isWhite) {
                        moves.push({ row: r, col: c });
                    }
                }
            });
            break;
            
        case 'b':
            const bishopDirs = [[-1, -1], [-1, 1], [1, -1], [1, 1]];
            bishopDirs.forEach(([dr, dc]) => {
                let r = row + dr;
                let c = col + dc;
                while (isValidSquare(r, c)) {
                    const target = gameState.board[r][c];
                    if (!target) {
                        moves.push({ row: r, col: c });
                    } else {
                        if (isWhitePiece(target) !== isWhite) {
                            moves.push({ row: r, col: c });
                        }
                        break;
                    }
                    r += dr;
                    c += dc;
                }
            });
            break;
            
        case 'q':
            const queenDirs = [[-1, 0], [1, 0], [0, -1], [0, 1], [-1, -1], [-1, 1], [1, -1], [1, 1]];
            queenDirs.forEach(([dr, dc]) => {
                let r = row + dr;
                let c = col + dc;
                while (isValidSquare(r, c)) {
                    const target = gameState.board[r][c];
                    if (!target) {
                        moves.push({ row: r, col: c });
                    } else {
                        if (isWhitePiece(target) !== isWhite) {
                            moves.push({ row: r, col: c });
                        }
                        break;
                    }
                    r += dr;
                    c += dc;
                }
            });
            break;
            
        case 'k':
            const kingMoves = [
                [-1, -1], [-1, 0], [-1, 1],
                [0, -1], [0, 1],
                [1, -1], [1, 0], [1, 1]
            ];
            kingMoves.forEach(([dr, dc]) => {
                const r = row + dr;
                const c = col + dc;
                if (isValidSquare(r, c)) {
                    const target = gameState.board[r][c];
                    if (!target || isWhitePiece(target) !== isWhite) {
                        moves.push({ row: r, col: c });
                    }
                }
            });
            break;
    }
    
    if (includeOnlyValid) {
        return moves.filter(move => {
            return isValidMoveForComputer(row, col, move.row, move.col);
        });
    }
    
    return moves;
}

function isValidMoveForComputer(fromRow, fromCol, toRow, toCol) {
    const piece = gameState.board[fromRow][fromCol];
    if (!piece) return false;
    
    if (!isValidMove(fromRow, fromCol, toRow, toCol)) {
        return false;
    }
    
    const originalPiece = piece;
    const target = gameState.board[toRow][toCol];
    const tempKingPos = {...gameState.kingPositions};
    const pieceType = piece.toLowerCase();
    const isWhite = isWhitePiece(piece);
    
    if (pieceType === 'k') {
        const color = isWhite ? 'white' : 'black';
        gameState.kingPositions[color] = { row: toRow, col: toCol };
    }
    
    gameState.board[toRow][toCol] = piece;
    gameState.board[fromRow][fromCol] = '';
    
    const kingColor = isWhite ? 'white' : 'black';
    const kingPos = gameState.kingPositions[kingColor];
    const inCheck = isSquareAttacked(kingPos.row, kingPos.col, isWhite ? 'black' : 'white');
    
    gameState.board[fromRow][fromCol] = originalPiece;
    gameState.board[toRow][toCol] = target;
    gameState.kingPositions = tempKingPos;
    
    return !inCheck;
}

// =========================
// MOVIMENTOS POSSÍVEIS
// =========================
function showPossibleMoves(row, col) {
    const piece = gameState.board[row][col];
    if (!piece) return;
    
    const pieceType = piece.toLowerCase();
    const isWhite = isWhitePiece(piece);
    
    switch(pieceType) {
        case 'p': showPawnMoves(row, col, isWhite); break;
        case 'r': showRookMoves(row, col, isWhite); break;
        case 'n': showKnightMoves(row, col, isWhite); break;
        case 'b': showBishopMoves(row, col, isWhite); break;
        case 'q': showQueenMoves(row, col, isWhite); break;
        case 'k': showKingMoves(row, col, isWhite); break;
    }
}

function showPawnMoves(row, col, isWhite) {
    const direction = isWhite ? -1 : 1;
    const startRow = isWhite ? 6 : 1;
    
    if (isValidSquare(row + direction, col) && !gameState.board[row + direction][col]) {
        markPossibleMove(row + direction, col);
        if (row === startRow && !gameState.board[row + 2 * direction][col]) {
            markPossibleMove(row + 2 * direction, col);
        }
    }
    
    [-1, 1].forEach(dc => {
        const newRow = row + direction;
        const newCol = col + dc;
        if (isValidSquare(newRow, newCol)) {
            const target = gameState.board[newRow][newCol];
            if (target && isWhitePiece(target) !== isWhite) {
                markPossibleCapture(newRow, newCol);
            }
        }
    });
}

function showRookMoves(row, col, isWhite) {
    const directions = [[-1, 0], [1, 0], [0, -1], [0, 1]];
    directions.forEach(([dr, dc]) => {
        let r = row + dr;
        let c = col + dc;
        while (isValidSquare(r, c)) {
            const target = gameState.board[r][c];
            if (!target) {
                markPossibleMove(r, c);
            } else {
                if (isWhitePiece(target) !== isWhite) {
                    markPossibleCapture(r, c);
                }
                break;
            }
            r += dr;
            c += dc;
        }
    });
}

function showKnightMoves(row, col, isWhite) {
    const moves = [
        [-2, -1], [-2, 1], [-1, -2], [-1, 2],
        [1, -2], [1, 2], [2, -1], [2, 1]
    ];
    moves.forEach(([dr, dc]) => {
        const r = row + dr;
        const c = col + dc;
        if (isValidSquare(r, c)) {
            const target = gameState.board[r][c];
            if (!target) {
                markPossibleMove(r, c);
            } else if (isWhitePiece(target) !== isWhite) {
                markPossibleCapture(r, c);
            }
        }
    });
}

function showBishopMoves(row, col, isWhite) {
    const directions = [[-1, -1], [-1, 1], [1, -1], [1, 1]];
    directions.forEach(([dr, dc]) => {
        let r = row + dr;
        let c = col + dc;
        while (isValidSquare(r, c)) {
            const target = gameState.board[r][c];
            if (!target) {
                markPossibleMove(r, c);
            } else {
                if (isWhitePiece(target) !== isWhite) {
                    markPossibleCapture(r, c);
                }
                break;
            }
            r += dr;
            c += dc;
        }
    });
}

function showQueenMoves(row, col, isWhite) {
    showRookMoves(row, col, isWhite);
    showBishopMoves(row, col, isWhite);
}

function showKingMoves(row, col, isWhite) {
    const moves = [
        [-1, -1], [-1, 0], [-1, 1],
        [0, -1], [0, 1],
        [1, -1], [1, 0], [1, 1]
    ];
    moves.forEach(([dr, dc]) => {
        const r = row + dr;
        const c = col + dc;
        if (isValidSquare(r, c)) {
            const target = gameState.board[r][c];
            if (!target) {
                markPossibleMove(r, c);
            } else if (isWhitePiece(target) !== isWhite) {
                markPossibleCapture(r, c);
            }
        }
    });
}

function markPossibleMove(row, col) {
    const square = getSquareElement(row, col);
    square.classList.add('possible-move');
}

function markPossibleCapture(row, col) {
    const square = getSquareElement(row, col);
    square.classList.add('possible-capture');
}

// =========================
// VALIDAÇÃO DE MOVIMENTOS
// =========================
function isValidMove(fromRow, fromCol, toRow, toCol) {
    const piece = gameState.board[fromRow][fromCol];
    if (!piece) return false;
    
    const pieceType = piece.toLowerCase();
    const isWhite = isWhitePiece(piece);
    const target = gameState.board[toRow][toCol];
    
    if (target && isWhitePiece(target) === isWhite) {
        return false;
    }
    
    switch(pieceType) {
        case 'p': return isValidPawnMove(fromRow, fromCol, toRow, toCol, isWhite);
        case 'r': return isValidRookMove(fromRow, fromCol, toRow, toCol);
        case 'n': return isValidKnightMove(fromRow, fromCol, toRow, toCol);
        case 'b': return isValidBishopMove(fromRow, fromCol, toRow, toCol);
        case 'q': return isValidQueenMove(fromRow, fromCol, toRow, toCol);
        case 'k': return isValidKingMove(fromRow, fromCol, toRow, toCol);
        default: return false;
    }
}

function isValidPawnMove(fromRow, fromCol, toRow, toCol, isWhite) {
    const direction = isWhite ? -1 : 1;
    const startRow = isWhite ? 6 : 1;
    const target = gameState.board[toRow][toCol];
    
    if (fromCol === toCol) {
        if (toRow === fromRow + direction && !target) {
            return true;
        }
        if (fromRow === startRow && 
            toRow === fromRow + 2 * direction && 
            !target && 
            !gameState.board[fromRow + direction][fromCol]) {
            return true;
        }
    }
    
    if (Math.abs(toCol - fromCol) === 1 && toRow === fromRow + direction) {
        if (target && isWhitePiece(target) !== isWhite) {
            return true;
        }
    }
    
    return false;
}

function isValidRookMove(fromRow, fromCol, toRow, toCol) {
    if (fromRow !== toRow && fromCol !== toCol) return false;
    
    if (fromRow === toRow) {
        const step = fromCol < toCol ? 1 : -1;
        for (let col = fromCol + step; col !== toCol; col += step) {
            if (gameState.board[fromRow][col]) return false;
        }
    } else {
        const step = fromRow < toRow ? 1 : -1;
        for (let row = fromRow + step; row !== toRow; row += step) {
            if (gameState.board[row][fromCol]) return false;
        }
    }
    
    return true;
}

function isValidKnightMove(fromRow, fromCol, toRow, toCol) {
    const rowDiff = Math.abs(toRow - fromRow);
    const colDiff = Math.abs(toCol - fromCol);
    return (rowDiff === 2 && colDiff === 1) || (rowDiff === 1 && colDiff === 2);
}

function isValidBishopMove(fromRow, fromCol, toRow, toCol) {
    if (Math.abs(toRow - fromRow) !== Math.abs(toCol - fromCol)) return false;
    
    const rowStep = toRow > fromRow ? 1 : -1;
    const colStep = toCol > fromCol ? 1 : -1;
    
    let row = fromRow + rowStep;
    let col = fromCol + colStep;
    
    while (row !== toRow && col !== toCol) {
        if (gameState.board[row][col]) return false;
        row += rowStep;
        col += colStep;
    }
    
    return true;
}

function isValidQueenMove(fromRow, fromCol, toRow, toCol) {
    return isValidRookMove(fromRow, fromCol, toRow, toCol) || 
           isValidBishopMove(fromRow, fromCol, toRow, toCol);
}

function isValidKingMove(fromRow, fromCol, toRow, toCol) {
    const rowDiff = Math.abs(toRow - fromRow);
    const colDiff = Math.abs(toCol - fromCol);
    return rowDiff <= 1 && colDiff <= 1;
}

// =========================
// VERIFICAÇÕES DE XEQUE
// =========================
function checkForCheck() {
    document.querySelectorAll('.square.in-check').forEach(sq => {
        sq.classList.remove('in-check');
    });
    
    const whiteKingPos = gameState.kingPositions.white;
    const blackKingPos = gameState.kingPositions.black;
    
    if (isSquareAttacked(whiteKingPos.row, whiteKingPos.col, 'black')) {
        const square = getSquareElement(whiteKingPos.row, whiteKingPos.col);
        square.classList.add('in-check');
    }
    
    if (isSquareAttacked(blackKingPos.row, blackKingPos.col, 'white')) {
        const square = getSquareElement(blackKingPos.row, blackKingPos.col);
        square.classList.add('in-check');
    }
}

function isSquareAttacked(row, col, attackerColor) {
    for (let r = 0; r < 8; r++) {
        for (let c = 0; c < 8; c++) {
            const piece = gameState.board[r][c];
            if (piece && isWhitePiece(piece) === (attackerColor === 'white')) {
                if (isValidMoveForPiece(r, c, row, col, attackerColor === 'white')) {
                    return true;
                }
            }
        }
    }
    return false;
}

function isValidMoveForPiece(fromRow, fromCol, toRow, toCol, isWhite) {
    const piece = gameState.board[fromRow][fromCol];
    if (!piece) return false;
    
    const pieceType = piece.toLowerCase();
    
    switch(pieceType) {
        case 'p': return isValidPawnMove(fromRow, fromCol, toRow, toCol, isWhite);
        case 'r': return isValidRookMove(fromRow, fromCol, toRow, toCol);
        case 'n': return isValidKnightMove(fromRow, fromCol, toRow, toCol);
        case 'b': return isValidBishopMove(fromRow, fromCol, toRow, toCol);
        case 'q': return isValidQueenMove(fromRow, fromCol, toRow, toCol);
        case 'k': return isValidKingMove(fromRow, fromCol, toRow, toCol);
        default: return false;
    }
}

function isCheckmate() {
    const currentPlayer = gameState.currentPlayer;
    const opponentColor = currentPlayer === 'white' ? 'black' : 'white';
    const kingPos = gameState.kingPositions[currentPlayer];
    
    if (!isSquareAttacked(kingPos.row, kingPos.col, opponentColor)) {
        return false;
    }
    
    for (let r = 0; r < 8; r++) {
        for (let c = 0; c < 8; c++) {
            const piece = gameState.board[r][c];
            if (piece && isWhitePiece(piece) === (currentPlayer === 'white')) {
                for (let toR = 0; toR < 8; toR++) {
                    for (let toC = 0; toC < 8; toC++) {
                        if (isValidMove(r, c, toR, toC)) {
                            const tempPiece = piece;
                            const target = gameState.board[toR][toC];
                            const tempKingPos = {...gameState.kingPositions};
                            
                            if (piece.toLowerCase() === 'k') {
                                gameState.kingPositions[currentPlayer] = { row: toR, col: toC };
                            }
                            
                            gameState.board[toR][toC] = piece;
                            gameState.board[r][c] = '';
                            
                            const stillInCheck = isSquareAttacked(
                                piece.toLowerCase() === 'k' ? toR : kingPos.row,
                                piece.toLowerCase() === 'k' ? toC : kingPos.col,
                                opponentColor
                            );
                            
                            gameState.board[r][c] = tempPiece;
                            gameState.board[toR][toC] = target;
                            gameState.kingPositions = tempKingPos;
                            
                            if (!stillInCheck) {
                                return false;
                            }
                        }
                    }
                }
            }
        }
    }
    
    return true;
}

// =========================
// FIM DE JOGO
// =========================
function endGame(winner) {
    gameState.gameOver = true;
    
    const winnerMessage = document.getElementById('winnerMessage');
    if (winner === 'white') {
        winnerMessage.textContent = '🏆 Brancas venceram!';
    } else {
        winnerMessage.textContent = '🏆 Pretas venceram!';
    }
    
    const gameOverModal = document.getElementById('gameOverModal');
    gameOverModal.style.display = 'flex';
}

// =========================
// FUNÇÕES AUXILIARES
// =========================
function getSquareElement(row, col) {
    const index = row * 8 + col;
    return document.getElementById('chessboard').children[index];
}

function isValidSquare(row, col) {
    return row >= 0 && row < 8 && col >= 0 && col < 8;
}

function isWhitePiece(piece) {
    return piece === piece.toUpperCase();
}

function getPieceSymbol(piece) {
    const isWhite = isWhitePiece(piece);
    const pieceType = piece.toLowerCase();
    
    switch(pieceType) {
        case 'k': return isWhite ? CHESS_CONFIG.pieces.king.white : CHESS_CONFIG.pieces.king.black;
        case 'q': return isWhite ? CHESS_CONFIG.pieces.queen.white : CHESS_CONFIG.pieces.queen.black;
        case 'r': return isWhite ? CHESS_CONFIG.pieces.rook.white : CHESS_CONFIG.pieces.rook.black;
        case 'b': return isWhite ? CHESS_CONFIG.pieces.bishop.white : CHESS_CONFIG.pieces.bishop.black;
        case 'n': return isWhite ? CHESS_CONFIG.pieces.knight.white : CHESS_CONFIG.pieces.knight.black;
        case 'p': return isWhite ? CHESS_CONFIG.pieces.pawn.white : CHESS_CONFIG.pieces.pawn.black;
        default: return '';
    }
}

// =========================
// ATUALIZAÇÃO DA INTERFACE
// =========================
function updateGameInfo() {
    updatePlayerPanels();
    updateCapturedPieces();
}

function updatePlayerPanels() {
    const whiteCard = document.getElementById('whiteStatusCard');
    const blackCard = document.getElementById('blackStatusCard');
    const whiteStatus = document.getElementById('whiteStatusTop');
    const blackStatus = document.getElementById('blackStatusTop');
    
    if (gameState.currentPlayer === 'white') {
        whiteCard.classList.add('active');
        blackCard.classList.remove('active');
        whiteStatus.textContent = 'Sua vez!';
        whiteStatus.classList.add('active');
        blackStatus.textContent = 'Aguardando...';
        blackStatus.classList.remove('active');
    } else {
        whiteCard.classList.remove('active');
        blackCard.classList.add('active');
        whiteStatus.textContent = 'Aguardando...';
        whiteStatus.classList.remove('active');
        blackStatus.textContent = gameState.gameMode === 'computer' ? 'Pensando...' : 'Sua vez!';
        blackStatus.classList.add('active');
    }
}

function updateCapturedPieces() {
    const whiteCaptures = document.getElementById('whiteCapturesTop');
    const blackCaptures = document.getElementById('blackCapturesTop');
    
    whiteCaptures.innerHTML = '';
    blackCaptures.innerHTML = '';
    
    if (gameState.capturedPieces.white.length === 0) {
        whiteCaptures.innerHTML = '<span class="empty-captures-top">-</span>';
    } else {
        gameState.capturedPieces.white.forEach(piece => {
            const span = document.createElement('span');
            span.className = 'captured-piece-top';
            span.textContent = getPieceSymbol(piece);
            whiteCaptures.appendChild(span);
        });
    }
    
    if (gameState.capturedPieces.black.length === 0) {
        blackCaptures.innerHTML = '<span class="empty-captures-top">-</span>';
    } else {
        gameState.capturedPieces.black.forEach(piece => {
            const span = document.createElement('span');
            span.className = 'captured-piece-top';
            span.textContent = getPieceSymbol(piece);
            blackCaptures.appendChild(span);
        });
    }
}

function updateModeIndicator() {
    const blackPlayerName = document.getElementById('blackPlayerNameTop');
    const blackPlayerType = document.getElementById('blackPlayerTypeTop');
    
    if (gameState.gameMode === 'human') {
        blackPlayerName.textContent = 'Outro Jogador';
        blackPlayerType.textContent = 'Jogador 2';
    } else {
        blackPlayerName.textContent = 'Computador';
        blackPlayerType.textContent = 'Nível Iniciante';
    }
}

// =========================
// EVENT LISTENERS
// =========================
function setupEventListeners() {
    document.getElementById('restartBtn').addEventListener('click', () => {
        document.getElementById('gameOverModal').style.display = 'none';
        initGame();
    });
    
    window.addEventListener('click', (e) => {
        if (e.target.classList.contains('modal')) {
            e.target.style.display = 'none';
        }
    });
    
    document.querySelectorAll('.mode-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            document.querySelectorAll('.mode-btn').forEach(b => b.classList.remove('active'));
            this.classList.add('active');
            
            gameState.gameMode = this.dataset.mode;
            updateModeIndicator();
            
            if (gameState.gameMode === 'computer' && gameState.currentPlayer === 'black' && !gameState.gameOver) {
                setTimeout(makeComputerMove, 500);
            }
        });
    });
    
    document.querySelectorAll('.promotion-choice').forEach(btn => {
        btn.addEventListener('click', function() {
            const pieceType = this.dataset.piece;
            promotePawn(pieceType);
        });
    });
    
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            document.querySelectorAll('.modal').forEach(modal => {
                modal.style.display = 'none';
            });
        }
    });
}