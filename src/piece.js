import React from 'react';

class Piece {
    constructor(color) {
        this.color = color;
        this.firstMoveMade = false;
    }

    getColor() {
        return this.color;
    }

    getFirstMoveMade() {
        return this.firstMoveMade;
    }

    setFirstMoveMade(newVal) {
        this.firstMoveMade = newVal;
    }

    /* Checks if piece took a same-color piece or a king */
    checkValidCapture(newCol, newRow, board) {
        let capturedPiece;
        try {
            capturedPiece = board[newRow][newCol];
        }
        catch (e) {
            console.log(e);
            return false; // newRow is out of bounds for board
        }
        if (capturedPiece === undefined) { // newCol is out of bounds for board
            return false;
        }
        else if (capturedPiece) { // doesn't run if capturedPiece is null or undefined
            if (capturedPiece.getColor() === this.color) { // checks same-color capture
                return false;
            }
        
            // TODO: uncomment below
            // if (capturedPiece.constructor.name === "King") { // no king captures
            //     return false;
            // }
        }
        return true;
    }

    /* Checks if a move is possible and actually legal i.e. not moving into check */
    // checkLegalMove(oldCol, oldRow, newCol, newRow, board) {
    checkLegalMove(oldCol, oldRow, newCol, newRow, board, colorMadeMove, kingCol, kingRow) {
        // TODO : also add king not going through check when castling
        // let copyBoard = board.slice(); // TODO : THIS NEEDS TO BE A DEEP NOT SHALLOW COPY
        // let copyBoard = JSON.parse(JSON.stringify(board)); // TODO : doesn't copy methods
        let copyBoard = board.map(a => Object.assign({}, a)); // deep copy required
        copyBoard[newRow][newCol] = copyBoard[oldRow][oldCol]
        copyBoard[oldRow][oldCol] = null;
        return !this.checkIfInCheck(copyBoard, colorMadeMove, kingCol, kingRow);
    }

    /* TODO : Checks if in check */
    checkIfInCheck(board, colorToCheck, kingCol, kingRow) {
        // console.log(kingCol);
        // console.log(kingCol);
        for (let row = 0; row < 8; row++) {
            for (let col = 0; col < 8; col++) {
                let piece = board[row][col];
                if (piece && piece.getColor() !== colorToCheck) {
                    // console.log(piece);
                    // console.log(piece.isPossibleMove(col, row, kingCol, kingRow, board));
                    if (piece.isPossibleMove(col, row, kingCol, kingRow, board)) {
                        return true;
                    }
                }
            }
        }
        return false;
    }

