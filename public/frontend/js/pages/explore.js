class Explore {
  constructor() {
    this.db = firebase.firestore();
    this.auth = firebase.auth();
    this.currentUser = null;
    this.lastVisible = null;
    this.postsPerPage = 9;
    this.currentFilter = 'trending';
    this.currentCategory = '';
    this.isLoading = false;
    
    this.featuredPostContainer = document.getElementById('featured-post');
    this.postsContainer = document.getElementById('explore-posts-container');
    this.loadMoreBtn = document.getElementById('load-more-btn');
    this.filterTabs = document.querySelectorAll('.filter-tab');
    this.categoryFilter = document.getElementById('category-filter');
    
    this.init();
  }
  
  init() {
    this.auth.onAuthStateChanged(user => {
      this.currentUser = user;
      
      this.loadFeaturedPost();
      
      this.loadPosts(true);
      
      this.addEventListeners();
    });
  }
  
  addEventListeners() {
    this.filterTabs.forEach(tab => {
      tab.addEventListener('click', () => {
        const filter = tab.getAttribute('data-filter');
        
        this.filterTabs.forEach(t => t.classList.remove('active'));
        tab.classList.add('active');
        
        this.currentFilter = filter;
        this.loadPosts(true);
      });
    });
    
    if (this.categoryFilter) {
      this.categoryFilter.addEventListener('change', () => {
        this.currentCategory = this.categoryFilter.value;
        this.loadPosts(true);
      });
    }
    
    if (this.loadMoreBtn) {
      this.loadMoreBtn.addEventListener('click', () => {
        this.loadPosts(false);
      });
    }
    
    const refreshBtn = document.getElementById('refresh-posts-btn');
    if (refreshBtn) {
      refreshBtn.addEventListener('click', () => {
        refreshBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Refreshing...';
        refreshBtn.disabled = true;
        
        this.lastVisible = null;
        
        this.loadPosts(true).then(() => {
          refreshBtn.innerHTML = '<i class="fas fa-sync-alt"></i> Refresh';
          refreshBtn.disabled = false;
        });
      });
    }
  }
  
  truncateText(text, length = 100) {
    if (!text) return '';
    
    const plainText = text.replace(/<[^>]*>/g, '');
    
    if (plainText.length <= length) return plainText;
    
    return plainText.substring(0, length) + '...';
  }
}

document.addEventListener('DOMContentLoaded', () => {
  new Explore();
});