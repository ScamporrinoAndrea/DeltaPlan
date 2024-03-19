import React, { useEffect, useState, useRef } from 'react';
import { Row, Col, Card, Form } from 'react-bootstrap';
import API from '../../API';


const CardInventory = (props) => {
  return (
    <>
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
            <Col xs={8} className='text-left'>
              <Row style={{ fontSize: '16px', fontWeight: 'bold' }}>
                {props.element.ingredient_name}
              </Row>

              <Row style={{ fontSize: '13px' }}>
                {props.element.quantity}
                {props.element.unit_of_measure}
              </Row>

              {props.element.expiration_date ? <Row style={{ fontSize: '13px' }}>
                Expiration: {props.element.expiration_date}
              </Row> : <Row style={{ fontSize: '13px' }}>

              </Row>}

            </Col>

          </Row>
        </Card.Body>
      </Card>
    </>
  )
}

export default CardInventory