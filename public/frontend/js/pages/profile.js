class Profile {
  constructor() {
    this.db = firebase.firestore();
    this.auth = firebase.auth();
    this.storage = firebase.storage();
    this.currentUser = null;
    this.userId = null;
    
    this.profileContainer = document.getElementById('profile-container');
    this.publishedPostsContainer = document.getElementById('published-posts');
    this.draftPostsContainer = document.getElementById('draft-posts');
    this.tabButtons = document.querySelectorAll('.tab-btn');
    
    this.init();
  }
  
  init() {
    this.auth.onAuthStateChanged(user => {
      if (user) {
        this.currentUser = user;
        
        const urlParams = new URLSearchParams(window.location.search);
        this.userId = urlParams.get('id') || user.uid;
        
        this.loadProfile();
        
        this.loadUserPosts();
        
        this.addEventListeners();
      } else {
        window.location.href = 'login.html';
      }
    });
  }
  
  addEventListeners() {
    if (this.tabButtons) {
      this.tabButtons.forEach(button => {
        button.addEventListener('click', () => {
          const tab = button.getAttribute('data-tab');
          
          this.tabButtons.forEach(btn => btn.classList.remove('active'));
          button.classList.add('active');
          
          document.querySelectorAll('.tab-content').forEach(content => {
            content.classList.remove('active');
          });
          
          document.getElementById(`${tab}-posts`).classList.add('active');
        });
      });
    }
  }
}

new Profile();