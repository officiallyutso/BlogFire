const { db, storage } = require('../config/firebase');

// Get all posts
exports.getAllPosts = async (req, res) => {
  try {
    const postsSnapshot = await db.collection('posts')
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
    console.error('Error getting posts:', error);
    res.status(500).json({ error: error.message });
  }
};

exports.getPostById = async (req, res) => {
  try {
    const postId = req.params.id;
    const postDoc = await db.collection('posts').doc(postId).get();
    
    if (!postDoc.exists) {
      return res.status(404).json({ error: 'Post not found' });
    }
    
    const post = {
      id: postDoc.id,
      ...postDoc.data()
    };
    
    res.status(200).json(post);
  } catch (error) {
    console.error('Error getting post:', error);
    res.status(500).json({ error: error.message });
  }
};

exports.createPost = async (req, res) => {
  try {
    const { title, content } = req.body;
    const userId = req.user.uid;
    
    const userDoc = await db.collection('users').doc(userId).get();
    if (!userDoc.exists) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    const userData = userDoc.data();
    
    let imageUrl = null;
    if (req.file) {
      // const bucket = storage.bucket();
      // const fileUpload = bucket.file(`posts/${req.file.filename}`);
      // await fileUpload.save(req.file.buffer);
      // imageUrl = `https://storage.googleapis.com/${bucket.name}/${fileUpload.name}`;
      
      // For local storage:
      imageUrl = `/uploads/${req.file.filename}`;
    }
    
    const newPost = {
      title,
      content,
      userId,
      authorName: userData.name,
      createdAt: new Date(),
      updatedAt: new Date(),
      likes: 0,
      imageUrl
    };
    
    const postRef = await db.collection('posts').add(newPost);
    
    res.status(201).json({ 
      id: postRef.id,
      ...newPost
    });
  } catch (error) {
    console.error('Error creating post:', error);
    res.status(500).json({ error: error.message });
  }
};

exports.updatePost = async (req, res) => {
  try {
    const postId = req.params.id;
    const { title, content } = req.body;
    const userId = req.user.uid;
    
    const postDoc = await db.collection('posts').doc(postId).get();
    
    if (!postDoc.exists) {
      return res.status(404).json({ error: 'Post not found' });
    }
    
    if (postDoc.data().userId !== userId) {
      return res.status(403).json({ error: 'Unauthorized: You can only update your own posts' });
    }
    
    await db.collection('posts').doc(postId).update({
      title,
      content,
      updatedAt: new Date()
    });
    
    res.status(200).json({ message: 'Post updated successfully' });
  } catch (error) {
    console.error('Error updating post:', error);
    res.status(500).json({ error: error.message });
  }
};

exports.deletePost = async (req, res) => {
  try {
    const postId = req.params.id;
    const userId = req.user.uid;
    
    const postDoc = await db.collection('posts').doc(postId).get();
    
    if (!postDoc.exists) {
      return res.status(404).json({ error: 'Post not found' });
    }
    
    if (postDoc.data().userId !== userId) {
      return res.status(403).json({ error: 'Unauthorized: You can only delete your own posts' });
    }
    
    await db.collection('posts').doc(postId).delete();
    
    res.status(200).json({ message: 'Post deleted successfully' });
  } catch (error) {
    console.error('Error deleting post:', error);
    res.status(500).json({ error: error.message });
  }
};

exports.likePost = async (req, res) => {
  try {
    const postId = req.params.id;
    const userId = req.user.uid;
    
    const postRef = db.collection('posts').doc(postId);
    const likesRef = db.collection('likes').doc(`${postId}_${userId}`);
    
    // Check if user already liked the post
    const likeDoc = await likesRef.get();
    
    if (likeDoc.exists) {
      return res.status(400).json({ error: 'You already liked this post' });
    }
    
    // Use transaction to safely update like count
    await db.runTransaction(async (transaction) => {
      const postDoc = await transaction.get(postRef);
      
      if (!postDoc.exists) {
        throw new Error('Post does not exist');
      }
      
      const newLikes = (postDoc.data().likes || 0) + 1;
      transaction.update(postRef, { likes: newLikes });
      
      // Record the like
      transaction.set(likesRef, {
        userId,
        postId,
        createdAt: new Date()
      });
    });
    
    res.status(200).json({ message: 'Post liked successfully' });
  } catch (error) {
    console.error('Error liking post:', error);
    res.status(500).json({ error: error.message });
  }
};

exports.getComments = async (req, res) => {
  try {
    const postId = req.params.id;
    
    const commentsSnapshot = await db.collection('posts')
      .doc(postId)
      .collection('comments')
      .orderBy('createdAt', 'desc')
      .get();
    
    const comments = [];
    commentsSnapshot.forEach(doc => {
      comments.push({
        id: doc.id,
        ...doc.data()
      });
    });
    
    res.status(200).json(comments);
  } catch (error) {
    console.error('Error getting comments:', error);
    res.status(500).json({ error: error.message });
  }
};

// Add a comment to a post
exports.addComment = async (req, res) => {
  try {
    const postId = req.params.id;
    const { content } = req.body;
    const userId = req.user.uid;
    
    // Get user data for the commenter name
    const userDoc = await db.collection('users').doc(userId).get();
    if (!userDoc.exists) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    const userData = userDoc.data();
    
    const newComment = {
      content,
      userId,
      authorName: userData.name,
      createdAt: new Date()
    };
    
    const commentRef = await db.collection('posts')
      .doc(postId)
      .collection('comments')
      .add(newComment);
    
    res.status(201).json({
      id: commentRef.id,
      ...newComment
    });
  } catch (error) {
    console.error('Error adding comment:', error);
    res.status(500).json({ error: error.message });
  }
};