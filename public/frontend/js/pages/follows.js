class Follows {
  constructor() {
    this.db = firebase.firestore();
    this.auth = firebase.auth();
    this.currentUser = null;
    
    this.init();
  }
  
  init() {
    this.auth.onAuthStateChanged(user => {
      this.currentUser = user;
    });
  }
  
  async followUser(userId) {
    if (!this.currentUser) {
      console.error('User must be logged in to follow');
      return false;
    }
    
    if (userId === this.currentUser.uid) {
      console.error('User cannot follow themselves');
      return false;
    }
    
    try {
      console.log(`Following user: ${userId}`);
      
      const followId = `${this.currentUser.uid}_${userId}`;
      
      const batch = this.db.batch();
      
      const followRef = this.db.collection('follows').doc(followId);
      batch.set(followRef, {
        followerId: this.currentUser.uid,
        followingId: userId,
        createdAt: firebase.firestore.FieldValue.serverTimestamp()
      });
      
      const followedUserRef = this.db.collection('users').doc(userId);
      batch.update(followedUserRef, {
        followersCount: firebase.firestore.FieldValue.increment(1)
      });
      
      const currentUserRef = this.db.collection('users').doc(this.currentUser.uid);
      batch.update(currentUserRef, {
        followingCount: firebase.firestore.FieldValue.increment(1)
      });
      
      await batch.commit();
      
      console.log(`Successfully followed user: ${userId}`);
      return true;
    } catch (error) {
      console.error('Error following user:', error);
      return false;
    }
  }
  
  async unfollowUser(userId) {
    if (!this.currentUser) {
      console.error('User must be logged in to unfollow');
      return false;
    }
    
    try {
      console.log(`Unfollowing user: ${userId}`);
      
      const followId = `${this.currentUser.uid}_${userId}`;
      
      const batch = this.db.batch();
      
      const followRef = this.db.collection('follows').doc(followId);
      batch.delete(followRef);
      
      const followedUserRef = this.db.collection('users').doc(userId);
      batch.update(followedUserRef, {
        followersCount: firebase.firestore.FieldValue.increment(-1)
      });
      
      const currentUserRef = this.db.collection('users').doc(this.currentUser.uid);
      batch.update(currentUserRef, {
        followingCount: firebase.firestore.FieldValue.increment(-1)
      });
      
      await batch.commit();
      
      console.log(`Successfully unfollowed user: ${userId}`);
      return true;
    } catch (error) {
      console.error('Error unfollowing user:', error);
      return false;
    }
  }
}

window.Follows = new Follows();