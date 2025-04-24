import React, { useState, useEffect } from 'react';
import { initializeApp } from 'firebase/app';
import { getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword, sendEmailVerification } from 'firebase/auth';
import StoryForm from '../components/StoryForm';
import StoryDisplay from '../components/StoryDisplay';
import StoryList from '../components/StoryList';
import '../styles/auth.css';

// Firebase configuration
const firebaseConfig = {
  apiKey: process.env.REACT_APP_FIREBASE_API_KEY,
  authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID,
  storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.REACT_APP_FIREBASE_APP_ID
};

// Validate Firebase configuration
const areFirebaseConfigValuesSet = Object.values(firebaseConfig).every(value => value);
if (!areFirebaseConfigValuesSet) {
  console.error('Firebase configuration is incomplete. Check your .env file.');
}

// Initialize Firebase (only if config is valid)
let app, auth;
if (areFirebaseConfigValuesSet) {
  try {
    app = initializeApp(firebaseConfig);
    auth = getAuth(app);
    console.log('Firebase initialized successfully');
  } catch (error) {
    console.error('Error initializing Firebase:', error);
  }
} else {
  console.error('Firebase not initialized due to missing configuration');
}

function Home() {
  const [generatedStory, setGeneratedStory] = useState('');
  const [userId, setUserId] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [verificationPending, setVerificationPending] = useState(false);
  const [mode, setMode] = useState('login'); // 'login' or 'register'
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(
    areFirebaseConfigValuesSet ? '' : 'Application error: Firebase configuration missing. Contact support.'
  );

  // Email validation regex
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  // Check if user is signed in and email is verified
  useEffect(() => {
    if (!auth) {
      setError('Firebase not initialized. Cannot authenticate.');
      return;
    }

    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user) {
        setIsAuthenticated(true);
        setUserId(user.uid);
        setEmail(user.email);
        if (user.emailVerified) {
          setVerificationPending(false);
          console.log('User authenticated and email verified:', user.email);
        } else {
          setVerificationPending(true);
          console.log('User authenticated but email not verified:', user.email);
        }
      } else {
        setIsAuthenticated(false);
        setUserId(null);
        setVerificationPending(false);
        setEmail('');
        setPassword('');
        console.log('No user authenticated');
      }
    });

    return () => unsubscribe();
  }, []);

  const handleSubmit = () => {
    if (!auth) {
      setError('Firebase not initialized. Cannot authenticate.');
      return;
    }

    // Validate inputs
    if (!email || !password) {
      setError('Please enter both email and password.');
      return;
    }

    if (!emailRegex.test(email)) {
      setError('Please enter a valid email address.');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }

    setError('');

    if (mode === 'login') {
      signInWithEmailAndPassword(auth, email, password)
        .then((userCredential) => {
          const user = userCredential.user;
          setIsAuthenticated(true);
          setUserId(user.uid);
          if (user.emailVerified) {
            setVerificationPending(false);
          } else {
            setVerificationPending(true);
          }
          console.log('User logged in:', user.email);
        })
        .catch((err) => {
          setError('Login failed: ' + err.message);
          console.error('Login error:', err);
        });
    } else {
      createUserWithEmailAndPassword(auth, email, password)
        .then((userCredential) => {
          const user = userCredential.user;
          setIsAuthenticated(true);
          setUserId(user.uid);
          // Send email verification
          sendEmailVerification(user)
            .then(() => {
              setVerificationPending(true);
              console.log('Verification email sent to:', user.email);
            })
            .catch((err) => {
              setError('Failed to send verification email: ' + err.message);
              console.error('Verification email error:', err);
            });
          console.log('User registered:', user.email);
        })
        .catch((err) => {
          setError('Registration failed: ' + err.message);
          console.error('Registration error:', err);
        });
    }
  };

  const handleResendVerification = () => {
    if (!auth.currentUser) {
      setError('No user authenticated to resend verification email.');
      return;
    }

    sendEmailVerification(auth.currentUser)
      .then(() => {
        setError('Verification email resent successfully.');
        console.log('Verification email resent to:', auth.currentUser.email);
      })
      .catch((err) => {
        setError('Failed to resend verification email: ' + err.message);
        console.error('Resend verification email error:', err);
      });
  };

  const handleLogout = () => {
    console.log('Logout button clicked'); // Debug log to confirm click event
    if (!auth) {
      setError('Firebase not initialized. Cannot log out.');
      console.error('Logout failed: Firebase not initialized');
      return;
    }

    auth.signOut()
      .then(() => {
        // State updates are already handled by onAuthStateChanged
        console.log('User logged out successfully');
      })
      .catch((err) => {
        setError('Logout failed: ' + err.message);
        console.error('Logout error:', err);
      });
  };

  // Login/Registration UI
  const authSection = React.createElement(
    'div',
    { className: 'auth-section' },
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

  // Email verification pending UI
  const verificationSection = React.createElement(
    'div',
    { className: 'auth-section' },
    React.createElement(
      'div',
      { className: 'auth-container fade-in' },
      React.createElement('h2', null, 'Verify Your Email'),
      React.createElement('p', null, 'A verification email has been sent to ', email, '. Please check your inbox (and spam/junk folder) and verify your email to continue.'),
      React.createElement(
        'button',
        { className: 'auth-button', onClick: handleResendVerification },
        'Resend Verification Email'
      ),
      error && React.createElement('p', { className: 'error' }, error)
    )
  );

  // Main app UI with logout button
  const appContent = React.createElement(
    'div',
    { className: 'app-content' },
    React.createElement(
      'button',
      { className: 'logout-button', onClick: handleLogout },
      'Logout'
    ),
    React.createElement('h1', { className: 'fade-in' }, 'AI Story Generator'),
    React.createElement(StoryForm, {
      onStoryGenerated: (story) => setGeneratedStory(story),
    }),
    React.createElement(StoryDisplay, {
      story: generatedStory,
    }),
    React.createElement(StoryList, { userId: userId })
  );

  if (!isAuthenticated) {
    return authSection;
  } else if (verificationPending) {
    return verificationSection;
  } else {
    return appContent;
  }
}

export default Home;