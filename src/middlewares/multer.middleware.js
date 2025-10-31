import multer from "multer";

// Configure storage for uploaded files
const storage = multer.diskStorage({
    // Define destination folder for uploaded files
    destination: function (req, file, cb) {
        cb(null, "./public/temp");
    },
    // Define naming convention for uploaded files
    filename: function (req, file, cb) {
        cb(null, file.originalname);
    }
});

// Initialize multer with defined storage configuration
export const upload = multer({ storage });
