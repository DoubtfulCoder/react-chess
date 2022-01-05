import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import { Board, initialSqClasses, initialBoard, stalemateBoard } from './board.js';
import { flipBoard, convertToStandard, convertToFen, convertFromFEN } from './notation.js';
import { Knight, Bishop, Rook, Queen } from './piece.js';

/* Scrolls to bottom of move-history div */
function scrollToBottomHist() {
    const scrollingElement = document.querySelector('.move-history');
    scrollingElement.scrollTop = scrollingElement.scrollHeight -
                                    scrollingElement.clientHeight;
}

// TODO : delete this method from Piece?
function checkIfInCheck(board, colorToCheck, kingCol, kingRow) {
    for (let row = 0; row < 8; row++) {
        for (let col = 0; col < 8; col++) {
            let piece = board[row][col];
            if (piece && piece.getColor() !== colorToCheck) {
                if (piece.isPossibleMove(col, row, kingCol, kingRow, board)) {
                    return true;
                }
            }
        }
    }
    return false;
}

/* Checks if castle was legal - did not move through a check */
function checkLegalCastle(oldCol, oldRow, col, row, newSquares, 
                          playerTurn, kingCol, kingRow) 
{
    const newCol = col > oldCol ? oldCol+1 : oldCol-1;
    console.log("newCol" + newCol);
    console.log(newSquares[oldRow][oldCol].checkLegalMove(
        oldCol, oldRow, newCol, oldRow, newSquares, 
        playerTurn, kingCol, kingRow
    ));
    return newSquares[oldRow][oldCol].checkLegalMove(
        oldCol, oldRow, newCol, oldRow, newSquares, 
        playerTurn, kingCol, kingRow
    );
}


/* Returns game status: check, checkmate, stalemate, or normal */
function checkGameStatus(board, colorTurn, kingCol, kingRow) {
    console.log("kingcol" + kingCol);
    console.log("kingrow" + kingRow);
    let check = checkIfInCheck(board, colorTurn, kingCol, kingRow);
    for (let i = 0; i < 8; i++) {
        for (let j = 0; j < 8; j++) {
            const piece = board[i][j];
            if (piece && piece.getColor() === colorTurn) { // same-color piece
                // console.log('piece');
                // console.log(piece);
                const pieceMoves = piece.calculateAllPosMoves(j, i, board);
                for (const move of pieceMoves) {
                    let newKingCol = kingCol, newKingRow = kingRow;
                    if (piece.constructor.name === 'King') {
                        console.log('move0' + move[0]);
                        console.log('move1' + move[1]);
                        newKingCol = move[0];
                        newKingRow = move[1];
                    }
                    if (piece.checkLegalMove(j, i, move[0], move[1], board, colorTurn, newKingCol, newKingRow)) {
                        // Legal move available so guranteed no checkmate/stalemate
                        return check ? 'check' : 'normal';
                    }
                    else {
                        console.log("kingcol" + newKingCol);
                        console.log("kingrow" + newKingRow);
                    }
                }
            }
        }
    }
    // No possible moves so either checkmate or stalemate
    return check ? 'checkmate' : 'stalemate';
}

