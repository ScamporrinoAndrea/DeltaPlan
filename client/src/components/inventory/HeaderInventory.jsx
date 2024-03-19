import React, {useState} from 'react'
import { useNavigate } from 'react-router-dom'
import { ChevronLeft, Dropbox, PersonCircle, InfoCircle } from 'react-bootstrap-icons'
import {Row, Col, Stack, Navbar, Image} from 'react-bootstrap'
import InventoryForm from './InventoryForm'
import user from '../../assets/user.png'
import InfoInventory from './InfoInventory'

const HeaderInventory = (props) =>{
    const navigate = useNavigate();
    const [ingredients, setIngredients] = useState([]);
    const [showPopUpInfo, setShowPopUpInfo] = useState(false);
    return(
        <>
        <InventoryForm ingredients={ingredients} show={props.show} setShow={props.setShow} setIngredients={setIngredients} 
        setDirty2={props.setDirty2} dirty2={props.dirt2y} showModify={props.showModify} setShowModify={props.setShowModify} p={props.p} setP={props.setP}></InventoryForm>
        <Navbar className='sticky-top' style={{ background: '#FFFFFF' }}>
        <Row style={{width: 364,  height: 45 }}>
         <Col xs={8} className="d-flex align-items-center">
            
            <div style={{ paddingRight: 15 }} onClick={() => navigate("/")}>
                <ChevronLeft width="32" height="32" fill="currentColor"></ChevronLeft>
            </div>
                <Dropbox width="32" height="32" fill="#0092CA"></Dropbox>
                
                <div className="header-title3">Inventory</div>
                
        </Col>
        <Col xs={2} className="d-flex align-items-center justify-content-center">
        <InfoCircle size='20' style={{ marginLeft: 7}} onClick={() => setShowPopUpInfo(true)} />
        </Col>
        <Col xs={2} className="d-flex align-items-center justify-content-center">
        <Image src={user} rounded className='logo-home' />
        </Col>
        <InfoInventory showPopUp={showPopUpInfo} setShowPopUp={setShowPopUpInfo} />
    </Row>
   
    </Navbar>    
    </>
    )
}

export default HeaderInventory