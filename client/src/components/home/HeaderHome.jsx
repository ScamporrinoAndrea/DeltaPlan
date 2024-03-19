import React from 'react'
import { Image, Container, Row, Col } from 'react-bootstrap'
import logo from '../../assets/logo.png'
import user from '../../assets/user.png'
import { PersonCircle } from 'react-bootstrap-icons'

const HeaderHome = () => {
    return (
        <Row>
            <Col xs={2} className="d-flex align-items-center justify-content-center">
                <Image src={logo} rounded className='logo-home' />
            </Col>
            <Col xs={8}>
                <span className='header-title'> Deltaplan </span>
            </Col>
            <Col xs={2} className="d-flex align-items-center justify-content-center">
                {/* <PersonCircle width="32" height="32" fill="grey"></PersonCircle> */}
                <Image src={user} rounded className='logo-home' />

            </Col>
        </Row>
    )
}

export default HeaderHome