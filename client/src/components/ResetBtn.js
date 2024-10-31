import React from 'react';

const Piece = ({ value, onClick }) => {
    return (
        <div className="reset-btn" onClick={onClick}>
           Reset board
        </div>
    );
};

export default Piece;
