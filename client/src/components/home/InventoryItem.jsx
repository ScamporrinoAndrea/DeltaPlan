import React, { useState, useEffect } from 'react'
import AnimateHeight from 'react-animate-height';


const InventoryItem = (props) => {
    const [height, setHeight] = useState(0);
    useEffect(() => {
        setHeight('auto');
    }, []);
    return (
        <AnimateHeight
            duration={1000}
            height={height}
        >
            <div style={{ paddingLeft: 3, paddingRight: 3, marginTop: 4 }}>
                <span>{props.name}</span>
                <span className='text-muted' style={{ float: 'right', fontWeight: 'lighter' }}>
                    {props.quantity}
                </span>
                <hr style={{ marginBottom: 10, marginTop: 10 }} />
            </div >
        </AnimateHeight >
    )
}

export default InventoryItem