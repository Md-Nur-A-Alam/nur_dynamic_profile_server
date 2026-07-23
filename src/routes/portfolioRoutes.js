const express = require('express');
const router = express.Router();
const portfolioController = require('../controllers/portfolioController');
const { requireAdmin } = require('../middlewares/authMiddleware');

router.get('/:collection', portfolioController.getAll);
router.get('/:collection/:id', portfolioController.getById);

// Admin only for writes
router.post('/:collection', requireAdmin, portfolioController.create);
router.put('/:collection/:id', requireAdmin, portfolioController.update);
router.delete('/:collection/:id', requireAdmin, portfolioController.delete);

module.exports = router;
