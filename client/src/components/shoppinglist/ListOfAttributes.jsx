import React, { useEffect, useState, useRef } from 'react';
import { Image, Container, Row, Col, Button, Card, Form } from 'react-bootstrap';
import { CartCheck, CartX, PencilSquare, CartPlus } from 'react-bootstrap-icons';
import API from '../../API';
import toast from 'react-hot-toast';
import {
  LeadingActions,
  SwipeableList,
  SwipeableListItem,
  SwipeAction,
  TrailingActions,
  Type as ListType,
} from 'react-swipeable-list';
import CardShoppingList from './CardShoppingList';
import PullToRefresh from 'react-simple-pull-to-refresh';
import IPhoneSpinner from '../general/IPhoneSpinner';

const ListOfAttributes = (props) => {
  const [shop_array, setShopArray] = useState([]);

  const timeoutRef = useRef(0);
  const timeoutRef2 = useRef(null);
  const [quantity, setQuantity] = useState("");
  const [check, setCheck] = useState(false);


  useEffect(() => {
    if (!props.dirty) {

      API.getShoppingListElements()
        .then((res) => {
          setShopArray(res);

        })
        .catch((err) => {
          console.log(err);
        });
      props.setDirty(true);
    }
  }, [props.dirty]);

  const boughtItem = useRef([]);
  const timeoutRef3 = useRef(200);
  const timeoutRef4 = useRef(null);

  function bought(element) {
    setShopArray(shop_array.filter((item) => item.id != element.id));
    boughtItem.current.push(element.id);
    clearTimeout(timeoutRef4.current);
    timeoutRef3.current = 3200;
    timeoutRef4.current = setTimeout(() => {
      let promises = [];
      for (let i = 0; i < boughtItem.current.length; i++) {
        promises.push(
          console.log("boughtItem.current[i]: "),
          API.bought(boughtItem.current[i])
        );
      }
      Promise.all(promises)
        .then(() => {
          props.setDirty(false);
          boughtItem.current = [];
        })
        .catch((err) => {
          console.log(err);
        });
    }, timeoutRef3.current);
    notifyBought(element);
  }

  const deletedItem = useRef([]);
  function del(element) {
    deletedItem.current.push(element.id);
    clearTimeout(timeoutRef2.current);
    timeoutRef.current = 3200;
    timeoutRef2.current = setTimeout(() => {
      let promises = [];
      for (let i = 0; i < deletedItem.current.length; i++) {
        promises.push(
          API.deleteShoppingListElement(deletedItem.current[i])
        );
      }
      Promise.all(promises)
        .then(() => {
          props.setDirty(false);
          deletedItem.current = [];
        })
        .catch((err) => {
          console.log(err);
        });
    }, timeoutRef.current);
    notifyDeleted(element);
  }



  const notifyBought = (element) => {
    let tid = toast(
      (t) => (
        <span style={{ textAlign: 'center' }} onClick={() => undoBought(element, t)}>
          <div>
            <b>{element.ingredient_name} Moved to Inventory</b>
          </div>
          <div>Click to cancel</div>
        </span>
      ),
      {
        icon: <CartCheck size={32} />,
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

  function undoBought(element, t) {
    boughtItem.current = boughtItem.current.filter((item) => item != element.id);
    toast.dismiss(t.id);
    if (shop_array.filter((item) => item.id == element.id).length == 0) {
      setShopArray([...shop_array, element]);
    }
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
        icon: <CartX size={32} />,
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
    if (shop_array.filter((item) => item.id == element.id).length == 0) {
      setInventoryArray([...shop_array, element]);
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
          setShopArray(shop_array.filter((item) => item.id != element.id));
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
          <CartX />
          Delete
        </div>
      </SwipeAction>
    </TrailingActions>
  );

  const handleRefresh = () => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        API.getShoppingListElements()
          .then((res) => {
            setShopArray(res);
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

      <div style={{ paddingTop: 10 }}>
        <PullToRefresh onRefresh={handleRefresh} pullingContent='' refreshingContent={<IPhoneSpinner />}>
          {shop_array.length == 0 && <div style={{ textAlign: 'center', marginTop: 20 }}>No items in the shopping list</div>}
          {shop_array.map((element, index) => (
            <div key={element.id}>

              <SwipeableList fullSwipe={true} type={ListType.IOS} key={index}>
                <SwipeableListItem
                  leadingActions={leadingActions(element)}
                  trailingActions={trailingActions(element)}
                >

                  <CardShoppingList element={element} shop_array={shop_array} setShopArray={setShopArray} bought={bought} del={del}></CardShoppingList>

                </SwipeableListItem>
              </SwipeableList>


            </div>
          ))}
        </PullToRefresh>
        <div style={{ position: 'fixed', bottom: 80, right: 10 }}>

          <Button variant='primary' style={{ borderRadius: 50, color: 'white' }} size='lg'><CartPlus width="20" height="20" fill="currentColor" onClick={() => { props.setShow(true); props.setP(true); }}></CartPlus></Button>
        </div>
      </div>
    </>
  );
};

export default ListOfAttributes;
