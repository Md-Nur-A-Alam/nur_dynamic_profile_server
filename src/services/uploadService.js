const cloudinary = require('cloudinary').v2;
const imgbbUploader = require('imgbb-uploader');
const multer = require('multer');

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY, // Note: The seed didn't list API key, but we need it for direct upload. 
  api_secret: process.env.CLOUDINARY_API_SECRET // Assuming they might be configured or we use unsigned uploads
});

// Configure Multer for memory storage
const upload = multer({ storage: multer.memoryStorage() });

exports.uploadMiddleware = upload.single('file');

exports.uploadFile = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file provided' });
    }

    const isPdf = req.file.mimetype === 'application/pdf';
    const isImage = req.file.mimetype.startsWith('image/');
    
    if (!isPdf && !isImage) {
      return res.status(400).json({ message: 'Only images and PDFs are allowed.' });
    }

    // PDF -> strictly Cloudinary (raw)
    if (isPdf) {
      const b64 = Buffer.from(req.file.buffer).toString('base64');
      const dataURI = "data:" + req.file.mimetype + ";base64," + b64;
      const result = await cloudinary.uploader.upload(dataURI, {
        resource_type: 'raw',
        folder: process.env.ASSET_FOLDER_NAME || 'personal_documents'
      });
      return res.json({ url: result.secure_url, provider: 'cloudinary' });
    }

    // Image -> Either imgbb or Cloudinary based on user preference (req.body.provider)
    if (isImage) {
      const provider = req.body.provider || 'imgbb'; // Default to imgbb if not specified
      const b64 = Buffer.from(req.file.buffer).toString('base64');

      if (provider === 'cloudinary') {
        const dataURI = "data:" + req.file.mimetype + ";base64," + b64;
        const result = await cloudinary.uploader.upload(dataURI, {
          resource_type: 'image',
          folder: process.env.ASSET_FOLDER_NAME || 'portfolio_images'
        });
        return res.json({ url: result.secure_url, provider: 'cloudinary' });
      } else {
        const result = await imgbbUploader({
          apiKey: process.env.IMGBB_API_KEY,
          base64string: b64,
          name: req.file.originalname
        });
        return res.json({ url: result.url, provider: 'imgbb' });
      }
    }
  } catch (error) {
    console.error('Upload Error:', error);
    res.status(500).json({ message: 'Upload failed', error: error.message });
  }
};
