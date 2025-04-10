const { db, auth } = require('../config/firebase');

// Get user profile
exports.getUserProfile = async (req, res) => {
  try {
    const userId = req.params.id;
    
    const userDoc = await db.collection('users').doc(userId).get();
    
    if (!userDoc.exists) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    const userData = userDoc.data();
    
    // Don't send sensitive information
    res.status(200).json({
      id: userId,
      name: userData.name,
      bio: userData.bio || '',
      profilePicture: userData.profilePicture || '',
      createdAt: userData.createdAt
    });
  } catch (error) {
    console.error('Error getting user profile:', error);
    res.status(500).json({ error: error.message });
  }
};

// Update user profile
exports.updateUserProfile = async (req, res) => {
  try {
    const userId = req.user.uid;
    const { name, bio } = req.body;
    
    const updateData = {};
    if (name) updateData.name = name;
    if (bio) updateData.bio = bio;
    
    if (req.file) {
      updateData.profilePicture = `/uploads/${req.file.filename}`;
    }
    
    await db.collection('users').doc(userId).update({
      ...updateData,
      updatedAt: new Date()
    });
    
    // If name is updated, also update in Auth
    if (name) {
      await auth.updateUser(userId, {
        displayName: name
      });
    }
    
    res.status(200).json({ 
      message: 'Profile updated successfully',
      updates: updateData
    });
  } catch (error) {
    console.error('Error updating user profile:', error);
    res.status(500).json({ error: error.message });
  }
};

// Get user's posts
exports.getUserPosts = async (req, res) => {
  try {
    const userId = req.params.id;
    
    const postsSnapshot = await db.collection('posts')
      .where('userId', '==', userId)
      .orderBy('createdAt', 'desc')
      .get();
    
    const posts = [];
    postsSnapshot.forEach(doc => {
      posts.push({
        id: doc.id,
        ...doc.data()
      });
    });
    
    res.status(200).json(posts);
  } catch (error) {
    console.error('Error getting user posts:', error);
    res.status(500).json({ error: error.message });
  }
};