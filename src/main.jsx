// src/main.jsx
import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx' // <-- Debe ser App.jsx
import './index.css' // Importa tus estilos
import 'bootstrap/dist/css/bootstrap.min.css'; // Importa Bootstrap CSS

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)