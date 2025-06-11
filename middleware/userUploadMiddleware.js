const multer = require('multer');
const path = require('path');
const { v4: uuidv4 } = require('uuid');

// 1. Configure Storage
// We define where files should be stored and how they should be named.
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    let folder = '';
    if (file.fieldname === 'profilePic') {
      folder = 'profile_pics'; // Dedicated folder for profile pictures
    } else if (file.fieldname === 'companyLogo') {
      folder = 'company_logos'; // Dedicated folder for company logos
    } else if (file.fieldname === 'resume') {
      folder = 'resumes'; // Resumes folder for jobseekers resumes
    }
    // The destination path is relative to the project root
    cb(null, path.join(__dirname, `../uploads/${folder}`));
  },
  filename: (req, file, cb) => {
    // Generate a unique filename to prevent overwrites
    cb(null, `${uuidv4()}${path.extname(file.originalname)}`);
  },
});

// 2. Configure File Filter
// We control which file types are allowed.
const fileFilter = (req, file, cb) => {
  const allowedImageTypes = ['image/jpeg', 'image/png', 'image/gif'];
  const allowedResumeTypes = ['application/pdf'];

  if (file.fieldname === 'profilePic' || file.fieldname === 'companyLogo') {
    if (allowedImageTypes.includes(file.mimetype)) {
      cb(null, true); // Accept the file
    } else {
      cb(new Error('Invalid image type. Only JPEG, PNG, or GIF are allowed.'), false);
    }
  } else if (file.fieldname === 'resume') {
    if (allowedResumeTypes.includes(file.mimetype)) {
      cb(null, true); // Accept the file
    } else {
      cb(new Error('Invalid resume type. Only PDF is allowed.'), false);
    }
  } else {
    // This case should not happen with the .fields setup, but as a fallback
    cb(new Error('Invalid fieldname for file upload.'), false);
  }
};

// 3. Create and Export the Middleware
// We combine the storage, filter, and field definitions into one middleware.
const userUpload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 2 * 1024 * 1024 } // 2MB limit for any file
}).fields([
  { name: 'profilePic', maxCount: 1 },
  { name: 'resume', maxCount: 1 },
  { name: 'companyLogo', maxCount: 1 }
]);

module.exports = userUpload;