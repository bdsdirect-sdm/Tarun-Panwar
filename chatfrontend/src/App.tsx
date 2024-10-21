import React from 'react';
import logo from './logo.svg';
import './App.css';
import UserRegistration from './components/UserRegistration';
import Login from './components/Login';
import { BrowserRouter , Routes , Route, useParams } from 'react-router-dom';
import Dashboard from './components/dashboard';
import Chat from './components/Chat';
function App() {
  const id = useParams();
  return (
    <>
    <BrowserRouter>
      <Routes>
        <Route path={'/'} element={<UserRegistration/>}/>
        <Route path={'/login'} element={<Login/>}/>
        <Route path={'/dashboard'} element={<Dashboard/>}/>
        <Route path={`/chat/:id`} element={<Chat/>} />
      </Routes>
    </BrowserRouter>
    </>
  );
}

export default App;
