import React, { useEffect, useState, useRef } from 'react'
import { Card, Container, Row, Col } from 'react-bootstrap'
import HeaderHome from '../components/home/HeaderHome'
import HeaderCard from '../components/home/HeaderCard'
import Calendar from '../components/home/Calendar'
import Event from '../components/home/Event'
import { useNavigate } from 'react-router-dom';
import ShoppingListItem from '../components/home/ShoppingListItem'
import InventoryItem from '../components/home/InventoryItem'
import API from '../API'
import { Calendar3, Cart4, Dropbox } from 'react-bootstrap-icons';

const Home = (props) => {
    const navigate = useNavigate();
    const calendarIcon = () => { return (<Calendar3></Calendar3>) }
    const shoppingListIcon = () => { return (<Cart4></Cart4>) }
    const inventoryIcon = () => { return (<Dropbox></Dropbox>) }
    const [firstThreeinventory, setFirstThreeInventory] = useState([])
    const [firstThreeShoppingList, setFirstThreeShoppingList] = useState([])
    const [firstThreeActivities, setFirstThreeActivities] = useState([])
    const [dirty, setDirty] = useState(false)
    const timeoutRef = useRef(200);
    const timeoutRef2 = useRef(null);
    const ingrefientsetasboughtRef = useRef([]);


    useEffect(() => {
        API.getFirstThreeInventory()
            .then((res) => {
                setFirstThreeInventory(res);
            })
            .catch((err) => {
                console.log(err);
            });
        API.getFirstThreeShoppingList()
            .then((res) => {
                setFirstThreeShoppingList(res);
            })
            .catch((err) => {
                console.log(err);
            });
        API.getFirstThreeActivities()
            .then((res) => {
                setFirstThreeActivities(res);
            })
            .catch((err) => {
                console.log(err);
            });
        setDirty(false)
    }, [dirty])

    function updateTimeOut(id) {
        ingrefientsetasboughtRef.current.push(id);
        clearTimeout(timeoutRef2.current);
        timeoutRef.current = 3500;

        timeoutRef2.current = setTimeout(() => {
            let promises = [];
            for (let i = 0; i < ingrefientsetasboughtRef.current.length; i++) {
                promises.push(
                    API.bought(ingrefientsetasboughtRef.current[i])
                );
            }
            Promise.all(promises)
                .then(() => {
                    setDirty(true);
                    ingrefientsetasboughtRef.current = [];
                })
                .catch((err) => {
                    console.log(err);
                });
        }, timeoutRef.current);
    }

    function bought(id) {
        setFirstThreeShoppingList(firstThreeShoppingList.filter((x) => x.id != id))
    }

    function undoBought(item) {
        ingrefientsetasboughtRef.current = ingrefientsetasboughtRef.current.filter((x) => x != item.id);
        if (firstThreeShoppingList.filter((x) => x.id == item.id).length == 0) {
            setFirstThreeShoppingList([...firstThreeShoppingList, item])
        }
    }

    return (
        <>
            <Container style={{ paddingTop: 15, paddingRight: 25, paddingLeft: 25, marginBottom: 94 }}>
                <HeaderHome />
                <Row style={{ marginTop: 20 }}>
                    <Card className='custom-card'>
                        <div onClick={() => navigate('/calendar')} style={{ zIndex: 2 }}>
                            <HeaderCard title='Plan here' icon={calendarIcon} />
                        </div>
                        <Row style={{ paddingLeft: 6, paddingRight: 6 }}>
                            <Col xs={6}>
                                {firstThreeActivities.length > 0 ?
                                    firstThreeActivities.map((item) => (
                                        <Event
                                            key={item.id}
                                            showPopUp={props.showPopUp}
                                            setShowPopUp={props.setShowPopUp}
                                            setActivityModal={props.setActivityModal}
                                            activity={item}
                                        />
                                    ))
                                    : (<p>No events today</p>)
                                }
                            </Col>
                            <Col xs={6} onClick={() => navigate('/calendar')}>
                                <div className="vertical-line"></div>
                                <Calendar />
                            </Col>
                        </Row>
                    </Card>
                </Row >
                <Row style={{ marginTop: 20 }}>
                    <Card className='custom-card'>
                        <div onClick={() => navigate('/shopping-list')}>
                            <HeaderCard title='Shopping list' icon={shoppingListIcon} />
                        </div>
                        <div style={{ padding: 6 }}>
                            {firstThreeShoppingList.length > 0 ?
                                firstThreeShoppingList.map((item) => (
                                    <ShoppingListItem
                                        key={item.id}
                                        id={item.id}
                                        name={item.ingredient_name}
                                        setDirty={setDirty}
                                        item={item}
                                        bought={bought}
                                        undoBought={undoBought}
                                        updateTimeOut={updateTimeOut} />
                                ))
                                : (<p>Shopping list is empty</p>)
                            }
                        </div>
                    </Card>
                </Row>
                <Row style={{ marginTop: 20 }}>
                    <Card className='custom-card' onClick={() => navigate('/inventory')}>
                        <HeaderCard title='Inventory' icon={inventoryIcon} />
                        <div style={{ padding: 6 }}>
                            {firstThreeinventory.length > 0 ?

                                firstThreeinventory.map((item) => (
                                    <InventoryItem key={item.id} name={item.ingredient_name} quantity={item.quantity + " " + item.unit_of_measure} />
                                ))
                                : (<p>Inventory is empty</p>)}
                        </div>
                    </Card>
                </Row>
            </Container >
        </>
    )
}

export default Home