    /* Returns whether a piece (Rook or Queen) jumped over any other pieces when moved sideways */
    checkSideJump(oldCol, oldRow, newCol, newRow, board) {
        if (oldCol === newCol) { // vertical movement
            let movingUp = newRow < oldRow; // checks direction of vertical move
            let i = movingUp ? oldRow-1 : oldRow+1;
            // condition is > and not >= since last if there is piece on newRow, move is a capture
            let condition = movingUp ? i > newRow : i < newRow; 
            while (condition) {
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
    /* Generates an array of all possible moves */
    calculateAllPosMoves(col, row, board) {
        let posNeg = this.getColor() === 'white' ? -1 : 1;
        let possibleMoves = 
            [
                [col, row+2*posNeg],      // Moving up 2 squares
                [col, row+posNeg],        // Moving up 1 square
                [col+posNeg, row+posNeg], // Moving diagonally right
                [col-posNeg, row+posNeg]  // Moving diagonally left
            ];
        let actualPosMoves = [];
        for (let i = possibleMoves.length-1; i >= 0; i--) {
            let currentCheck = possibleMoves[i]; 
            console.log(currentCheck);
            if (this.isPossibleMove(col, row, currentCheck[0], currentCheck[1], board)) {
                actualPosMoves.push(currentCheck);
            }
        }
        return actualPosMoves;
    }

    isPossibleMove(oldCol, oldRow, newCol, newRow, board) {
        if (!super.checkValidCapture(newCol, newRow, board)) {
            return false; 
        }
        let oldNewPosPiece = board[newRow][newCol]; // current piece at new pos
        // console.log(oldNewPosPiece)

        if (newCol === oldCol) { 
            // Moves pawn up one square - valid if no piece is there
            let rightDirection;
            if (this.getColor() === 'white') { rightDirection = newRow===oldRow-1; }
            else                             { rightDirection = newRow===oldRow+1; }
            // Checks for first move - pawn can move up 2 squares
            if (!rightDirection && !this.getFirstMoveMade()) {
                // this.setFirstMoveMade(true); // TODO : move this out and have it so firstMoveMade is only changed after legal move is checked
                if (this.getColor() === 'white') { rightDirection = newRow===oldRow-2; }
                else                             { rightDirection = newRow===oldRow+2; }
            }
            return rightDirection && !oldNewPosPiece; // TODO : change to !oldNewPosPiece
        }
        else {
            // diagonal move - must be a piece being captured and can't be a King
            let leftDiagonalMove; 
            if (this.getColor() === 'white') {
                leftDiagonalMove = newCol === oldCol-1 && newRow === oldRow-1;
            }
            else {
                leftDiagonalMove = newCol === oldCol-1 && newRow === oldRow+1;
            }
            if (leftDiagonalMove) { return oldNewPosPiece !== null; }

            let rightDiagonalMove;
            if (this.getColor() === 'white') {
                rightDiagonalMove = newCol === oldCol+1 && newRow === oldRow-1; 
            }
            else {
                rightDiagonalMove = newCol === oldCol+1 && newRow === oldRow+1; 
            }
            if (rightDiagonalMove) { return oldNewPosPiece !== null; }

            return false; // no other possible moves
        }
    }

    render() {
        return <img 
                    src={require("./Pieces/" + this.getColor() + "_pawn.png")} 
                    alt={this.getColor() + "pawn"}
                />;
    }
}

class Rook extends Piece {
    calculateAllPosMoves(col, row, board) {
        let posMoves = [
            [col+1, row],
            [col-1, row],
            [col, row+1],
            [col, row-1]
        ];
        let actualPosMoves = [];
        for (let i = 3; i >= 0; i--) {
            let c = posMoves[i][0], r=posMoves[i][1];
            console.log("c" + c);
            console.log("r" + r);
            while (this.isPossibleMove(col, row, c, r, board)) {
                console.log("c" + c);
                console.log("r" + r);
                actualPosMoves.push([c, r]);
                if      (c > col) { c++; }
                else if (c < col) { c--; }
                if      (r > row) { r++; }
                else if (r < row) { r--; }
            }
        }
        return actualPosMoves;
    }

    // TODO : do not remove color - needed to check no capture of same color
    isPossibleMove(oldCol, oldRow, newCol, newRow, board) {
        // TODO : check no king capture
        // Checks for valid capture
        if (!super.checkValidCapture(newCol, newRow, board)) {
            console.log("not valid cap");
            return false; 
        }
        return this.checkSideJump(oldCol, oldRow, newCol, newRow, board);
    }

    render() {
        return <img 
                    src={require("./Pieces/" + this.getColor() + "_rook.png")} 
                    alt={this.getColor() + "rook"}
                />;
    }
}

class Knight extends Piece {
    calculateAllPosMoves(col, row, board) {
        let posMoves = [
            [col+2, row+1],
            [col+2, row-1],
            [col-2, row+1],
            [col-2, row-1],
            [col+1, row+2],
            [col-1, row+2],
            [col+1, row-2],
            [col-1, row-2],
        ]
        let actualPosMoves = [];
        for (let i = 3; i >= 0; i--) {
            let c = posMoves[i][0], r=posMoves[i][1];
            console.log("c" + c);
            console.log("r" + r);
            if (this.isPossibleMove(col, row, c, r, board)) {
                console.log("c" + c);
                console.log("r" + r);
                actualPosMoves.push([c, r]);
            }
        }
        return actualPosMoves;
    }

    isPossibleMove(oldCol, oldRow, newCol, newRow, board) {
        // Checks if either x or y-displacement is 2 and other displacement is 1 plus new square is not king
        // TODO : add checkKingCapture
        // TODO : remove capturing pieces of same color
        if (!super.checkValidCapture(newCol, newRow, board)) {
            console.log("false cap")
            return false; 
        }
        let moveVertical = Math.abs(newCol-oldCol) === 1 && Math.abs(newRow-oldRow) === 2;
        let moveHorizontal = Math.abs(newCol-oldCol) === 2 && Math.abs(newRow-oldRow) === 1;
        // return !checkKingCapture(newCol, newY, board) && (moveVertical || moveHorizontal);
        return moveVertical || moveHorizontal;
    }

    render() {
        return <img 
                    src={require("./Pieces/" + this.getColor() + "_knight.png")} 
                    alt={this.getColor() + "knight"}
                />;
    }
}

class Bishop extends Piece {
    calculateAllPosMoves(col, row, board) {
        let posMoves = [
            [col+1, row+1],
            [col+1, row-1],
            [col-1, row+1],
            [col-1, row-1]
        ]
        let actualPosMoves = [];
        for (let i = 3; i >= 0; i--) {
            let c = posMoves[i][0], r=posMoves[i][1];
            console.log("c" + c);
            console.log("r" + r);
            while (this.isPossibleMove(col, row, c, r, board)) {
                console.log("c" + c);
                console.log("r" + r);
                actualPosMoves.push([c, r]);
                if      (c > col) { c++; }
                else if (c < col) { c--; }
                if      (r > row) { r++; }
                else if (r < row) { r--; }
            }
        }
        return actualPosMoves;
    }

    isPossibleMove(oldCol, oldRow, newCol, newRow, board) {
        // TODO : check no king capture
        // Checks whether bishop made valid diagonal move
        if (!super.checkValidCapture(newCol, newRow, board)) {
            return false; 
        }
        return this.checkDiagJump(oldCol, oldRow, newCol, newRow, board);
    }

    render() {
        return <img 
                    src={require("./Pieces/" + this.getColor() + "_bishop.png")} 
                    alt={this.getColor() + "bishop"}
                />;
    }
}

class Queen extends Piece {
    isPossibleMove(oldCol, oldRow, newCol, newRow, board) {
        // TODO : check no king capture
        // Checks whether queen made side or diag move and calls func
        if (!super.checkValidCapture(newCol, newRow, board)) {
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
                    src={require("./Pieces/" + this.getColor() + "_queen.png")} 
                    alt={this.getColor() + "queen"}
                />;
    }
}

class King extends Piece {
    isPossibleMove(oldCol, oldRow, newCol, newRow, board) {
        // Possible moves - King moved 1 square in any direction
        // TODO : also add no king capture and no moving next to opponent king
        if (!super.checkValidCapture(newCol, newRow, board)) {
            return false; 
        }
        // Checks for castling
        if (this.getFirstMoveMade) { // TODO : should be !getfirstmovemade 
            if (newCol === oldCol+2) { // kingside castle
                console.log("KINGSIDE");
                if (newRow !== oldRow) { return false; } // must be same row
                let cornerPiece = board[newRow][7];
                if (!cornerPiece || cornerPiece.constructor.name !== 'Rook' 
                    || cornerPiece.getFirstMoveMade()) {
                    return false; // must be a rook that hasn't moved
                }
                // Finally checks for side jumps
                console.log('King right: ' + this.checkSideJump(oldCol, oldRow, newCol, newRow, board));
                console.log('Rook right: ' + this.checkSideJump(7, oldRow, 5, newRow, board));
                return this.checkSideJump(oldCol, oldRow, newCol, newRow, board) &&
                       this.checkSideJump(7, oldRow, 5, newRow, board);
            }
            else if (newCol === oldCol-2) { // queenside castle
                if (newRow !== oldRow) { return false; } // must be same row
                let cornerPiece = board[newRow][0];
                if (!cornerPiece || cornerPiece.constructor.name !== 'Rook' 
                    || cornerPiece.getFirstMoveMade()) {
                    return false; // must be a rook that hasn't moved
                }
                // Finally checks for side jumps
                return this.checkSideJump(oldCol, oldRow, newCol, newRow, board) &&
                       this.checkSideJump(0, oldRow, 3, newRow, board);
            }
        }
        return Math.abs(newCol - oldCol) <= 1 && Math.abs(newRow - oldRow) <= 1;
    }

    render() {
        return <img 
                    src={require("./Pieces/" + this.getColor() + "_king.png")} 
                    alt={this.getColor() + "king"}
                />
    }
}

export { Pawn, Knight, Bishop, Rook, Queen, King };