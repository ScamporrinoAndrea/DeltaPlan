import React from 'react';
import dayjs from 'dayjs';
import 'dayjs/locale/en';

dayjs.locale('en');

const Calendar = () => {
    const today = dayjs();
    const startOfMonth = today.startOf('month');
    const endOfMonth = today.endOf('month');
    const currentMonth = today.format('MMMM');
    const daysInMonth = endOfMonth.date();
    const firstDayOfWeek = startOfMonth.day();

    // Genera un array di numeri da 1 a daysInMonth
    const daysArray = Array.from({ length: daysInMonth }, (_, i) => i + 1);

    // Genera un array di numeri per i giorni della settimana iniziando da lunedì
    const weekdays = Array.from({ length: 7 }, (_, i) =>
        dayjs().startOf('week').add(i, 'day').format('dd')
    );

    // Aggiunge spazi vuoti per allineare correttamente il primo giorno del mese
    // Aggiunge spazi vuoti per allineare correttamente il primo giorno del mese
    const leadingSpaces = Array.from({ length: firstDayOfWeek }, (_, i) => i + 1).map(() => ' ');

    // Crea una matrice di giorni del mese allineati ai giorni della settimana
    const alignedDays = [...leadingSpaces, ...daysArray].map((day, index) => {
        const isToday = dayjs().date() === day && today.isSame(startOfMonth, 'month');
        return <td key={index} className={isToday ? 'current-day' : ''}>{day}</td>;
    });
    // Raggruppa i giorni in righe di 7 per la tabella
    const rows = [];
    for (let i = 0; i < alignedDays.length; i += 7) {
        rows.push(<tr key={i}>{alignedDays.slice(i, i + 7)}</tr>);
    }

    return (
        <div style={{ paddingBottom: 20 }}>
            <div style={{ fontSize: 16, fontWeight: 'bold' }}>{currentMonth}</div>
            <table style={{ width: '100%' }}>
                <thead style={{ fontSize: 12, fontWeight: 'medium', textAlign: 'center' }}>
                    <tr>
                        {weekdays.map((day, index) => (
                            <th key={index}>{day[0]}</th>
                        ))}
                    </tr>
                </thead>
                <tbody style={{ fontSize: 10, textAlign: 'center' }}>
                    {rows}
                </tbody>
            </table>
        </div>
    );
};

export default Calendar;
