import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import { Board } from './board.js';

function Square(props) {
    return (
        <div className={'square'} onClick={() => props.onClick()}>
            {props.piece}
        </div>
    );
}

/* A row of Squares */
function Row(props) {
    const rowPieces = props.pieces;
    let row = [];
    for (let i = 0; i < 8; i++) {
        row.push(<Square 
                    key={i} 
                    onClick={() => props.onClick(i)}
                    piece={rowPieces[i]}
                />);
    }
    return <div className='row'>{row}</div>;
}

class Piece extends React.Component {
    constructor(props) {
        super(props);
    }

    // Makes sure piece did not take same-color piece or a king
    checkValidCapture(newCol, newRow, board, color) {
        let capturedPiece = board[newRow][newCol];
        console.log(capturedPiece);
        if (capturedPiece) { // doesn't run if capturedPiece is null
            if (capturedPiece.props.color === color) { // checks same-color capture
                console.log("yo");
                return false;
            }
        
            console.log(capturedPiece.type.name);
            if (capturedPiece.type.name === "King") { // no king captures
                return false;
            }
        }
        return true;
    }

    isPossibleMove(oldX, oldY, newCol, newRow, board, color) { // TODO : make oldX and oldY props
        return this.checkValidCapture(newCol, newRow, board, color);
    }

    /* Returns whether a piece (Rook or Queen) jumped over any other pieces when moved sideways */
    checkSideJump(oldCol, oldRow, newCol, newRow, board) {
        if (oldCol === newCol) { // vertical movement
            let movingUp = newRow < oldRow; // checks direction of vertical move
            let i = movingUp ? oldRow-1 : oldRow+1;
            // condition is > and not >= since last if there is piece on newRow, move is a capture
            let condition = movingUp ? i > newRow : i < newRow; 
            while (condition) {
                console.log(i);
                console.log(newRow);
                if (board[i][newCol]) { return false; }
                if (movingUp) { i--; }
                else          { i++; }
                condition = movingUp ? i > newRow : i < newRow; // makes sure i hasn't reached newRow
            }
        }
        else if (newRow === oldRow) { // horizontal movement
            let movingRight = newCol > oldCol; // checks direction of horizontal move
            let i = movingRight ? oldCol+1 : oldCol-1;
            let condition = movingRight ? i < newCol : i > newCol;
            while (condition) {
                if (board[newRow][i]) { return false; }
                if (movingRight) { i++; }
                else             { i--; }
                condition = movingRight ? i < newCol : i > newCol; // makes sure i hasn't reached newCol
            }
        }
        else { // neither vertical nor horizontal
            return false;
        }
        return true;
    }

    /* Returns whether a piece (Bishop or Queen) jumped over any other pieces when moved diagonally */
    checkDiagJump(oldCol, oldRow, newCol, newRow, board) {
        if (Math.abs(oldCol-newCol) === Math.abs(oldRow-newRow)) { // valid diagonal movement
            let movingUp = newRow < oldRow;
            let movingRight = newCol > oldCol;
            let rowCount = movingUp ? oldRow-1 : oldRow+1;
            let colCount = movingRight ? oldCol+1 : oldCol-1;
            // Only need one condition since row and col displacement are same
            let condition = movingUp ? rowCount > newRow : rowCount < newRow; 
            while (condition) {
                if (board[rowCount][colCount]) { return false; }
                if (movingRight) { colCount++; }
                else             { colCount--; }
                if (movingUp)    { rowCount--; }
                else             { rowCount++; }
                condition = movingUp ? rowCount > newRow : rowCount < newRow;
            }
        }
        else { // not a diagonal movement
            return false;
        }
        return true;
    }
}

class Pawn extends Piece {
    constructor(props) {
        super(props);
        let numMoves = 0;
    }

    getMoves() {
        return this.numMoves;
    }