class Game extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            history: [initialBoard()],
            // history: [stalemateBoard()],
            gameOver: false, gameStatus: '',
            moves: [],
            moveNumber: 1,
            squareClasses: initialSqClasses(),
            playerTurn: 'white',
            whiteKingRow: 7, whiteKingCol: 4,
            blackKingRow: 0, blackKingCol: 4,
            // whiteKingRow: 1, whiteKingCol: 4,
            // blackKingRow: 0, blackKingCol: 0,

            currentPiece: null,
            currentPieceRow: -1, currentPieceCol: -1,
            whitePromote: false, blackPromote: false,
            promoteRow: 0, promoteCol: 0,
            enPessantAvail: false,
            enPessantRow: 0, enPessantCol: 0, 
            fiftyMoveRuleCounter: 0,
            whiteKingSideCastle: true, whiteQueenSideCastle: true,
            blackKingSideCastle: true, blackQueenSideCastle: true,
        };
    }

    handleClick(row, col) {
        if (!this.state.whitePromote && !this.state.blackPromote) {
            const newHistory = this.state.history.slice(0, this.state.moveNumber);
            let board = this.state.history[this.state.moveNumber-1]
                        .map(a => Object.assign({}, a)); // creates a deep copy
            let selectedSquare = board[row][col];

            if (!this.state.currentPiece) { // A piece is clicked on to move
                // Makes sure square contains a piece and is of right color
                if (selectedSquare && selectedSquare.getColor() === this.state.playerTurn) {
                    // console.log(selectedSquare.calculateAllPosMoves(col, row, board));
                    // TODO : make a method calculateAllLegalMoves
                    let posMoves = selectedSquare.calculateAllPosMoves(col, row, board);
                    // TODO : below code creates shallow copy, which mutates arrays instead of copies
                    let newSqClasses = this.state.squareClasses.slice();
                    newSqClasses[row][col] = 'piece-clicked';
                    this.setState({ // Makes clicked piece currentPiece
                        currentPiece: selectedSquare,
                        currentPieceRow: row, currentPieceCol: col,
                    });
                }
            }
            else { // A piece is moved to new square
                let oldRow = this.state.currentPieceRow, oldCol = this.state.currentPieceCol;
                // TODO : if new piece is same color as current piece, then change current piece

                // Only moves to new square if a new square is selected
                if (oldRow !== row || oldCol !== col) {
                    let newSquares = board.slice();
                    let currentP = this.state.currentPiece;
                    let kingCol, kingRow; // used to track location of king for checks

                    if (currentP.constructor.name === 'King') {
                        kingCol = col;
                        kingRow = row;
                    }   
                    else {
                        kingCol = this.state.playerTurn === 'black' ? 
                                    this.state.blackKingCol : this.state.whiteKingCol;
                        kingRow = this.state.playerTurn === 'black' ? 
                                    this.state.blackKingRow : this.state.whiteKingRow;
                    }

                    // Checks if move was legal
                    let wasLegalMove = 
                        currentP.isPossibleMove(
                            oldCol, oldRow, col, row, newSquares, this.state.enPessantAvail,
                            this.state.enPessantCol, this.state.enPessantRow)
                        &&
                        currentP.checkLegalMove(oldCol, oldRow, col, row, newSquares,
                            this.state.playerTurn, kingCol, kingRow
                    );

                    // Checks for castling - legal move check is different
                    if (currentP.constructor.name === 'King' && wasLegalMove 
                        && (col===oldCol+2 || col===oldCol-2)) 
                    {
                        wasLegalMove = checkLegalCastle(
                            oldCol, oldRow, col, row, newSquares,
                            this.state.playerTurn, kingCol, kingRow
                        );
                    } 
                    
                    // TODO : move all this out?
                    if (wasLegalMove) {
                        let castlingMade = false;
                        let castlingSide = '';
                        let enPessant = false;
                        let enPessantUsed = false;
                        let wasPawnMove = false;
                        let wasCapture = newSquares[row][col];

                        currentP.setFirstMoveMade(true); // Used for pawns and castling
                        // Checks for castling so rook can be moved as well and updating king square
                        if (currentP.constructor.name === 'King') {
                            // TODO : check should be above checking legal move
                            if (this.state.playerTurn === 'white') {
                                this.setState({
                                    whiteKingCol: col, whiteKingRow: row, 
                                });
                            }
                            else {
                                this.setState({
                                    blackKingCol: col, blackKingRow: row, 
                                });
                            }
                            if (col === oldCol+2) { // kingside castling
                                newSquares[row][7].setFirstMoveMade(true);
                                newSquares[row][5] = newSquares[row][7]; // moves rook
                                newSquares[row][7] = null;
                                castlingMade = true;
                                castlingSide = 'k';
                            }
                            else if (col === oldCol-2) { // queenside castling
                                newSquares[row][0].setFirstMoveMade(true);
                                newSquares[row][3] = newSquares[row][0]; // moves rook
                                newSquares[row][0] = null;
                                castlingMade = true;
                                castlingSide = 'q';
                            }
                        }
                        // Checks for promotion and en pessant
                        else if (currentP.constructor.name === 'Pawn') {
                            wasPawnMove = true;
                            const direction = this.state.playerTurn === 'white' ? -1 : 1;
                            if (this.state.playerTurn === 'white') {
                                if (row === 0) { // white promote
                                    console.log("white promote");
                                    this.setState({
                                        whitePromote: true,
                                        promoteRow: row, promoteCol: col
                                    });
                                }
                            }
                            else if (this.state.playerTurn==='black') {
                                if (row === 7) { // black promote
                                    console.log("black promote");
                                    this.setState({
                                        blackPromote: true,
                                        promoteRow: row, promoteCol: col
                                    });
                                }
                            }
                            // Checks for en pessant available (pawn moved 2 squares up)
                            if (row === oldRow+2*direction) {
                                enPessant = true;
                            }
                            // Checks if en pessant was actually used
                            else if (this.state.enPessantAvail && col === this.state.enPessantCol && 
                                row === this.state.enPessantRow+direction && !newSquares[row][col]) 
                            {
                                enPessantUsed = true;
                            }
                        }

                        // Changes state for en-pessant
                        if (enPessant) {
                            this.setState({
                                enPessantAvail: true,
                                enPessantRow: row, enPessantCol: col, 
                            });
                        }
                        else {
                            this.setState({
                                enPessantAvail: false,
                            });
                        }

                        // Checks if en-pessant was actually used
                        if (enPessantUsed) {
                            // Removes en-pessant square
                            newSquares[this.state.enPessantRow][this.state.enPessantCol] = null;
                        }

                        // Converts move to standard notation
                        let newMoves = this.state.moves.slice(0, this.state.moveNumber-1);
                        newMoves.push(convertToStandard(oldCol, oldRow, col, row, board,
                            false, false, castlingMade, castlingSide, enPessantUsed
                        ));

                        // 50-move rule - checks for capture or pawn move
                        if (wasPawnMove || wasCapture || enPessantUsed) {
                            this.setState({
                                fiftyMoveRuleCounter: 0
                            });
                        }
                        else {
                            const newCounter = this.state.fiftyMoveRuleCounter+0.5;
                            this.setState({
                                fiftyMoveRuleCounter: newCounter
                            });
                            if (newCounter >= 50) {
                                console.log("DRAW BY 50-MOVE RULE!!");
                            }
                        }

                        // Moves piece
                        newSquares[row][col] = currentP;
                        newSquares[oldRow][oldCol] = null;

                        // TODO : Prints game status
                        // TODO : switch below to a method called oppositeTurn
                        const gameStatTurn = this.state.playerTurn === 'white' ? 'black' : 'white';
                        const gameStatKingCol = gameStatTurn === 'white' ? this.state.whiteKingCol : this.state.blackKingCol;
                        const gameStatKingRow = gameStatTurn === 'white' ? this.state.whiteKingRow : this.state.blackKingRow;
                        const newStatus = checkGameStatus(
                            newSquares, gameStatTurn, gameStatKingCol, gameStatKingRow
                        );
                        const newGameOver = (newStatus === 'checkmate' || newStatus === 'stalemate');

                        // Updates history and move number
                        newHistory.push(newSquares);
                        this.setState({
                            history: newHistory,
                            gameOver: newGameOver, gameStatus: newStatus,
                            moves: newMoves,
                            currentPiece: null,
                            playerTurn: this.state.playerTurn === 'white' ? 'black' : 'white',
                            moveNumber: this.state.moveNumber+1
                        });

                        // TODO : Scrolls move-history down
                        scrollToBottomHist();
                    }

                    else { // Invalid move deselects piece
                        this.setState({
                            currentPiece: null
                        });
                    }
                    // Removes piece highlight
                    let newSqClasses = this.state.squareClasses.slice();
                    newSqClasses[this.state.currentPieceRow][this.state.currentPieceCol] = 'square';

                }
                else { // Piece was moved to same square
                    let newSqClasses = this.state.squareClasses.slice();
                    newSqClasses[row][col] = 'square'; // removes highlight on piece
                    this.setState({
                        currentPiece: null
                    });
                }
            }
        }
    }

    /* Handles a promotion click */
    handlePromoteClick(piece) {
        const color = this.state.whitePromote ? 'white' : 'black';
        let newPiece;
        if      (piece === 'queen')  { newPiece = new Queen(color);  }
        else if (piece === 'rook')   { newPiece = new Rook(color);   }
        else if (piece === 'bishop') { newPiece = new Bishop(color); }
        else if (piece === 'knight') { newPiece = new Knight(color); }
        let newHist = this.state.history.slice(0, this.state.moveNumber);
        let board = newHist[newHist.length-1];
        board[this.state.promoteRow][this.state.promoteCol] = newPiece;
        // console.log(this.state.history[this.state.moveNumber-1][this.state.promoteRow][this.state.promoteCol]);

        console.log(piece);
        this.setState({
            whitePromote: false, blackPromote: false,
            history: newHist
        });
    }

    /* Goes to a certain move */
    goto(move) {
        this.setState({
            moveNumber: move,
            playerTurn: (move % 2 === 0) ? 'black' : 'white',
            // TODO : might also want to update sqClasses to remove any highlights
            currentPiece: null,
        });
    }

    // TODO : move these to separate file
    promotionPics(color) {
        // TODO : add keys
        let piecePics = [];
        piecePics.push(new Queen(color).render(() => this.handlePromoteClick('queen')));
        piecePics.push(new Rook(color).render(() => this.handlePromoteClick('rook')));
        piecePics.push(new Bishop(color).render(() => this.handlePromoteClick('bishop')));
        piecePics.push(new Knight(color).render(() => this.handlePromoteClick('knight')));
        return piecePics;
    }

    render() {
        const moves = this.state.history.map((position, move) => {
            // console.log(convertToFen(position, (move % 2 === 0) ? 'white' : 'black'));
            // console.log(position);
            // const desc = move ? "Go to move " + move : "Go to start";
            const desc = move ? this.state.moves[move-1] : "Start";
            // const classN = (move % 2 === 0) ? 'black-move' : 'white-move';

            // Scrolls to bottom of div (might fail for first rendering)
            // try {
            //     const scrollingElement = document.querySelector('.move-history');
            //     console.log(scrollingElement);
            //     scrollingElement.scrollTop = scrollingElement.scrollHeight - 
            //                                  scrollingElement.clientHeight;
            // }
            // catch(e) {}

            return (
                //<li key={move} className={classN}>
                    <button 
                        key={move} 
                        onClick={() => this.goto(move+1)} 
                        className={'move-button'}
                        id={desc==='Start' ? 'start-button' : move}
                    > 
                        {desc} 
                    </button>
                //</li>
            );
        });

        return (
            <div className='main'>
                <div className='container'>
                    <Board 
                        board={this.state.history[this.state.moveNumber-1]} 
                        squareClasses={this.state.squareClasses} 
                        handleClick={(row, col) => this.handleClick(row, col)}
                    />
                    <div className='history'>
                        <h2 className='history-title'>Game History</h2>
                        <div className='move-history'> {moves} </div>
                    </div>
                </div>

                {/* <button onClick={() => flipBoard(this.state.history[this.state.moveNumber-1])}>
                    Flip
                </button> */}
                <div 
                    className={(this.state.whitePromote ? 'visible ' : 'invisible ') + 'promotion'}
                    key='white-promote'
                    style={{
                        left: this.state.promoteCol * 60
                    }}
                >
                    {this.promotionPics("white")}
                </div>
                <div 
                    className={(this.state.blackPromote ? 'visible ' : 'invisible ') + 'promotion black-promote'}
                    key='black-promote'
                    style={{
                        left: this.state.promoteCol * 60,
                        top: 240
                    }}
                >
                    {this.promotionPics("black")}
                </div>
                <div className={(this.state.gameOver ? 'visible' : 'invisible') + ' game-status'}
                >
                    {printEndStatus(this.state.gameStatus, this.state.playerTurn)}
                    {/* {getWinner(this.state.gameStatus, this.state.playerTurn)}
                    {this.state.gameStatus} */}
                    {/* {if (this.game.gameStatus === 'checkmate') } */}
                </div>
                <button onClick={
                    () => this.setState({gameOver: false})
                }>X</button>
            </div>
        );
    }
}

