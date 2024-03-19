import React, { useEffect, useState, useRef } from 'react';
import { Image, Container, Row, Col, Button, Card, Form } from 'react-bootstrap';
import { Trash, Plus, PencilSquare, } from 'react-bootstrap-icons';
import API from '../../API';
import toast from 'react-hot-toast';
import {
  LeadingActions,
  SwipeableList,
  SwipeableListItem,
  SwipeAction,
  TrailingActions,
  Type as ListType,
}
  from 'react-swipeable-list';
import CardInventory from './CardInventory';
import PullToRefresh from 'react-simple-pull-to-refresh';
import IPhoneSpinner from '../general/IPhoneSpinner';

const ListOfStorage = (props) => {
  const [inventory_array, setInventoryArray] = useState([]);
  const timeoutRef = useRef(200);
  const timeoutRef2 = useRef(null);
  const [quantity, setQuantity] = useState("");
  const [check, setCheck] = useState(false);

  useEffect(() => {
    if (!props.dirty2) {

      API.getAllInventory()
        .then((res) => {
          setInventoryArray(res);

        })
        .catch((err) => {
          console.log(err);
        });
      props.setDirty2(true);
    }
  }, [props.dirty2]);

  const deletedItem = useRef([]);
  function del(element) {
    deletedItem.current.push(element.id);
    clearTimeout(timeoutRef2.current);
    timeoutRef.current = 3200;
    timeoutRef2.current = setTimeout(() => {
      let promises = [];
      for (let i = 0; i < deletedItem.current.length; i++) {
        promises.push(
          API.deleteInventoryItem(deletedItem.current[i])
        );
      }
      Promise.all(promises)
        .then(() => {
          props.setDirty2(false);
          deletedItem.current = [];
        })
        .catch((err) => {
          console.log(err);
        });
    }, timeoutRef.current);
    notifyDeleted(element);
  }

  const notifyDeleted = (element) => {
    let tid = toast(
      (t) => (
        <span style={{ textAlign: 'center' }} onClick={() => { undoDelete(element, t); }}>
          <div>
            <b>{element.ingredient_name} Deleted</b>
          </div>
          <div>Click to cancel</div>
        </span>
      ),
      {
        icon: <Trash size={32} />,
        duration: 3000,
        style: {
          borderRadius: '50px',
        },
      }
    );
    setTimeout(() => {
      toast.dismiss(tid);
    }, 3000);
  };

  function undoDelete(element, t) {
    deletedItem.current = deletedItem.current.filter((item) => item != element.id);
    if (inventory_array.filter((item) => item.id == element.id).length == 0) {
      setInventoryArray([...inventory_array, element]);
    }
    toast.dismiss(t.id);
  }

  const leadingActions = (element) => (
    <LeadingActions>
      <SwipeAction onClick={() => {
        props.setShowModify(element);
        props.setShow(true);
      }}>
        <div style={{
          backgroundColor: 'var(--primary)',
          color: 'white',
          width: 100,
          textAlign: 'center',
          borderRadius: 5,
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          marginTop: 0,
          marginBottom: 20,
          flexDirection: 'column'
        }}>
          <PencilSquare />
          Edit
        </div>
      </SwipeAction>
    </LeadingActions>
  );

  const trailingActions = (element) => (
    <TrailingActions>
      <SwipeAction
        destructive={true}
        onClick={() => {
          setInventoryArray(inventory_array.filter((item) => item.id != element.id));
          del(element);/*const upd = shop_array.filter((e)=> e.id !== element.id); setShopArray(upd);*/
        }}
      >
        <div style={{
          backgroundColor: 'red',
          color: 'white',
          width: 100,
          textAlign: 'center',
          borderRadius: 5,
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          marginTop: 0,
          marginBottom: 20,
          flexDirection: 'column'
        }}>
          <Trash />
          Delete
        </div>
      </SwipeAction>
    </TrailingActions>
  );

  const handleRefresh = () => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        API.getAllInventory()
          .then((res) => {
            setInventoryArray(res);
            resolve();
          })
          .catch((err) => {
            console.log(err);
            reject();
          });
      }, 500);
    });
  }


  return (
    <>
      <div style={{ marginTop: 10 }}>
        <PullToRefresh onRefresh={handleRefresh} pullingContent='' refreshingContent={<IPhoneSpinner />}>
          {inventory_array.length == 0 && <div style={{ textAlign: 'center', marginTop: 20 }}>No items in inventory</div>}
          {inventory_array.map((element, index) => (

            <div key={element.id}>

              <SwipeableList fullSwipe={true} type={ListType.IOS} key={element.id}>
                <SwipeableListItem
                  leadingActions={leadingActions(element)}
                  trailingActions={trailingActions(element)}
                >

                  <CardInventory element={element} inventory_array={inventory_array} setInventoryArray={setInventoryArray} del={del}></CardInventory>

                </SwipeableListItem>
              </SwipeableList>


            </div>
          ))}
        </PullToRefresh>
        <div style={{ position: 'fixed', bottom: 80, right: 10 }}>

          <Button variant='primary' style={{ borderRadius: 50, color: 'white', }} size='lg'><Plus width="20" height="30" fill="currentColor" onClick={() => { props.setShow(true); props.setP(true); }}></Plus></Button>
        </div>

      </div>
    </>
  )
}

export default ListOfStorage
