import React from 'react';

const IPhoneSpinner = () => (
    <svg width="30px" height="30px" viewBox="0 0 50 50">
        <circle fill="none" stroke="#000" strokeWidth="4" strokeDasharray="157 57" strokeDashoffset="57" strokeLinecap="round" cx="25" cy="25" r="20">
            <animateTransform attributeName="transform" type="rotate" from="0 25 25" to="360 25 25" dur="0.8s" repeatCount="indefinite" />
        </circle>
    </svg>
);

export default IPhoneSpinner;
