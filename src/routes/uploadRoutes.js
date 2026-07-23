const express = require('express');
const router = express.Router();
const uploadService = require('../services/uploadService');
const { requireAdmin } = require('../middlewares/authMiddleware');

router.post('/', requireAdmin, uploadService.uploadMiddleware, uploadService.uploadFile);

module.exports = router;
