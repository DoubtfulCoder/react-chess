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
    return sqClasses;
}

function stalemateBoard() {
    let board = [];
    for (let i = 0; i < 8; i++) {
        board.push(Array(8).fill(null));
    }
    board[0][0] = new King('black');
    board[1][0] = new Queen('black');
    board[1][3] = new Queen('white');
    board[1][4] = new King('white');
    return board;
}

/* Returns array with initial board */
function initialBoard() {
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
    renderSquare(row, col) {
        return (
            <Square 
                className={this.props.squareClasses[row][col]}
                onClick={() => this.props.handleClick(row, col)}
                piece={this.props.board[row][col] ? 
                       this.props.board[row][col].render() : null}
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


export { Board, initialSqClasses, initialBoard, stalemateBoard };