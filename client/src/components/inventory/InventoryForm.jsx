import React, { useState, useEffect } from 'react';
import { Row, Col, Button, Modal, Form } from 'react-bootstrap';
import API from '../../API';
import CreatableSelect from 'react-select/creatable';
import dayjs from 'dayjs';


const InventoryForm = (props) => {
  const [ingredient_name, setIngredientName] = useState(null);
  const [quantity, setQuantity] = useState("");
  const [unit, setUnit] = useState("");
  const [date, setDate] = useState("");
  const [options, setOptions] = useState([]);
  const unit_options = ["g", "kg", "l", "ml",];
  const [touched, setTouched] = useState(false);
  const [startY, setStartY] = useState(0);
  const [currentY, setCurrentY] = useState(0);
  const [modalTranslateY, setModalTranslateY] = useState(0);

  function animationOut() {
    document.body.classList.remove('no-scroll');
    const modal = document.querySelector('.modal-dialog-bottom.modal-open');
    if (modal) {
      modal.classList.remove('modal-open');
      modal.classList.add('modal-close');
      setTimeout(() => {
        props.setShow(false);
        modal.classList.remove('modal-close');
      }, 280);
    }
    setIngredientName("");
    setUnit("");
    setQuantity("");
    setDate("");
    setTouched(false);
    props.setShowModify([]);
    props.setP(false);

  }
  useEffect(() => {
    if (props.showModify) {
      
      setIngredientName(props.showModify.ingredient_name ? props.showModify.ingredient_name : "");
      setQuantity(props.showModify.quantity ? props.showModify.quantity : "");
      setUnit(props.showModify.unit_of_measure ? props.showModify.unit_of_measure : "");
      setDate(props.showModify.expiration_date ? props.showModify.expiration_date : "");


    }
  }, [props.showModify])
  const handleTouchStart = (e) => {
    setStartY(e.touches[0].clientY);
    document.body.classList.add('no-scroll');
  };

  const handleTouchMove = (e) => {
    setCurrentY(e.touches[0].clientY);
    // Calculate the new modal position
    const newModalTranslateY = currentY - startY;
    if (currentY - startY > 0) {
      setModalTranslateY(newModalTranslateY);
    };
  };

  const handleTouchEnd = () => {

    // If the user has scrolled down by more than 200 pixels, close the modal
    if (currentY - startY > 200) {
      setModalTranslateY(400);
      setTimeout(() => {

        props.setShow(false);
        setModalTranslateY(0);
        setIngredientName("");
        setUnit("");
        setQuantity("");
        setDate("");
        setTouched(false);
        props.setShowModify([]);
        props.setP(false);
      }, 100);
      setTimeout(() => {
        document.body.classList.remove('no-scroll');
      }, 550);
    }
    else {
      setModalTranslateY(0);
    };
    setCurrentY(0);
    setStartY(0);
  }


  useEffect(() => {
    API.getAllIngredients()
      .then((res) => {
        props.setIngredients(res);
        setOptions(res.map((element) => ({ value: element.name, label: element.name })));
        
      })
      .catch((err) => {
        console.error('Error fetching ingredients:', err);
      });

  }, []);

  const handleChange = (selectedOption) => {

    setIngredientName(selectedOption ? selectedOption.value : selectedOption);


  };

  const handleChange2 = (newValue, actionMeta) => {
    if (actionMeta.action === 'create-option' || actionMeta.action === 'select-option') {

      setUnit(newValue.value);

    }
  };



  const handleSubmit = () => {



    if (!(ingredient_name == null || ingredient_name == "") && !(quantity == null || quantity == "") && !(dayjs(date).isBefore(dayjs(), 'day'))) {

      const item = {
        name: ingredient_name,
        quantity: quantity,
        unit_of_measure: unit,
        expiration_date: date,
      };

      if (props.showModify && props.p == false) {


        API.updateItemInventory(props.showModify.id, item).then(() => {
          props.setDirty2(false);
          setIngredientName("");
          setTouched(false);
          setQuantity("");
          setDate("");
          setUnit("");
          animationOut();
          props.setShowModify([]);
          props.setP(false);
        })
          .catch((err) => {
            console.error('Error inserting item in shopping list:', err);
          });
      }
      else {

        API.addToInventory(item)
          .then(() => {
            props.setDirty2(false);
            setIngredientName("");

            setTouched(false);

            setQuantity("");
            setDate("");
            setUnit("");
            animationOut();
            props.setShowModify([]);
            props.setP(false);
          })
          .catch((err) => {
            console.error('Error inserting item in shopping list:', err);
          });
      }



    }



  };

  return (
    <>
      <Modal show={props.show} dialogClassName="modal-dialog-bottom modal-open" onHide={() => { animationOut(); }} animation={false}
        style={{ transform: `translateY(${modalTranslateY}px)` }}>
        <Modal.Header
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}>
          <hr style={{ position: 'absolute', top: 0, left: '50%', transform: 'translateX(-50%)', height: 7, width: 50, marginTop: 7, color: 'black' }} />
          <hr style={{ position: 'absolute', top: 0, left: '50%', transform: 'translateX(-50%)', height: 7, width: 50, marginTop: 8, color: 'black' }} />
          <hr style={{ position: 'absolute', top: 0, left: '50%', transform: 'translateX(-50%)', height: 7, width: 50, marginTop: 9, color: 'black' }} />
          {props.p ? <Modal.Title>Add to Inventory</Modal.Title> : <Modal.Title>Update Item</Modal.Title>}
        </Modal.Header>
        <Modal.Body style={{ minHeight: 300 }}>
          <CreatableSelect
            isClearable
            onChange={handleChange}
            options={options}
            value={options.find((name) => name.value === ingredient_name)}
            placeholder="Search or create ingredient..."
            styles={{
              control: (provided) => ({
                ...provided,
                borderColor: !touched ? provided.borderColor :
                  (ingredient_name == null || ingredient_name == "") && touched ? 'rgb(220,53,69)' : 'rgb(26,135,84)',
                borderWidth: '0.093rem',
              }),



            }}

          />
          {(ingredient_name == null || ingredient_name == "") && touched && <div style={{ color: 'rgb(220,53,69)', marginTop: '.25rem', fontSize: '90%' }}>
            Please choose an ingredient.
          </div>}
          <Form>
            <Row>
              <Col xs={6}>
                <Form.Label>Quantity:</Form.Label>
                <Form.Control
                  type="number"
                  value={quantity}
                  placeholder="only numeric values"
                  onChange={(e) => { setQuantity(e.target.value) }}
                  style={
                    { borderColor: !touched ? '' : (quantity == null || quantity == "") && touched ? 'red' : 'green' }
                  }
                />

                {(quantity == null || quantity == "") && touched && <div style={{ color: 'rgb(220,53,69)', marginTop: '.25rem', fontSize: '90%' }}>
                  Please choose a quantity.
                </div>}

              </Col>
              <Col>
                <Form.Label>Unit of measure:</Form.Label>
                <CreatableSelect
                  isClearable
                  onChange={handleChange2}
                  options={unit_options.map((option) => ({ value: option, label: option }))}
                  placeholder="one or none"
                  styles={{
                    control: (provided) => ({
                      ...provided,
                      borderColor: touched ? 'rgb(26,135,84)' : provided.borderColor,
                      borderWidth: '0.093rem',
                    }),



                  }}
                />


              </Col>
            </Row>
            <Row>
              <Col xs={6}>
                <Form.Label>Expiration date:</Form.Label>
                <Form.Control
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  style={
                    { borderColor: (dayjs(date).isBefore(dayjs(), 'day')) && touched ? 'red' : !(dayjs(date).isBefore(dayjs(), 'day')) && touched ? 'green' : '' }
                  }
                />
                {(dayjs(date).isBefore(dayjs(), 'day')) && touched && <div style={{ color: 'rgb(220,53,69)', marginTop: '.25rem', fontSize: '90%' }}>
                  Please choose a valid date.
                </div>}
              </Col>
            </Row>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => { animationOut() }}>
            Close
          </Button>
          {!props.p ? <Button variant="success" type="submit" onClick={() => { handleSubmit(); setTouched(true); }}>
            Update
          </Button> :
            <Button variant="success" type="submit" onClick={() => { handleSubmit(); setTouched(true); }}>
              Add
            </Button>}
        </Modal.Footer>
      </Modal>
    </>
  )
}

export default InventoryForm