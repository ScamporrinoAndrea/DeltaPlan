import React from 'react';
import { Row, Button } from 'react-bootstrap';
import dayjs from 'dayjs';

const ListOfdayNumbers = (props) => {
    // Ottieni l'oggetto Day.js per la data corrente
    const currentDate = dayjs();

    // Creare un array di numeri rappresentanti i giorni della settimana
    const weekDays = Array.from({ length: 50 }, (_, index) => index + 1);

    return (
        <Row>
            <div className="hide-scrollbar" style={{ display: 'flex', overflow: 'auto', marginTop: '1rem', marginBottom: '1rem' }}>
                {weekDays.map((day) => {
                    const dayDate = currentDate.add(day - 4, 'day');
                    return (
                        <div key={day} style={{ marginRight: '1.2rem', textAlign: 'center' }}>
                            <Button
                                variant='outline-secondary'
                                size="sm"
                                style={{ borderRadius: 50, height: 36, width: 36 }}
                                className={dayDate.isSame(props.selectedDay, 'day') ? 'calendar-selected-day' : dayDate.isSame(dayjs(), 'day') ? 'calendar-current-day' : 'calendar-other-day'}
                                onClick={() => props.setSelectedDay(dayDate)}
                            >
                                {dayDate.format('D')}
                            </Button>
                        </div>
                    );
                })}
            </div>
        </Row >
    );
};

export default ListOfdayNumbers;