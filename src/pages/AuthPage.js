import React, { useState, useEffect } from 'react';
import { getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword } from 'firebase/auth';
import { useNavigate } from 'react-router-dom';
import '../styles/auth.css';

function AuthPage() {
  const auth = getAuth();
  const navigate = useNavigate();
  const [mode, setMode] = useState('login'); // 'login' or 'register'
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  // Redirect if already authenticated
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user) {
        navigate('/home');
      }
    });
    return () => unsubscribe();
  }, [navigate]);

  const handleSubmit = () => {
    setError('');

    if (!email || !password) {
      setError('Please enter both email and password.');
      return;
    }

    if (mode === 'login') {
      signInWithEmailAndPassword(auth, email, password)
        .then(() => {
          navigate('/home');
        })
        .catch((err) => {
          setError('Login failed: ' + err.message);
        });
    } else {
      createUserWithEmailAndPassword(auth, email, password)
        .then(() => {
          navigate('/home');
        })
        .catch((err) => {
          setError('Registration failed: ' + err.message);
        });
    }
  };

  return React.createElement(
    'div',
    { className: 'auth-page' },
    React.createElement(
      'div',
      { className: 'auth-container fade-in' },
      React.createElement(
        'div',
        { className: 'tabs' },
        React.createElement(
          'button',
          {
            className: `tab ${mode === 'login' ? 'active' : ''}`,
            onClick: () => setMode('login'),
          },
          'Login'
        ),
        React.createElement(
          'button',
          {
            className: `tab ${mode === 'register' ? 'active' : ''}`,
            onClick: () => setMode('register'),
          },
          'Register'
        )
      ),
      React.createElement('h2', null, mode === 'login' ? 'Welcome Back!' : 'Create an Account'),
      React.createElement('input', {
        type: 'email',
        placeholder: 'Email',
        value: email,
        onChange: (e) => setEmail(e.target.value),
      }),
      React.createElement('input', {
        type: 'password',
        placeholder: 'Password',
        value: password,
        onChange: (e) => setPassword(e.target.value),
      }),
      React.createElement(
        'button',
        { className: 'auth-button', onClick: handleSubmit },
        mode === 'login' ? 'Login' : 'Register'
      ),
      error && React.createElement('p', { className: 'error' }, error)
    )
  );
}

export default AuthPage;