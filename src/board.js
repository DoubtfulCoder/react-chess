import React from 'react';
import { Pawn, Knight, Bishop, Rook, Queen, King, Row } from './index.js';

/* Returns array with initial board */
function intialBoard() {
    let board = [];
    for (let i = 0; i < 8; i++) {
        board.push(Array(8).fill(null));
    }
    // Row 1
    // Black rooks
    // TODO : change to this syntax: board[0][0] = <Rook color="black" />, board[0][7] = <Rook color="black" />;
    board[0][0] = <Rook color="black" />;
    board[0][7] = <Rook color="black" />;
    // Black knights
    board[0][1] = <Knight color="black" />;
    board[0][6] = <Knight color="black" />;
    // Black bishops
    board[0][2] = <Bishop color="black" />;
    board[0][5] = <Bishop color="black" />;
    // Black Queen
    board[0][3] = <Queen color="black" />;
    // Black King
    board[0][4] = <King color="black" />;
    // Row 2
    for (let i = 0; i < 8; i++) {
        board[1][i] = <Pawn color="black" numMoves={0} />; // Black pawns
    }

    // Row 7
    for (let i = 0; i < 8; i++) {
        board[6][i] = <Pawn color="white" />; // White pawns
    }
    // Row 8
    // White rooks
    board[7][0] = <Rook color="white" />;
    board[7][7] = <Rook color="white" />;
    // White knights
    board[7][1] = <Knight color="white" />;
    board[7][6] = <Knight color="white" />;
    // White bishops
    board[7][2] = <Bishop color="white" />;
    board[7][5] = <Bishop color="white" />;
    // White Queen
    board[7][3] = <Queen color="white" />;
    // White King
    board[7][4] = <King color="white" />;

    return board;
}

class Board extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            squares: intialBoard(),
            playerTurn: 'white',
            currentPiece: null,
            currentPieceRow: 0, currentPieceCol: 0
        };
    }

    handleClick(row, col) {
        let selectedSquare = this.state.squares[row][col];

        if (!this.state.currentPiece) { // A piece is clicked on to move
            // Makes sure square contains a piece and is of right color
            if (selectedSquare && selectedSquare.props.color === this.state.playerTurn) {
                this.setState({
                    currentPiece: selectedSquare,
                    currentPieceRow: row, currentPieceCol: col
                });
            }
        }
        else { // A piece is moved to new square
            let oldRow = this.state.currentPieceRow, oldCol = this.state.currentPieceCol;
            // TODO : if new piece is same color as current piece, then change current piece

            // Only moves to new square if a new square is selected
            if (oldRow !== row || oldCol !== col) {
                let newSquares = this.state.squares.slice();
                let currentP = this.state.currentPiece;
                console.log(this.state.currentPiece);
                
                if (currentP.type.prototype
                    .isPossibleMove(oldCol, oldRow, col, row, newSquares, currentP.props.color)) 
                {
                    newSquares[row][col] = currentP;
                    newSquares[oldRow][oldCol] = null;
                    this.setState({
                        squares: newSquares,
                        currentPiece: null,
                        playerTurn: this.state.playerTurn === 'white' ? 'black' : 'white'
                    });
                }

                else { // Invalid move deselects piece
                    this.setState({
                        currentPiece: null
                    });
                }
            }
            else { // Piece was moved to same square
                this.setState({
                    currentPiece: null
                });
            }
        }
    }

    render() {
        let rows = [];
        for (let i = 0; i < 8; i++) {
            rows.push(<Row 
                        key={i} 
                        pieces={this.state.squares[i]}
                        onClick={(col) => this.handleClick(i, col)}
                    />);
        }

        return (
            <div className='board'> {rows} </div>
        );
    }
}


export { Board };