const { auth, db } = require('../config/firebase');
const { validationResult } = require('express-validator');

exports.register = async (req, res) => {
  try {
    const { email, password, name } = req.body;
    
    if (!email || !password || !name) {
      return res.status(400).json({ error: 'Email, password, and name are required' });
    }
    
    const userRecord = await auth.createUser({
      email,
      password,
      displayName: name
    });
    
    await db.collection('users').doc(userRecord.uid).set({
      name,
      email,
      createdAt: new Date(),
      bio: '',
      profilePicture: ''
    });
    
    const token = await auth.createCustomToken(userRecord.uid);
    
    res.status(201).json({ 
      message: 'User registered successfully',
      userId: userRecord.uid,
      token
    });
  } catch (error) {
    console.error('Error registering user:', error);
    
    //Firebase Auth errors
    if (error.code === 'auth/email-already-exists') {
      return res.status(400).json({ error: 'Email already in use' });
    } else if (error.code === 'auth/invalid-email') {
      return res.status(400).json({ error: 'Invalid email format' });
    } else if (error.code === 'auth/weak-password') {
      return res.status(400).json({ error: 'Password is too weak' });
    }
    
    res.status(500).json({ error: error.message });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }
    
    try {
      // Check if user exists
      const userRecord = await auth.getUserByEmail(email);
      
      const token = await auth.createCustomToken(userRecord.uid);
      
      const userDoc = await db.collection('users').doc(userRecord.uid).get();
      const userData = userDoc.data();
      
      res.status(200).json({
        message: 'Login successful',
        token,
        user: {
          id: userRecord.uid,
          name: userRecord.displayName,
          email: userRecord.email,
          profilePicture: userData.profilePicture || ''
        }
      });
    } catch (error) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
  } catch (error) {
    console.error('Error logging in:', error);
    res.status(500).json({ error: error.message });
  }
};
exports.getCurrentUser = async (req, res) => {
  try {
    const userId = req.user.uid;
    const userDoc = await db.collection('users').doc(userId).get();
    
    if (!userDoc.exists) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    const userData = userDoc.data();
    
    res.status(200).json({
      id: userId,
      name: userData.name,
      email: userData.email,
      bio: userData.bio || '',
      profilePicture: userData.profilePicture || '',
      createdAt: userData.createdAt
    });
  } catch (error) {
    console.error('Error getting user data:', error);
    res.status(500).json({ error: error.message });
  }
};

exports.logout = (req, res) => {
  res.status(200).json({ message: 'Logout successful' });
};