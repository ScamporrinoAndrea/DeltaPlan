import React, { useState, useRef, useEffect } from 'react'
import { Form } from 'react-bootstrap'
import AnimateHeight from 'react-animate-height';
import toast from 'react-hot-toast';
import API from '../../API'
import { CartCheck } from 'react-bootstrap-icons';
import dayjs from 'dayjs';


const ShoppingListItem = (props) => {
    const [height, setHeight] = useState(0);

    useEffect(() => {
        setHeight('auto');
    }, []);

    function bought() {
        setHeight(0);
        props.updateTimeOut(props.id);
        notifyBought();
        setTimeout(() => {
            props.bought(props.id);
        }, 1000);
    }

    function undoBought(t) {
        toast.dismiss(t.id);
        props.undoBought(props.item);
        setHeight('auto');
    }

    const notifyBought = () => {
        let tid = toast((t) => (
            <span style={{ textAlign: 'center' }} onClick={() => undoBought(t)}>
                <div><b>Moved to Inventory</b></div>
                <div>Click to cancel</div>
            </span>),
            {
                icon: <CartCheck size={32} />,
                //duration: 3000,
                style: {
                    borderRadius: '50px',
                },
            }
        )
        setTimeout(() => {
            toast.dismiss(tid);
        }, 3000);
    };

    return (
        <AnimateHeight
            duration={1000}
            height={height}
        >
            <div style={{ paddingLeft: 3, paddingRight: 3, marginTop: 4 }}>
                <span>{props.name}</span>
                <span style={{ float: 'right' }}>
                    <Form.Check className="custom-radio" checked={height == 0} type="radio" onChange={() => bought()} />
                </span>
                <hr style={{ marginBottom: 10, marginTop: 10 }} />
            </div >
        </AnimateHeight>
    )
}

export default ShoppingListItem