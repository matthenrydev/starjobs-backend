const multer = require('multer');
const path = require('path');
const { v4: uuidv4 } = require('uuid');

// 1. Configure Storage for Applications
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    // Store all application resumes in 'uploads/applications'
    cb(null, path.join(__dirname, '../uploads/applications'));
  },
  filename: (req, file, cb) => {
    // Unique filename using UUID and original extension
    cb(null, `${uuidv4()}${path.extname(file.originalname)}`);
  },
});

// 2. File Filter for Resume Only
const fileFilter = (req, file, cb) => {
  const allowedResumeTypes = ['application/pdf'];

  if (file.fieldname === 'resume') {
    if (allowedResumeTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid resume type. Only PDF is allowed.'), false);
    }
  } else {
    cb(new Error('Only resume field is allowed for application upload.'), false);
  }
};

// 3. Export Middleware for Application Uploads
const applicationUpload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 2 * 1024 * 1024 }, // 2MB max
}).single('resume');

module.exports = applicationUpload;
