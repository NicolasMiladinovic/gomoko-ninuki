import React from 'react';

const Piece = ({ value, onClick, disabled }) => {
    return (
        <div 
            className={`piece-container ${disabled ? 'disabled' : ''}`} 
            onClick={disabled ? undefined : onClick}
        >
            <div className='piece'>
                {!value ? null :
                    value === 1 ?
                        <div className='blackPiece' /> : <div className='whitePiece' />
                }
            </div>
            <span className='horizontal'></span>
            <span className='vertical'></span>
        </div>
    );
};

export default Piece;
