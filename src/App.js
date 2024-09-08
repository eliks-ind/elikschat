// src/App.js
import './App.css';
import React, { useState, useEffect, useRef } from 'react'; // Import useRef
import { initializeApp } from 'firebase/app';
import { getAuth, signInWithPopup, GoogleAuthProvider, signOut } from 'firebase/auth';
import { getFirestore, collection, addDoc, query, orderBy, onSnapshot, serverTimestamp } from 'firebase/firestore';

// Resources
import google_logo from './resources/google.png';
import arrow from './resources/arrow.png';
import exit from './resources/exit.png';

// Firebase configuration
const firebaseConfig = {
  apiKey: process.env.REACT_APP_FIREBASE_API_KEY,
  authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID,
  storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.REACT_APP_FIREBASE_APP_ID,
  measurementId: process.env.REACT_APP_FIREBASE_MEASUREMENT_ID,
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// Main App Component
const App = () => {
  const [user, setUser] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');

  // Reference for the message container
  const messagesEndRef = useRef(null);

  // Sign in with Google
  const handleSignIn = async () => {
    const provider = new GoogleAuthProvider();
    try {
      const result = await signInWithPopup(auth, provider);
      setUser(result.user);
      console.log('User signed in:', result.user); // Debugging log
    } catch (error) {
      console.error('Error signing in:', error);
    }
  };

  // Sign out
  const handleSignOut = async () => {
    try {
      await signOut(auth);
      setUser(null);
      console.log('User signed out'); // Debugging log
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  // Fetch messages from Firestore
  useEffect(() => {
    const q = query(collection(db, 'messages'), orderBy('createdAt', 'asc'));
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const fetchedMessages = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setMessages(fetchedMessages);
      console.log("Messages updated:", fetchedMessages); // Debugging log
    }, (error) => {
      console.error("Error fetching messages:", error); // Log any errors
    });

    return () => unsubscribe();
  }, []);

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, user]);

  // Send a new message
  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (newMessage.trim() === '') return;

    try {
      await addDoc(collection(db, 'messages'), {
        text: newMessage,
        createdAt: serverTimestamp(), // Use serverTimestamp for consistent sorting
        uid: user.uid,
        displayName: user.displayName, // Store displayName instead of email
        email: user.email,
      });
      console.log('Message sent:', newMessage); // Debugging log
      setNewMessage(''); // Clear input field after sending
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  return (
    <div className="App">
      <h1>super chat by eliks</h1>
      <h3>Sign In to enjoy the whole experience of sucking big cocks with React JS :3</h3>
      {user ? (
        <>
          <div className="msgs-container">
            {messages.map((message) => (
              <div className='msgs' key={message.id}>
                <b>{message.createdAt ? new Date(message.createdAt.seconds * 1000).toLocaleString() : ''}</b>
                <br></br>
                <strong>{message.displayName}</strong> {message.text}
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>
          <button className="signOut" onClick={handleSignOut}> <img src={exit} alt='exit' /> </button>
          <form className="input" onSubmit={handleSendMessage}>
            <input
              type="text"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="Type your message..."
            />
            <button type="submit"> <img src={arrow} alt='send' /> </button>
          </form>
        </>
      ) : (
        <button className="signIn" onClick={handleSignIn}>
          Sign In <img src={google_logo} alt='google-logo' />
        </button>
      )}
    </div>
  );
};

export default App;