import './App.css'
import { BrowserRouter as Router, Routes, Route, Outlet, Navigate } from "react-router-dom";
import Home from './pages/Home/Home';
import Login from './pages/Account/Login';
import Register from './pages/Account/Register';
import ForgotPassword from './pages/Account/ForgotPassword';
import OTPPassword from './pages/Account/OTPPassword';
import ResetPassword from './pages/Account/ResetPassword';
import Map from './pages/Map/Map';
import Forecast from './pages/Forecast/Forecast';
import Contact from './pages/Contact/Contact';

function AccountLayout() {
  return (
    <div>
      <Outlet />
    </div>
  );
}

function App() {
  return (
    <Router>
      <Routes>
        {/* Home */}
        <Route path="/" element={<Home />} />

        {/* Auth */}
        <Route path="/account" element={<AccountLayout />}>
          <Route index element={<Navigate to="login" replace />} />

          <Route path="login" element={<Login />} />
          <Route path="register" element={<Register />} />
          <Route path="forgot-password" element={<ForgotPassword />} />
          <Route path="otp-password" element={<OTPPassword />} />
          <Route path="reset-password" element={<ResetPassword />} />
        </Route>

        {/* Map */}
        <Route path='/map' element={<Map/>} />
        
        {/* Dashboard */}
        <Route path='/dashboard' element={<Dashboard/>} />

        {/* Forecast */}
        <Route path='/forecast' element={<Forecast/>} />
        
        {/* Contact */}
        <Route path='/contact' element={<Contact/>} />
      </Routes>
    </Router>
  );
}

export default App;
