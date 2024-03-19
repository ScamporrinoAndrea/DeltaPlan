import React, { useState } from 'react'
import { Image, Modal, ModalTitle } from 'react-bootstrap';
import createAciivity from '../../assets/info-createActivity.png'
import deleteOrEditActivity from '../../assets/info-deleteOrEditActivity.gif'
import { PencilSquare } from 'react-bootstrap-icons';

const InfoModal = (props) => {
    const [startY, setStartY] = useState(0);
    const [currentY, setCurrentY] = useState(0);
    const [modalTranslateY, setModalTranslateY] = useState(0);

    function animationOut() {
        const modal = document.querySelector('.modal-dialog-bottom.modal-open');
        document.body.classList.remove('no-scroll');
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
        <Modal show={props.showPopUp} dialogClassName="modal-dialog-bottom modal-open" onHide={() => { animationOut() }} animation={false}
            style={{ transform: `translateY(${modalTranslateY}px)` }}
            scrollable={true}
        >
            <Modal.Header
                onTouchStart={handleTouchStart}
                onTouchMove={handleTouchMove}
                onTouchEnd={handleTouchEnd}>
                <hr style={{ position: 'absolute', top: 0, left: '50%', transform: 'translateX(-50%)', height: 7, width: 50, marginTop: 7, color: 'black' }} />
                <hr style={{ position: 'absolute', top: 0, left: '50%', transform: 'translateX(-50%)', height: 7, width: 50, marginTop: 8, color: 'black' }} />
                <hr style={{ position: 'absolute', top: 0, left: '50%', transform: 'translateX(-50%)', height: 7, width: 50, marginTop: 9, color: 'black' }} />
                <ModalTitle>Help</ModalTitle>

            </Modal.Header>
            <Modal.Body style={{ minHeight: 200, maxHeight: '90vh' }}>
                <div className='event-title'>
                    Calendar
                </div>
                <li style={{ marginBottom: 20 }}>
                    This is the calendar page. Here you can see all your activities for the day.
                </li>
                <div className='event-title'>
                    Add and filter activities
                </div>
                <li>
                    If you want to add an activity, click on <PencilSquare /> at the bottom of the screen.
                </li>
                <li>
                    if you want to view the "To do" or the "Done" activity, click on the relative button at the bottom of the screen.
                </li>
                <div style={{ textAlign: 'center', marginTop: 10, marginBottom: 20 }}>
                    <Image src={createAciivity} rounded />
                </div>
                <div className='event-title'>
                    Delete or edit an activity
                </div>
                <li>
                    If you want to delete an activity, swipe left on the activity and click on the trash icon.
                </li>
                <li>
                    If you want to edit an activity, swipe right on the activity and click on the edit icon.
                </li>
                <div style={{ textAlign: 'center', marginTop: 10, marginBottom: 20 }}>
                    <Image src={deleteOrEditActivity} rounded fluid />
                </div>

            </Modal.Body>
        </Modal>
    )
}

export default InfoModal