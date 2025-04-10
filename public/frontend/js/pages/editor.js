class PostEditor {
  constructor() {
    this.auth = firebase.auth();
    this.db = firebase.firestore();
    this.storage = firebase.storage();
    this.currentUser = null;
    this.postId = null;
    this.isEditMode = false;
    this.imageFile = null;
    this.imageUrl = null;
    this.tags = [];
    
    this.postForm = document.getElementById('post-form');
    this.editorContainer = document.getElementById('editor-container');
    this.imagePreview = document.getElementById('image-preview');
    this.imageInput = document.getElementById('post-image');
    this.removeImageBtn = document.getElementById('remove-image');
    this.tagsContainer = document.getElementById('tags-container');
    this.tagInput = document.getElementById('tag-input');
    this.saveDraftBtn = document.getElementById('save-draft');
    this.editorAlert = document.getElementById('editor-alert');
    this.titleInput = document.getElementById('post-title');
    this.excerptInput = document.getElementById('post-excerpt');
    this.categorySelect = document.getElementById('post-category');
    this.tagsInput = document.getElementById('post-tags');
    this.publishButton = document.querySelector('button[type="submit"]');
    
    this.init();
  }
  
  init() {
    console.log('Initializing post editor...');
    
    this.auth.onAuthStateChanged(user => {
      if (user) {
        console.log('User authenticated:', user.uid);
        this.currentUser = user;
        
        this.initQuillEditor();
        
        const urlParams = new URLSearchParams(window.location.search);
        this.postId = urlParams.get('id');
        
        if (this.postId) {
          console.log('Editing existing post:', this.postId);
          this.isEditMode = true;
          this.loadPostData();
          this.publishButton.textContent = 'Update Post';
          document.title = 'Edit Post | BlogFire';
        } else {
          console.log('Creating new post');
        }
        
        this.addEventListeners();
      } else {
        console.log('User not authenticated, redirecting to login');
        window.location.href = 'login.html';
      }
    });
  }
  
  initQuillEditor() {
    this.quill = new Quill('#editor-container', {
      modules: {
        toolbar: [
          [{ 'header': [1, 2, 3, 4, 5, 6, false] }],
          ['bold', 'italic', 'underline', 'strike'],
          [{ 'list': 'ordered'}, { 'list': 'bullet' }],
          [{ 'color': [] }, { 'background': [] }],
          ['link', 'image', 'video'],
          ['blockquote', 'code-block'],
          [{ 'align': [] }],
          ['clean']
        ]
      },
      placeholder: 'Write your post content here...',
      theme: 'snow'
    });
    
    this.editor = this.quill;
  }
  
  addEventListeners() {
    this.postForm.addEventListener('submit', this.handleSubmit.bind(this));
    
    this.imageInput.addEventListener('change', this.handleImageChange.bind(this));
    
    this.removeImageBtn.addEventListener('click', this.removeImage.bind(this));
    
    this.tagInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ',') {
        e.preventDefault();
        this.addTag();
      }
    });
    
    if (this.saveDraftBtn) {
      this.saveDraftBtn.addEventListener('click', this.saveDraft.bind(this));
    }
  }
  
  async loadPostData() {
    try {
      const postDoc = await this.db.collection('posts').doc(this.postId).get();
      
      if (!postDoc.exists) {
        this.showAlert('Post not found', 'error');
        return;
      }
      
      const postData = postDoc.data();
      
      if (postData.authorId !== this.currentUser.uid) {
        this.showAlert('You do not have permission to edit this post', 'error');
        setTimeout(() => {
          window.location.href = 'index.html';
        }, 2000);
        return;
      }
      
      this.titleInput.value = postData.title;
      this.excerptInput.value = postData.excerpt || '';
      this.quill.root.innerHTML = postData.content;
      this.categorySelect.value = postData.category;
      
      this.tags = postData.tags || [];
      this.renderTags();
      
      if (postData.imageUrl || postData.imageURL) {
        this.imageUrl = postData.imageUrl || postData.imageURL;
        this.updateImagePreview(this.imageUrl);
      }
      
      document.title = `Edit Post - ${postData.title}`;
      document.querySelector('.section-title').textContent = 'Edit Post';
      
      this.publishButton.textContent = 'Update Post';
    } catch (error) {
      this.showAlert('Error loading post data', 'error');
      console.error('Error loading post:', error);
    }
  }
 
  
  clearErrors() {
    const errorElements = document.querySelectorAll('.error');
    errorElements.forEach(element => {
      element.classList.remove('error');
    });
    
    const errorMessages = document.querySelectorAll('.error-message');
    errorMessages.forEach(message => {
      message.remove();
    });
  }
  
  validateForm() {
    let isValid = true;
    
    if (!this.titleInput.value.trim()) {
      this.showInputError(this.titleInput, 'Title is required');
      isValid = false;
    }
    
    if (this.quill.getText().trim().length <= 10) {
      this.showInputError(this.editorContainer, 'Content is too short');
      isValid = false;
    }
    
    if (!this.categorySelect.value) {
      this.showInputError(this.categorySelect, 'Category is required');
      isValid = false;
    }
    
    return isValid;
  }
  
  showInputError(inputElement, message) {
    inputElement.classList.add('error');
    
    const errorMessage = document.createElement('div');
    errorMessage.className = 'error-message';
    errorMessage.textContent = message;
    
    inputElement.parentNode.appendChild(errorMessage);
  }
  
  async saveDraft() {
    try {
      this.showLoading();
      
      const title = this.titleInput.value || 'Untitled Draft';
      const excerpt = this.excerptInput.value;
      const content = this.quill.root.innerHTML;
      const category = this.categorySelect.value;
      
      let imageUrl = this.imageUrl;
      if (this.imageFile) {
        imageUrl = await this.uploadImage();
      }
      
      const postData = {
        title,
        excerpt,
        content,
        category,
        tags: this.tags,
        imageURL: imageUrl,
        updatedAt: firebase.firestore.FieldValue.serverTimestamp()
      };
      
      if (!this.isEditMode) {
        postData.authorId = this.currentUser.uid;
        postData.authorName = this.currentUser.displayName;
        postData.authorImage = this.currentUser.photoURL;
        postData.createdAt = firebase.firestore.FieldValue.serverTimestamp();
        postData.published = false;
        postData.likesCount = 0;
        postData.commentsCount = 0;
        postData.viewsCount = 0;
        
        const newPostRef = await this.db.collection('posts').add(postData);
        
        this.showAlert('Draft saved successfully', 'success');
        setTimeout(() => {
          window.location.href = `edit-post.html?id=${newPostRef.id}`;
        }, 1500);
      } else {
        postData.published = false;
        await this.db.collection('posts').doc(this.postId).update(postData);
        
        this.showAlert('Draft updated successfully', 'success');
      }
    } catch (error) {
      this.showAlert('Error saving draft', 'error');
      console.error('Error saving draft:', error);
    } finally {
      this.hideLoading();
    }
  }
  
}

document.addEventListener('DOMContentLoaded', () => {
  new PostEditor();
});