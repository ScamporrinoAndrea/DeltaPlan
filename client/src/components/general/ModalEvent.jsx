import React, { useState } from 'react'
import { Image, Modal, Carousel } from 'react-bootstrap';
import { Cart4 } from 'react-bootstrap-icons';
import API from '../../API';
import dayjs from 'dayjs';

const ModalEvent = (props) => {
    const [startY, setStartY] = useState(0);
    const [currentY, setCurrentY] = useState(0);
    const [modalTranslateY, setModalTranslateY] = useState(0);

    function animationOut() {
        document.body.classList.remove('no-scroll');
        const modal = document.querySelector('.modal-dialog-bottom.modal-open');
        if (modal) {
            modal.classList.remove('modal-open');
            modal.classList.add('modal-close');
            setTimeout(() => {
                props.setShowPopUp(false);
                modal.classList.remove('modal-close');
            }, 280);
        }
    }

    const handleTouchStart = (e) => {
        setStartY(e.touches[0].clientY);
        document.body.classList.add('no-scroll');
    };

    const handleTouchMove = (e) => {
        setCurrentY(e.touches[0].clientY);
        // Calculate the new modal position
        const newModalTranslateY = currentY - startY;
        if (currentY - startY > 0) {
            setModalTranslateY(newModalTranslateY);
        };
    };

    const handleTouchEnd = () => {
        // If the user has scrolled down by more than 50 pixels, close the modal
        if (currentY - startY > 50) {
            setModalTranslateY(400);
            setTimeout(() => {
                props.setShowPopUp(false);
                setModalTranslateY(0);
            }, 100);
            setTimeout(() => {
                document.body.classList.remove('no-scroll');
            }, 550);
        }
        else {
            setModalTranslateY(0);
        };
        setCurrentY(0);
        setStartY(0);
    }
    return (
        <>
            {Object.keys(props.activity).length === 0 ? null :
                <Modal show={props.showPopUp} dialogClassName="modal-dialog-bottom modal-open" onHide={() => { animationOut() }} animation={false}
                    style={{ transform: `translateY(${modalTranslateY}px)`, zIndex: 999999 }}
                    scrollable={true}
                >
                    <Modal.Header
                        onTouchStart={handleTouchStart}
                        onTouchMove={handleTouchMove}
                        onTouchEnd={handleTouchEnd}
                        style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                        <hr style={{ position: 'absolute', top: 0, left: '50%', transform: 'translateX(-50%)', height: 7, width: 50, marginTop: 7, color: 'black' }} />
                        <hr style={{ position: 'absolute', top: 0, left: '50%', transform: 'translateX(-50%)', height: 7, width: 50, marginTop: 8, color: 'black' }} />
                        <hr style={{ position: 'absolute', top: 0, left: '50%', transform: 'translateX(-50%)', height: 7, width: 50, marginTop: 9, color: 'black' }} />
                        {!props.activity.recipes ? null :
                            props.activity.recipes.length == 1 ?
                                < Image src={API.URL + props.activity.recipes[0].path} style={{ borderRadius: 17 }} fluid />
                                :
                                <Carousel interval={2500}>
                                    {props.activity.recipes.map((recipe, index) => (
                                        <Carousel.Item style={{ textAlign: 'center' }} key={recipe.recipe_id}>
                                            <Image src={API.URL + recipe.path} style={{ height: 200, borderRadius: 17 }} />
                                        </Carousel.Item>
                                    ))}
                                </Carousel>
                        }
                        {!props.activity.path ? null :
                            <Image src={API.URL + props.activity.path} style={{ borderRadius: 17 }} fluid />
                        }
                    </Modal.Header>

                    <Modal.Body style={{ minHeight: 200, maxHeight: '90vh' }}>

                        <div style={{ position: 'relative', paddingBottom: 30 }}>
                            <div style={{ fontSize: 30, fontWeight: 400 }}>{props.activity.title ? props.activity.title : props.activity.meal_type}</div>
                            {props.activity.type == "meal" ?
                                <div>
                                    {props.activity.recipes.length > 0 ?
                                        (< div className='event-title'>Recipes:</div>) : null}
                                    {props.activity.recipes.map((recipe) => (
                                        <div key={recipe.recipe_id}>
                                            <li>
                                                {recipe.name}
                                                {recipe.ingredients.map((ing) => (
                                                    <div key={ing.ingredient_id} className='text-muted' style={{ marginLeft: 23, fontSize: 12 }}>
                                                        {ing.quantity} {ing.unit_of_measure}  {ing.name} {!ing.isPresent && props.activity.done == false && dayjs().isBefore(dayjs(props.activity.date.format('DD-MM-YYYY') + props.activity.start_time, 'DD-MM-YYYYhh:mm:ss')) ? <Cart4 /> : null}
                                                    </div>
                                                ))}
                                            </li>
                                        </div>
                                    ))}
                                    {props.activity.other_ingredients.length > 0 ?
                                        (< div className='event-title'>Other ingredient:</div>) : null}
                                    {props.activity.other_ingredients.map((ing) => (
                                        <div key={ing.ingredient_id}>
                                            <li>{ing.quantity} {ing.unit_of_measure}  {ing.name} {!ing.isPresent && props.activity.done == false && dayjs().isBefore(dayjs(props.activity.date.format('DD-MM-YYYY') + props.activity.start_time, 'DD-MM-YYYYhh:mm:ss')) ? <Cart4 /> : null}</li>
                                        </div>
                                    ))}
                                </div> : null
                            }
                            {!props.activity.name ? null :
                                <div style={{ fontSize: 25, fontWeight: 500, paddingTop: 12 }}>{props.activity.name}</div>
                            }
                            {!props.activity.description ? null :
                                <div>
                                    <div className='event-title'>Description:</div>
                                    <div>{props.activity.description}</div>
                                </div>
                            }
                            {!props.activity.ingredients ? null :
                                <div>
                                    <div className='event-title'>Ingredients:</div>
                                    <div className='text-muted'>
                                        {props.activity.ingredients.map((ing, index) => (
                                            <div key={index}>
                                                {ing.name} {!ing.isPresent && props.activity.done == false && dayjs().isBefore(dayjs(props.activity.date.format('DD-MM-YYYY') + props.activity.start_time, 'DD-MM-YYYYhh:mm:ss')) ? <Cart4 /> : null}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            }
                            {!props.activity.notes ? null :
                                <div>
                                    <div className='event-title'>Notes:</div>
                                    <div>{props.activity.notes}</div>
                                </div>
                            }
                            {!props.activity.start_time ? null :
                                <div className='event-hour text-muted' style={{ paddingRight: 15, paddingTop: 15, fontSize: 15 }}>{props.activity.start_time.slice(0, -3)} - {props.activity.end_time.slice(0, -3)}</div>
                            }
                        </div>
                    </Modal.Body >

                </Modal >
            }
        </>
    )
}

export default ModalEvent