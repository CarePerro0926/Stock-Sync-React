// src/main.jsx
import React from 'react';
import ReactDOM from 'react-dom/client';
// import App from './App.jsx'; // <-- Comentado temporalmente
// import './index.css'; // <-- Opcionalmente comentado
// import 'bootstrap/dist/css/bootstrap.min.css'; // <-- Opcionalmente comentado

console.log("main.jsx: Iniciando la aplicación"); // <-- Nuevo log

// Renderiza un componente vacío para ver si el log aparece
ReactDOM.createRoot(document.getElementById('root')).render(
  <div>Hola Mundo</div>
);