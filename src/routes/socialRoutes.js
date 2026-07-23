const express = require('express');
const router = express.Router();

const postController = require('../controllers/postController');
const reactionController = require('../controllers/reactionController');
const commentController = require('../controllers/commentController');

const { requireAuth, requireAdmin } = require('../middlewares/authMiddleware');
const { commentsLimiter, reactionsLimiter } = require('../middlewares/rateLimiter');

// Posts routes
router.get('/posts', postController.getAll);
router.get('/posts/:id', postController.getById);
router.post('/posts', requireAdmin, postController.create);
router.put('/posts/:id', requireAdmin, postController.update);
router.delete('/posts/:id', requireAdmin, postController.delete);

// Reactions routes
router.get('/posts/:postId/reactions', reactionController.getByPost);
router.post('/reactions', requireAuth, reactionsLimiter, reactionController.createOrUpdate);
router.delete('/posts/:postId/reactions', requireAuth, reactionController.delete);

// Comments routes
router.get('/posts/:postId/comments', commentController.getByPost);
router.post('/comments', requireAuth, commentsLimiter, commentController.create);
router.delete('/comments/:id', requireAuth, commentController.delete); // role check inside

module.exports = router;