    isPossibleMove(oldCol, oldRow, newCol, newRow, board, color) { // TODO : make oldX and oldY props
        if (!super.checkValidCapture(newCol, newRow, board, color)) {
            return false; 
        }
        let oldNewPosPiece = board[newRow][newCol]; // current piece at new pos

        // if (movesMade === 0) {
        //     // TODO : add first move functionality
        // }
        if (newCol === oldCol) { 
            // Moves pawn up one square - valid if no piece is there
            let rightDirection;
            if (color === 'white') { rightDirection = newRow===oldRow-1; }
            else                   { rightDirection = newRow===oldRow+1; }
            return rightDirection && oldNewPosPiece == null;
        }
        else {
            // diagonal move - must be a piece being captured and can't be a King
            // TODO : add in checkKingCapture
            // TODO : remove capturing pieces of same color
            // return oldNewPosPiece !== null && !checkKingCapture(newCol, newRow, board);
            let leftDiagonalMove; 
            if (color === 'white') {
                leftDiagonalMove = newCol === oldCol-1 && newRow === oldRow-1;
            }
            else {
                leftDiagonalMove = newCol === oldCol-1 && newRow === oldRow+1;
            }
            if (leftDiagonalMove) { return oldNewPosPiece !== null; }

            let rightDiagonalMove;
            if (color === 'white') {
                rightDiagonalMove = newCol === oldCol+1 && newRow === oldRow-1; 
            }
            else {
                rightDiagonalMove = newCol === oldCol+1 && newRow === oldRow+1; 
            }
            if (rightDiagonalMove) { return oldNewPosPiece !== null; }

            return false; // no other possible moves
        }
    }

    // isPossibleMove(oldX, oldY, newX, newY, board) { // TODO : make oldX and oldY props
    //     console.log("ipm");
    //     let leftDiagonalMove = newX === oldX-1 && newY === oldY-1;
    //     let rightDiagonalMove = newX === oldX+1 && newY === oldY-1; 
    //     // Piece oldNewPosPiece = board.get(newX, newY);
    //     let oldNewPosPiece = board[newX][newY]; // current piece at new pos

    //     // if (movesMade === 0) {
    //     //     // TODO : add first move functionality
    //     // }
    //     if (newX === oldX && newY === oldY-1) { 
    //         // Moves pawn up one square - valid if no piece is there
    //         return oldNewPosPiece === null;
    //     }
    //     else if (leftDiagonalMove || rightDiagonalMove) {
    //         // diagonal move - must be a piece being captured and can't be a King
    //         // TODO : add in checkKingCapture
    //         // return oldNewPosPiece !== null && !checkKingCapture(newX, newY, board);
    //         return oldNewPosPiece !== null;
    //     }
    //     return false; // no other possible moves 
    // }

    render() {
        return <img 
                    src={require("./Pieces/" + this.props.color + "_pawn.png")} 
                    alt={this.props.color + "pawn"}
                    // isPossibleMove={(a, b, c, d, e) => this.isPossibleMove(a, b, c, d, e)}
                />;
    }
}

class Rook extends Piece {
    constructor(props) {
        super(props);
    }

    hello() {
        console.log('hello');
    }

    // TODO : do not remove color - needed to check no capture of same color
    isPossibleMove(oldCol, oldRow, newCol, newRow, board, color) {
        // TODO : check no king capture
        // Checks for valid capture
        if (!super.checkValidCapture(newCol, newRow, board, color)) {
            return false; 
        }
        return this.checkSideJump(oldCol, oldRow, newCol, newRow, board);
    }

    render() {
        return <img 
                    src={require("./Pieces/" + this.props.color + "_rook.png")} 
                    alt={this.props.color + "rook"}
                />;
    }
}

class Knight extends Piece {
    constructor(props) {
        super(props);
    }

