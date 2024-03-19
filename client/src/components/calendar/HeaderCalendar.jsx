import React, { useState } from 'react'
import { Row, Col, Stack, Image, Form } from 'react-bootstrap'
import { useNavigate } from 'react-router-dom';
import dayjs from 'dayjs'
import { ChevronLeft, Calendar3, InfoCircle } from 'react-bootstrap-icons';
import user from '../../assets/user.png'
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import InfoModal from './InfoModal';



const HeaderCalendar = (props) => {
    const navigate = useNavigate();
    const [showDatePicker, setShowDatePicker] = useState(false);
    const [showPopUpInfo, setShowPopUpInfo] = useState(false);

    return (
        <Row>
            <Col xs={8} className="d-flex align-items-center">

                <div style={{ paddingRight: 9 }} onClick={() => navigate("/")}>
                    <ChevronLeft width="32" height="32" fill="currentColor"></ChevronLeft>
                </div>
                <Calendar3 width="32" height="32" fill="#0092CA"></Calendar3>
                <Stack style={{ paddingLeft: 7 }}>
                    <div className='header-title2'>Calendar</div>
                    <div className='header-subtitle'>
                        {props.selectedDay.isSame(dayjs(), 'day') ? 'Today' : props.selectedDay.isSame(dayjs().add(1, 'day'), 'day') ? 'Tomorrow' : props.selectedDay.format('dddd, D MMM')}
                    </div>
                </Stack>
            </Col>
            <Col xs={4} className="d-flex align-items-center justify-content-end">
                <Calendar3 size='20' onClick={() => setShowDatePicker(!showDatePicker)} color={showDatePicker ? 'var(--primary)' : ''} />
                {showDatePicker && (
                    <div style={{ position: 'absolute', top: 73, right: 0, zIndex: 5 }}>
                        <DatePicker
                            selected={new Date(props.selectedDay.format('YYYY-MM-DD'))}
                            onChange={(date) => {
                                props.setSelectedDay(dayjs(date));
                                setShowDatePicker(false);
                            }}
                            inline
                        />
                    </div>
                )}
                <InfoCircle size='20' style={{ marginLeft: 7 }} onClick={() => setShowPopUpInfo(true)} />
                <Image src={user} rounded className='logo-home' style={{ marginLeft: 7 }} />
            </Col>
            <InfoModal showPopUp={showPopUpInfo} setShowPopUp={setShowPopUpInfo} />
        </Row>
    )
}

export default HeaderCalendar