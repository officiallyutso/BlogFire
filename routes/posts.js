const express = require('express');
const router = express.Router();
const { verifyToken } = require('../middleware/auth');
const { upload } = require('../middleware/upload');
const postController = require('../controllers/postController');

router.get('/', postController.getAllPosts);

router.get('/:id', postController.getPostById);

router.post('/', verifyToken, upload.single('image'), postController.createPost);

router.put('/:id', verifyToken, postController.updatePost);

router.delete('/:id', verifyToken, postController.deletePost);

router.post('/:id/like', verifyToken, postController.likePost);

router.get('/:id/comments', postController.getComments);

router.post('/:id/comments', verifyToken, postController.addComment);

module.exports = router;