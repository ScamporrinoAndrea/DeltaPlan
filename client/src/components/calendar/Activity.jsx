import React, { useState, useEffect, useRef } from 'react'
import { Card, Button, Form } from 'react-bootstrap'
import { Cart4, Check } from 'react-bootstrap-icons'
import AnimateHeight from 'react-animate-height';
import API from '../../API'
import toast from 'react-hot-toast';
import dayjs from 'dayjs';


const Activity = (props) => {
    const [height, setHeight] = useState('auto');


    function openModal() {
        if (!props.activity.to_plan) {
            props.setActivityModal({ ...props.activity, date: props.selectedDay });
            props.setShowPopUp(true);
        }
    }

    useEffect(() => {
        setHeight('auto');
    }, []);

    function undoDone(t) {
        toast.dismiss(t.id);
        props.undoneActivity(props.activity.id);
        setHeight('auto');
    }

    const notifyDone = (activity) => {
        let tid = toast((t) => (
            <span style={{ textAlign: 'center' }} onClick={() => undoDone(t)}>
                <div><b>{activity.type == 'meal' ? 'Ingredients removed' : 'Moved to done'}</b></div>
                {activity.type == 'meal' ?
                    <div><b>from inventory</b></div> : null}
                <div>Click to cancel</div>
            </span>),
            {
                icon: <Check size={32} />,
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

    function done(event, activity) {
        setHeight(0);
        event.stopPropagation();
        let date = {
            date: props.selectedDay.format('YYYY-MM-DD')
        }
        props.updateTimeOut(props.activity.id, date);
        notifyDone(activity);
        setTimeout(() => {
            props.doneActivity(props.activity.id);
        }, 1000);

    }


    return (
        <AnimateHeight
            duration={1000}
            height={height}
            style={{ width: '100%' }}
        >
            <Card className='activity-card' style={{ minHeight: 100 }}>
                <div className='d-flex justify-content-between align-items-center' >
                    <div style={{ padding: 12 }} onClick={openModal}>
                        <div style={{ fontSize: 16, fontWeight: 600 }}>
                            {props.activity.title ? props.activity.title : props.activity.meal_type}
                        </div>
                        {props.activity.type == "meal" ?
                            <div>
                                {props.activity.recipes.map((recipe) => (
                                    <div key={recipe.recipe_id}>
                                        <li>{recipe.name}</li>
                                    </div>
                                ))}
                                {props.activity.other_ingredients.map((ing) => (
                                    <div key={ing.ingredient_id}>
                                        <li>{ing.name} {!ing.isPresent && props.activity.done == false && dayjs().isBefore(dayjs(props.selectedDay.format('DD-MM-YYYY') + props.activity.start_time, 'DD-MM-YYYYhh:mm:ss')) ? <Cart4 /> : null}</li>
                                    </div>
                                ))}
                            </div>
                            : null
                        }
                        {!props.activity.notes ? null :
                            <div>{props.activity.notes}</div>
                        }

                    </div>
                    {props.activity.to_plan || props.activity.done ? null :
                        <div className='d-flex align-items-center' style={{ padding: 12, minHeight: 100 }}>
                            <Form.Check className="custom-radio" checked={height == 0} type="radio" onChange={(e) => done(e, props.activity)} />
                        </div>
                    }
                </div>
                {
                    !props.activity.to_plan ? null :
                        <div style={{ textAlign: 'center', paddingBottom: 12 }}>
                            <Button variant='primary' size='sm' style={{ borderRadius: 20, width: 90, color: 'white' }} onClick={() => { props.setTypeForm(props.activity.meal_type); props.setShowForm(true); }}>
                                Plan it
                            </Button>
                        </div>
                }
                {
                    !props.activity.start_time || props.activity.to_plan ? null :
                        <div className='event-hour text-muted' style={{ paddingRight: 5 }}>{props.activity.start_time.slice(0, -3)} - {props.activity.end_time.slice(0, -3)}</div>
                }
            </Card >
        </AnimateHeight >
    )
}

export default Activity