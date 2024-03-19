import {React, useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import {Row, Col, Stack, Navbar, Button, Modal, Dropdown, Form, FormControl, Image} from 'react-bootstrap'
import { ChevronLeft, Cart4, PersonCircle, CartPlus, InfoCircleFill, InfoCircle} from 'react-bootstrap-icons'
import API from '../../API'
import CreatableSelect from 'react-select/creatable'
import ShoppingForm from './ShoppingForm'
import InfoShopping from './InfoShopping'
import user from '../../assets/user.png'

const HeaderShoppingList = (props) => {
    const navigate = useNavigate();
    const [showPopUpInfo, setShowPopUpInfo] = useState(false);
    const [ingredients, setIngredients] = useState([]);

        return( 
            <>
             
            <ShoppingForm ingredients={ingredients} show={props.show} setShow={props.setShow} setIngredients={setIngredients} 
            setDirty={props.setDirty} dirty={props.dirty} showModify={props.showModify} setShowModify={props.setShowModify} p={props.p} setP={props.setP}></ShoppingForm>
            <Navbar className='sticky-top' style={{ background: '#FFFFFF' }}>
            <Row style={{width: 364,  height: 45 }}>
             <Col xs={8} className="d-flex align-items-center">
                
                <div style={{ paddingRight: 15 }} onClick={() => navigate("/")}>
                    <ChevronLeft width="32" height="32" fill="currentColor"></ChevronLeft>
                </div>
                    <Cart4 width="32" height="32" fill="#0092CA"></Cart4>
                    
                    <div className='header-title3'>Shopping List</div>
                    
            </Col>
            <Col xs={2} className="d-flex align-items-center justify-content-end">
            <InfoCircle size='20' style={{ marginLeft: 7}} onClick={() => setShowPopUpInfo(true)} />
            </Col>
            <Col xs={2} className="d-flex align-items-center justify-content-center">
            
            <Image src={user} rounded className='logo-home' />
            </Col>
            <InfoShopping showPopUp={showPopUpInfo} setShowPopUp={setShowPopUpInfo} />
        </Row>
       
        </Navbar>

        
        </>
        )
   
}

export default HeaderShoppingList