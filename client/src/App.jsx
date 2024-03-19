import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { useState } from 'react';
import Home from './views/Home';
import Calendar from './views/Calendar';
import ShoppingList from './views/ShoppingList';
import Inventory from './views/Inventory';
import 'bootstrap/dist/css/bootstrap.min.css';
import './Style.css';
import ModalEvent from './components/general/ModalEvent';
import BottomNavbar from './components/general/BottomNavbar';
import { Toaster } from 'react-hot-toast';

function App() {
  const [showPopUp, setShowPopUp] = useState(false);
  const [activityModal, setActivityModal] = useState({});

  return (
    <BrowserRouter>
      <Toaster />
      <ModalEvent
        showPopUp={showPopUp}
        setShowPopUp={setShowPopUp}
        activity={activityModal}
      />
      <BottomNavbar />
      <Routes>
        <Route path='/' element={<Home setShowPopUp={setShowPopUp} setActivityModal={setActivityModal} />} />
        <Route path='/calendar' element={<Calendar setShowPopUp={setShowPopUp} setActivityModal={setActivityModal} showPopUp={showPopUp} />} />
        <Route path='/shopping-list' element={<ShoppingList />} />
        <Route path='/inventory' element={<Inventory />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
