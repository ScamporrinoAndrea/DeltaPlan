import React from 'react'
import PropTypes from 'prop-types';
import {ArrowRightCircle} from 'react-bootstrap-icons';

const HeaderCard = ({ title, icon }) => {
    return (
        <>
            <div className='d-flex justify-content-between align-items-center custom-card-header'>
                <div className='d-flex align-items-center'>
                    {icon()}
                    <span className='custom-card-title'> {title} </span>
                </div>
                <ArrowRightCircle  width="16" height="16" fill="currentColor"></ArrowRightCircle>
            </div>
            <hr style={{ margin: 0 }} />
        </>
    )
}

HeaderCard.propTypes = {
    title: PropTypes.string.isRequired,
    icon: PropTypes.func.isRequired,
};

export default HeaderCard