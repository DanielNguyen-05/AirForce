import './App.css'
import { BrowserRouter as Router, Routes, Route, Outlet, Navigate } from "react-router-dom";
import Home from './pages/Home/Home';
import Contact from './pages/Contact/Contact';
import Dashboard from './pages/Dashboard/Dashboard';
import {AOSConfig} from "./../config/AOSConfig"

function AccountLayout() {
  return (
    <div className='flex flex-col justify-center items-center pt-[100px]'>
      <div className='font-bold text-[64px] text-white'>Welcome to AirForce</div>
      <Outlet />
    </div>
  );
}

function MainLayout() {
  return (
    <div className='bg-gradient-to-t from-[#ffff] to-[#0159EF] h-180 w-full'>
      <Outlet />
    </div>
  )
}

function App() {
  return (
    <>
      <AOSConfig/>
      <Router>
        <Routes>
          <Route path='/' element={<MainLayout />}>
            {/* Home */}
            <Route index element={<Home />} />

            {/* Dashboard */}
            <Route path='/dashboard' element={<Dashboard />} />

            {/* Contact */}
            <Route path='/contact' element={<Contact />} />
          </Route>
        </Routes>
      </Router>
    </>
  );
}

export default App;
