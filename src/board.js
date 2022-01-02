import React from 'react';
import { Pawn, Knight, Bishop, Rook, Queen, King} from './piece.js';

function Square(props) {
    // console.log(props.className);
    // console.log(props.piece);
    return (
        <div className={props.className} onClick={() => props.onClick()}>
            {props.piece}
        </div>
    );
}

/* Initial square classes - all 'square' */
function initialSqClasses() {
    let sqClasses = [];
    const oneRow = Array(8).fill('square');
    for (let i = 0; i < 8; i++) {
        sqClasses.push(oneRow.slice()); // slice needed or else all will refer to same arr
    }
    // const whiteClass = 'square-white';
    // const blueClass = 'square-blue';
    // let evenRow = [];
    // for (let i = 0; i < 8; i++) {
    //     if (i % 2 === 0) { evenRow.push(whiteClass); }
    //     else             { evenRow.push(blueClass); }
    // }
    // let oddRow = evenRow.slice(1, 8);
    // oddRow.push(whiteClass);
    // for (let i = 0; i < 8; i++) {
    //     if (i % 2 == 0) { sqClasses.push(evenRow); }
    //     else            { sqClasses.push(oddRow); }
    // }
    return sqClasses;
}

/* A row of Squares */
// function Row(props) {
//     const rowPieces = props.pieces;
//     let row = [];
//     let className;
//     for (let i = 0; i < 8; i++) {
//         console.log(props.rightRow);
//         if (props.rightRow && i === props.currentPieceCol) {
//             console.log('yo');
//             className = "piece-highlight";
//         }
//         else {
//             className = "square"; // needed here to offset above
//         }
//         row.push(<Square 
//                     key={i} 
//                     onClick={() => props.onClick(i)}
//                     className={className}
//                     piece={rowPieces[i] ? rowPieces[i].render() : null}
//                 />);
//     }
//     return <div className='row'>{row}</div>;
// }

/* Returns array with initial board */
function intialBoard() {
    let board = [];
    for (let i = 0; i < 8; i++) {
        board.push(Array(8).fill(null));
    }
    // Row 1
    // Black rooks
    board[0][0] = new Rook('black');
    board[0][7] = new Rook("black");
    // Black knights
    board[0][1] = new Knight("black");
    board[0][6] = new Knight("black");
    // Black bishops
    board[0][2] = new Bishop("black");
    board[0][5] = new Bishop("black");
    // Black Queen
    board[0][3] = new Queen("black");
    // Black King
    board[0][4] = new King("black");
    // Row 2
    for (let i = 0; i < 8; i++) {
        board[1][i] = new Pawn("black"); // Black pawns
    }

    // Row 7
    for (let i = 0; i < 8; i++) {
        board[6][i] = new Pawn("white"); // White pawns
    }
    // Row 8
    // White rooks
    board[7][0] = new Rook("white");
    board[7][7] = new Rook("white");
    // White knights
    board[7][1] = new Knight("white");
    board[7][6] = new Knight("white");
    // White bishops
    board[7][2] = new Bishop("white");
    board[7][5] = new Bishop("white");
    // White Queen
    board[7][3] = new Queen("white");
    // White King
    board[7][4] = new King("white");

    return board;
}

class Board extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            board: intialBoard(),
            squareClasses: initialSqClasses(),
            playerTurn: 'white',
            whiteKingRow: 7, whiteKingCol: 4,
            blackKingRow: 0, blackKingCol: 4,
            currentPiece: null,
            currentPieceRow: -1, currentPieceCol: -1
        };
    }

    handleClick(row, col) {
        let selectedSquare = this.state.board[row][col];

        if (!this.state.currentPiece) { // A piece is clicked on to move
            // Makes sure square contains a piece and is of right color
            if (selectedSquare && selectedSquare.getColor() === this.state.playerTurn) {
                // console.log(selectedSquare);
                // console.log(selectedSquare.calculateAllPosMoves(col, row, this.state.board));
                // TODO : below code creates shallow copy, which mutates arrays instead of copies
                let newSqClasses = this.state.squareClasses.slice();
                newSqClasses[row][col] = 'piece-highlight';
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
                let newSquares = this.state.board.slice();
                let currentP = this.state.currentPiece;
                let kingCol, kingRow;

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
                
                if (currentP.isPossibleMove(oldCol, oldRow, col, row, newSquares) && 
                    currentP.checkLegalMove(oldCol, oldRow, col, row, newSquares,
                    this.state.playerTurn, kingCol, kingRow)) 
                {
                    currentP.setFirstMoveMade(true); // Used for pawns and castling
                    // console.log(currentP.checkLegalMove(oldCol, oldRow, col, row, newSquares));
                    // console.log(currentP.checkLegalMove(oldCol, oldRow, col, row, newSquares,
                    //             this.state.playerTurn, kingCol, kingRow));
                    console.log("executing");
                    newSquares[row][col] = currentP;
                    newSquares[oldRow][oldCol] = null;
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
                        }
                        else if (col === oldCol-2) { // queenside castling
                            newSquares[row][0].setFirstMoveMade(true);
                            newSquares[row][3] = newSquares[row][0]; // moves rook
                            newSquares[row][0] = null;
                        }
                    }
                    this.setState({
                        board: newSquares,
                        currentPiece: null,
                        playerTurn: this.state.playerTurn === 'white' ? 'black' : 'white'
                    });
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

    // render() {
    //     let rows = [];
    //     for (let i = 0; i < 8; i++) {
    //         console.log(i);
    //         console.log(this.currentPieceRow);
    //         rows.push(<Row 
    //                     key={i} 
    //                     pieces={this.state.board[i]}
    //                     onClick={(col) => this.handleClick(i, col)}
    //                     rightRow = {i===this.state.currentPieceRow}
    //                     currentPieceCol={this.state.currentPieceCol}
    //                 />);
    //     }

    //     return (
    //         <div className='board'> {rows} </div>
    //     );
    // }

    renderSquare(row, col) {
        return (
            <Square 
                className={this.state.squareClasses[row][col]}
                onClick={() => this.handleClick(row, col)}
                piece={this.state.board[row][col] ? 
                       this.state.board[row][col].render() : null}
                key={row*8 + col}
            />
        )
    }

    render() {
        let rows = [];
        for (let i = 0; i < 8; i++) {
            let row = [];
            for (let j = 0; j < 8; j++) {
                row.push(this.renderSquare(i, j));
            }
            rows.push(
                <div className='row' key={i}>
                    {row}
                </div>
            )
        }
        return (
            <div className='board'> {rows} </div>
        )
    }
}


export { Board };