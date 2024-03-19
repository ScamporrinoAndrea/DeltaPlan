import React, { useState, useEffect } from 'react'
import dayjs from 'dayjs';

const Event = (props) => {

    return (
        <>
            <div style={{ position: 'relative', paddingLeft: 3, paddingBottom: 10, height: 52, paddingTop: 6 }} onClick={() => { props.setActivityModal({ ...props.activity, date: dayjs() }); props.setShowPopUp(true); }}>
                <div className='event-title'>
                    {props.activity.title ? props.activity.title : props.activity.meal_type}
                </div>
                <div className='event-hour text-muted'>
                    {props.activity.start_time.slice(0, -3)} - {props.activity.end_time.slice(0, -3)}
                </div>
            </div>
            <hr style={{ margin: 0 }} />
        </>
    )
}

export default Event