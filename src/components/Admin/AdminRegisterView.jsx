// src/components/AdminRegisterView.jsx
import React from 'react';
import PropTypes from 'prop-types';
import RegisterView from './RegisterView';

const AdminRegisterView = ({ onShowLogin = () => null, onRegistered = () => null }) => {
  return (
    <RegisterView
      isAdmin={true}
      onShowLogin={onShowLogin}
      onRegistered={onRegistered}
    />
  );
};

AdminRegisterView.propTypes = {
  onShowLogin: PropTypes.func,
  onRegistered: PropTypes.func,
};

export default AdminRegisterView;
