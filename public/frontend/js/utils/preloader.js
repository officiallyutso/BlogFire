/**
 * Preloader functionality
 */
class Preloader {
  constructor() {
    this.preloader = document.getElementById('preloader');
    this.progressBar = document.getElementById('preloader-progress');
    this.progressValue = 0;
    this.progressInterval = null;
    this.loadingComplete = false;
    
    // Initialize
    this.init();
  }
  
  /**
   * Initialize preloader
   */
  init() {
    if (!this.preloader || !this.progressBar) return;
    
    // Start progress animation
    this.startProgress();
    
    // Listen for page load
    window.addEventListener('load', () => {
      this.loadingComplete = true;
      
      // Ensure progress reaches 100% before hiding
      if (this.progressValue >= 100) {
        this.hidePreloader();
      } else {
        // Speed up progress to reach 100% quickly
        this.progressValue = 90;
      }
    });
    
    // Preload critical images
    this.preloadCriticalImages();
  }
  
  /**
   * Preload critical images on the page
   */
  preloadCriticalImages() {
    // Find all images in the document
    const images = Array.from(document.querySelectorAll('img[src]'))
      .map(img => img.src)
      .filter(src => src && !src.startsWith('data:'));
      
    // Preload the first few images (most visible ones)
    const criticalImages = images.slice(0, 5);
    
    if (criticalImages.length > 0) {
      const preloadPromises = criticalImages.map(src => {
        return new Promise((resolve) => {
          const img = new Image();
          img.onload = resolve;
          img.onerror = resolve; // Resolve even on error to continue loading
          img.src = src;
        });
      });
      
      // When critical images are loaded, speed up progress
      Promise.all(preloadPromises).then(() => {
        this.progressValue = Math.max(this.progressValue, 70);
      });
    }
  }
  
  /**
   * Start progress animation
   */
  startProgress() {
    // Clear any existing interval
    if (this.progressInterval) {
      clearInterval(this.progressInterval);
    }
    
    // Set initial progress
    this.progressValue = 0;
    this.updateProgress();
    
    // Animate progress
    this.progressInterval = setInterval(() => {
      // Increment progress
      if (this.loadingComplete) {
        // Speed up to 100% when loading is complete
        this.progressValue += 10;
      } else {
        // Slow progress up to 90% while loading
        const increment = this.progressValue < 50 ? 2 : (this.progressValue < 80 ? 1 : 0.5);
        this.progressValue = Math.min(this.progressValue + increment, 90);
      }
      
      // Update progress bar
      this.updateProgress();
      
      // Check if complete
      if (this.progressValue >= 100) {
        clearInterval(this.progressInterval);
        this.progressInterval = null;
        
        // Hide preloader if loading is complete
        this.hidePreloader();
      }
    }, 50);
  }
  
  /**
   * Update progress bar
   */
  updateProgress() {
    if (this.progressBar) {
      this.progressBar.style.width = `${this.progressValue}%`;
    }
  }
  
  /**
   * Hide preloader
   */
  hidePreloader() {
    if (!this.preloader) return;
    
    // Fade out preloader
    this.preloader.style.opacity = '0';
    
    // Remove preloader after animation
    setTimeout(() => {
      this.preloader.style.display = 'none';
      
      // Add class to body to indicate content is loaded
      document.body.classList.add('content-loaded');
    }, 500);
  }
}

// Initialize preloader
document.addEventListener('DOMContentLoaded', () => {
  new Preloader();
});