import React from 'react'
import { Calendar3, HouseDoorFill, Cart4, Dropbox } from 'react-bootstrap-icons'
import { useNavigate, useLocation } from 'react-router-dom'

const BottomNavbar = () => {
    const navigate = useNavigate()
    const location = useLocation();
    return (
        <>
            <hr style={{ position: 'fixed', bottom: 74, left: 0, width: '100%', margin: 0, zIndex: 999 }} />
            <div className='d-flex justify-content-around' style={{ position: 'fixed', bottom: 0, left: 0, width: '100%', paddingBottom: 35, paddingTop: 13, backgroundColor: 'white', zIndex: 999 }}>
                <div onClick={() => navigate('/')}><HouseDoorFill size={24} color={location.pathname === '/' ? 'var(--primary)' : ''} /></div>
                <div onClick={() => navigate('/calendar')}><Calendar3 size={24} color={location.pathname === '/calendar' ? 'var(--primary)' : ''} /></div>
                <div onClick={() => navigate('/shopping-list')}><Cart4 size={24} color={location.pathname === '/shopping-list' ? 'var(--primary)' : ''} /></div>
                <div onClick={() => navigate('/inventory')}><Dropbox size={24} color={location.pathname === '/inventory' ? 'var(--primary)' : ''} /></div>
            </div>
        </>
    )
}

export default BottomNavbar