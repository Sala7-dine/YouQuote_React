import { Routes, Route } from 'react-router-dom';
import './App.css';
import Login from './auth/Login';
import Register from './auth/Register';
import QuoteManager from './quotes/QuoteManager';

function App() {
  return (
    <Routes>
      <Route path='/register' element={<Register />} />
      <Route path='/login' element={<Login />} />
      <Route path='/quotes' element={<QuoteManager />} />
      {/* Redirection par défaut vers /quotes si l'utilisateur est connecté */}
      <Route path='/' element={<Login />} />
    </Routes>
  );
}

export default App;