    isPossibleMove(oldCol, oldRow, newCol, newRow, board, color) { // TODO : make oldX and oldY props
        // Checks if either x or y-displacement is 2 and other displacement is 1 plus new square is not king
        // TODO : add checkKingCapture
        // TODO : remove capturing pieces of same color
        if (!super.checkValidCapture(newCol, newRow, board, color)) {
            return false; 
        }
        let moveVertical = Math.abs(newCol-oldCol) === 1 && Math.abs(newRow-oldRow) === 2;
        let moveHorizontal = Math.abs(newCol-oldCol) === 2 && Math.abs(newRow-oldRow) === 1;
        // return !checkKingCapture(newCol, newY, board) && (moveVertical || moveHorizontal);
        return moveVertical || moveHorizontal;
    }

    render() {
        return <img 
                    src={require("./Pieces/" + this.props.color + "_knight.png")} 
                    alt={this.props.color + "knight"}
                />;
    }
}

class Bishop extends Piece {
    constructor(props) {
        super(props);
    }

    isPossibleMove(oldCol, oldRow, newCol, newRow, board, color) {
        // TODO : check no king capture
        // Checks whether bishop made valid diagonal move
        if (!super.checkValidCapture(newCol, newRow, board, color)) {
            return false; 
        }
        return this.checkDiagJump(oldCol, oldRow, newCol, newRow, board);
    }

    render() {
        return <img 
                    src={require("./Pieces/" + this.props.color + "_bishop.png")} 
                    alt={this.props.color + "bishop"}
                />;
    }
}

class Queen extends Piece {
    constructor(props) {
        super(props);
    }

    isPossibleMove(oldCol, oldRow, newCol, newRow, board, color) {
        // TODO : check no king capture
        // Checks whether queen made side or diag move and calls func
        if (!super.checkValidCapture(newCol, newRow, board, color)) {
            return false; 
        }
        if (Math.abs(oldCol-newCol) === Math.abs(oldRow-newRow)) { // diagonal move
            return this.checkDiagJump(oldCol, oldRow, newCol, newRow, board);
        }
        else {
            return this.checkSideJump(oldCol, oldRow, newCol, newRow, board);
        }
    }

    render() {
        return <img 
                    src={require("./Pieces/" + this.props.color + "_queen.png")} 
                    alt={this.props.color + "queen"}
                />;
    }
}

class King extends Piece {
    constructor(props) {
        super(props);
    }

    isPossibleMove(oldCol, oldRow, newCol, newRow, board, color) { // TODO : make oldX and oldY props
        // Possible moves - King moved 1 square in any direction
        // TODO : also add no king capture and no moving next to opponent king
        if (!super.checkValidCapture(newCol, newRow, board, color)) {
            return false; 
        }
        return Math.abs(newCol - oldCol) <= 1 && Math.abs(newRow - oldRow) <= 1;
    }

    render() {
        return <img 
                    src={require("./Pieces/" + this.props.color + "_king.png")} 
                    alt={this.props.color + "king"}
                />
    }
}

// function Rook(props) {
//     return <img 
//                 src={require("./Pieces/" + props.color + "_rook.png")} 
//                 alt={props.color + "rook"}
//             />;
// }

// function Knight(props) {
//     return <img 
//                 src={require("./Pieces/" + props.color + "_knight.png")} 
//                 alt={props.color + "knight"}
//             />;
// }

// function Bishop(props) {
//     return <img 
//                 src={require("./Pieces/" + props.color + "_bishop.png")} 
//                 alt={props.color + "bishop"}
//             />;
// }

// function Queen(props) {
//     return <img 
//                 src={require("./Pieces/" + props.color + "_queen.png")} 
//                 alt={props.color + "queen"}
//             />;
// }

// function King(props) {
//     return <img 
//                 src={require("./Pieces/" + props.color + "_king.png")} 
//                 alt={props.color + "king"}
//             />;
// }

class Game extends React.Component {

}


let r = new Rook('white');
console.log(r);
r.hello();
r.render();


export { Pawn, Knight, Bishop, Rook, Queen, King, Row };


ReactDOM.render(
    <Board />,
    document.getElementById("root")
);