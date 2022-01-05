/* Flips board */
function flipBoard(board) {
    for (let i = 0; i < board.length / 2; i++) {
        const temp = board[i];
        board[i] = board[board.length-1-i];
        board[board.length-1-i] = temp;
    }
}

/* Converts (row, col) to standard chess notation */
function convertToStandard(
    oldCol, oldRow, newCol, newRow, board, isCheck, isCheckmate,
    castlingDone, castlingSide, enPessantUsed ) 
{
    // TODO : checking multiple pieces possibility and promotion
    // Checks for castling: O-O or O-O-O
    if (castlingDone) {
        if (castlingSide === 'k') { return 'O-O'; }   // kingside
        else                      { return 'O-O-O'; } // queenside
    }
    const cols = ['a','b','c','d','e','f','g','h'];
    let notation = cols[newCol] + (8-newRow); // square like e7
    if (isCheckmate) { notation+='#'; } // checkmate
    else if (isCheck) { notation+='+'; } // check
    
    const pieceMoved = board[oldRow][oldCol];
    const newSquare = board[newRow][newCol];
    // Checks for capture
    if (newSquare || enPessantUsed) {
        notation = 'x' + notation;
    }
    // Adds piece code e.g. B for bishop
    console.log('pieceMoved');
    console.log(pieceMoved);
    if (pieceMoved.constructor.name !== 'Pawn') { // no prefix letter needed for pawn
        notation = pieceMoved.getFENcode().toUpperCase() + notation;
    }
    else {
        // Only adds pawn col for captures e.g. exd5
        if (newSquare || enPessantUsed) {
            notation = cols[oldCol] + notation;
        }
    }
    return notation;
}

/* Converts a board to FEN */
function convertToFen(board, colorTurn) {
    let pos = '';
    // 1. Adds position
    for (let row = 0; row < 8; row++) {
        let rowVal = '';
        let runningBlank = 0;
        for (let col = 0; col < 8; col++) {
            if (board[row][col]) {
                if (runningBlank > 0) {
                    rowVal += runningBlank;
                    runningBlank = 0;
                }
                rowVal += board[row][col].getFENcode();
            }
            else {
                runningBlank++;
            }
        }
        if (runningBlank > 0) {
            rowVal += runningBlank;
        }
        pos += rowVal + (row < 7 ? '/' : ' ');
    }
    pos += colorTurn === 'white' ? 'w' : 'b'; // 2. Adds color turn
    return pos;
}

function convertFromFEN(fen) {
    let board = [];
}

export { flipBoard, convertToStandard, convertToFen, convertFromFEN };