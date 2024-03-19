import React, { useEffect, useState, useRef } from 'react';
import { Row, Col, Card, Form } from 'react-bootstrap';
import API from '../../API';



const CardShoppingList = (props) => {
  const [check, setCheck] = useState(false);
  return (
    <Card style={{ marginBottom: '20px', width: '100%' }}>
      <Card.Body>
        <Row>
          <Col xs={4}>
            <Card.Img
              src={API.URL + props.element.path}
              className='rounded-circle border border-grey'
              style={{ width: 65, height: 65 }}
            ></Card.Img>
          </Col>
          <Col xs={6} className='text-left'>
            <Row style={{ fontSize: '16px', fontWeight: 'bold' }}>
              {props.element.ingredient_name}
            </Row>

            <Row style={{ fontSize: '13px' }}>
              {props.element.quantity}
              {props.element.unit_of_measure}
            </Row>

            {props.element.buy_by_date ? <Row style={{ fontSize: '13px' }}>
              Buy until: {props.element.buy_by_date}
            </Row> : <Row style={{ fontSize: '13px' }}>
              Buy until: none
            </Row>}

          </Col>
          <Col xs={2}>
            <Row style={{ height: '19px' }}></Row>
            <Row>
              <Form.Check className="custom-radio" type="radio" onChange={() => { props.bought(props.element); const upd = props.shop_array.filter((e) => e.id !== props.element.id); props.setShopArray(upd); }} />
            </Row>
            <Row style={{ height: '20px' }}></Row>
          </Col>
        </Row>
      </Card.Body>
    </Card>
  )
}


export default CardShoppingList;