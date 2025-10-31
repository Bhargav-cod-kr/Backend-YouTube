import { Router } from "express";
import {
  changeCurrentPassword,
  getCurrentUser,
  getUserChannelProfile,
  getWatchHistory,
  loginUser,
  logoutUser,
  refreshAccessToken,
  registerUser,
  updateAccountDetails,
  updateUserAvatar,
  updateUserCoverImage,
} from "../controllers/user.controller.js";
import { upload } from "../middlewares/multer.middleware.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router();

/* ---------------------------- Public Routes ---------------------------- */

// Registers a new user with required avatar and optional cover image upload
router.route("/register").post(
  upload.fields([
    { name: "avatar", maxCount: 1 },
    { name: "coverImage", maxCount: 1 },
  ]),
  registerUser
);

// Authenticates user credentials and issues access/refresh tokens
router.route("/login").post(loginUser);

/* -------------------------- Authenticated Routes -------------------------- */

// Invalidates user's session by clearing tokens
router.route("/logout").post(verifyJWT, logoutUser);

// Issues a new access token using a valid refresh token
router.route("/refresh-token").post(refreshAccessToken);

// Allows logged-in user to change current password securely
router.route("/change-password").post(verifyJWT, changeCurrentPassword);

// Retrieves details of the currently authenticated user
router.route("/current-user").get(verifyJWT, getCurrentUser);

// Updates profile details like name, email, etc.
router.route("/update-account").patch(verifyJWT, updateAccountDetails);

// Updates user avatar image (single file upload)
router.route("/avatar").patch(verifyJWT, upload.single("avatar"), updateUserAvatar);

// Updates user cover image (single file upload)
router.route("/cover-image").patch(verifyJWT, upload.single("coverImage"), updateUserCoverImage);

// Retrieves a user's public channel profile by username
router.route("/c/:username").get(verifyJWT, getUserChannelProfile);

// Returns watch history of the authenticated user
router.route("/history").get(verifyJWT, getWatchHistory);

export default router;
