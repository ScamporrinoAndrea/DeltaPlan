import React, { useState } from 'react'
import { Container, Row, Card } from 'react-bootstrap'
import HeaderShoppingList from '../components/shoppinglist/HeaderShoppingList'
import ListOfAttributes from '../components/shoppinglist/ListOfAttributes'

const ShoppingList = () => {
    const [dirty, setDirty] = useState(false);
    const [show, setShow] = useState(false);
    const [showModify, setShowModify] = useState(false);
    const [elementToModify, setElementToModify] = useState([]);


    const [p, setP] = useState(false);

    return (
        <>
            <div style={{ backgroundColor: 'rgb(246, 246, 246)', minHeight: '100vh', }}>
                <div style={{ position: 'sticky', top: 0, left: 0, backgroundColor: 'white', zIndex: 2 }}>
                    <div style={{ paddingTop: 10, paddingRight: 25, paddingLeft: 25 }}>
                        <HeaderShoppingList dirty={dirty} setDirty={setDirty} show={show} setShow={setShow} showModify={showModify} setShowModify={setShowModify}
                            elementToModify={elementToModify} setElementToModify={setElementToModify} p={p} setP={setP}></HeaderShoppingList>
                    </div>
                    <hr style={{ margin: 0 }} />
                </div>
                <div style={{ margin: 0, padding: 0, paddingBottom: 140 }}>
                    <div style={{ marginLeft: 25, marginRight: 25 }}>
                        <ListOfAttributes dirty={dirty} setDirty={setDirty} show={show} setShow={setShow} showModify={showModify}
                            setShowModify={setShowModify} elementToModify={elementToModify} setElementToModify={setElementToModify} P={p} setP={setP} ></ListOfAttributes>
                    </div>
                </div>
            </div> </>
    )
}

export default ShoppingList