function printEndStatus(gameStatus, playerTurn) {
    if (gameStatus === 'checkmate') {
        return `Checkmate!\n${capitalize(oppositeTurn(playerTurn))} wins`;
    }
    else {
        return `Draw by ${gameStatus}`;
    }
    // else if (gameStatus === 'fifty-move-rule') {
    //     return "Draw by 50-move rule";
    // }
    // else if (gameStatus === 'fifty-move-rule') {
    //     return "Draw by 50-move rule";
    // }
}

// function getWinner(status, turn) {
//     if (status === 'checkmate') {
//         return capitalize(oppositeTurn(turn)) + ' wins by ';
//     }
//     else {
//         return 'Draw by';
//     }
// }

function capitalize(word) {
    return word.charAt(0).toUpperCase() + word.slice(1);
}

function oppositeTurn(turn) {
    return turn === 'white' ? 'black' : 'white';
}

ReactDOM.render(
    <Game />,
    document.getElementById("root")
);


/**
 * TODO:
 * Validating check correctly
 * Board flipping
 * Standard notation (mostly done)
 * Numbers on game history
 * En pessant (done)
 * Promotion (done)
 * Checkmate / stalemate (done)
 * Possible moves (some bugs)
 * Game history (bugs) 
 * 3-move rep 
 * 50 move rule (done)
 */