/**
 * Main Application
 * Initializes and manages the application
 */
class App {
  constructor() {
    this.menuToggle = document.getElementById('menu-toggle');
    this.mainNav = document.getElementById('main-nav');
    this.userProfile = document.getElementById('user-profile');
    
    this.init();
  }
  
  /**
   * Initialize the application
   */
  init() {
    // Mobile menu toggle
    if (this.menuToggle && this.mainNav) {
      this.menuToggle.addEventListener('click', this.toggleMobileMenu.bind(this));
    }
    
    // Close menu when clicking outside
    document.addEventListener('click', (e) => {
      if (this.mainNav && 
          this.mainNav.classList.contains('active') && 
          !this.mainNav.contains(e.target) && 
          !this.menuToggle.contains(e.target)) {
        this.toggleMobileMenu();
      }
    });
    
    // Initialize search
    this.initSearch();
  }
  
  /**
   * Toggle mobile menu
   */
  toggleMobileMenu() {
    this.menuToggle.classList.toggle('active');
    this.mainNav.classList.toggle('active');
  }
  
  /**
   * Initialize search functionality
   */
  initSearch() {
    const searchForm = document.getElementById('search-form');
    const searchInput = document.getElementById('search-input');
    
    if (searchForm && searchInput) {
      searchForm.addEventListener('submit', (e) => {
        e.preventDefault();
        
        const query = searchInput.value.trim();
        if (query) {
          window.location.href = `search.html?q=${encodeURIComponent(query)}`;
        }
      });
    }
  }
}

// Initialize modules
document.addEventListener('DOMContentLoaded', () => {
  // Initialize app
  new App();
  
  // Fix profile links to prevent redirection issues
  fixProfileLinks();
  
  console.log('App initialized');
});

/**
 * Fix profile links to prevent unwanted redirects
 */
function fixProfileLinks() {
  // Remove the existing event listeners by cloning and replacing
  const profileLinks = document.querySelectorAll('a[href="profile.html"]');
  
  profileLinks.forEach(link => {
    const newLink = link.cloneNode(true);
    if (link.parentNode) {
      link.parentNode.replaceChild(newLink, link);
    }
    
    // Add a new click handler that prevents default only when needed
    newLink.addEventListener('click', function(e) {
      // If we're already on profile.html, just refresh the page
      if (window.location.pathname.includes('profile.html')) {
        e.preventDefault();
        console.log('Preventing default navigation and refreshing profile page');
        window.location.href = 'profile.html';
      } else {
        console.log('Navigating to profile page');
        // Let the default navigation happen
      }
    });
  });
}