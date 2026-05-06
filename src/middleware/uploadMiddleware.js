import multer from "multer";
import path from "path";
import fs from "fs";

const uploadDir = "uploads/avatars";

if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    const ext = path.extname(file.originalname).toLowerCase();
    if (![".jpg", ".jpeg", ".png", ".gif"].includes(ext)) {
      return cb(new Error("Invalid file extension. Only JPEG, PNG and GIF are allowed."), false);
    }
    cb(null, `avatar-${uniqueSuffix}${ext}`);
  },
});

const fileFilter = (req, file, cb) => {
  const allowedTypes = ["image/jpeg", "image/png", "image/gif"];
  const allowedExts = [".jpg", ".jpeg", ".png", ".gif"];
  const ext = path.extname(file.originalname).toLowerCase();

  if (allowedTypes.includes(file.mimetype) && allowedExts.includes(ext)) {
    cb(null, true);
  } else {
    cb(new Error("Invalid file type. Only JPEG, PNG and GIF are allowed."), false);
  }
};

export const uploadAvatar = multer({
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024,
  },
  fileFilter,
}).single("avatar");
