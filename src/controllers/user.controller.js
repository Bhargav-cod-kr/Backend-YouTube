import { asyncHandler } from "../utils/asyncHandler.js"
import { ApiError } from "../utils/apiError.js"
import { User } from "../models/user.model.js"
import { uploadOnCloudinary } from "../utils/cloudinary.js"
import { ApiResponse } from "../utils/apiResponse.js"
import jwt from "jsonwebtoken"
import mongoose from "mongoose"

// Generate and persist access/refresh tokens for a user
const generateAccessAndRefreshTokens = async (userId) => {
    try {
        // find user by id
        const user = await User.findById(userId)
        // create access token
        const accessToken = user.generateAccessToken()
        // create refresh token
        const refreshToken = user.generateRefreshToken()
        // persist refresh token (skip validation)
        user.refreshToken = refreshToken
        // save user without running validators
        await user.save({ validateBeforeSave: false })
        return { accessToken, refreshToken }
    } catch (error) {
        throw new ApiError(500, "Something went wrong while generating tokens")
    }
}

// Register a new user and upload avatar/cover images
const registerUser = asyncHandler(async (req, res) => {
    const { fullName, email, username, password } = req.body
    // validate required fields
    if ([fullName, email, username, password].some(field => field?.trim() === "")) {
        throw new ApiError(400, "All fields are required")
    }

    // check if username or email already exists
    const existedUser = await User.findOne({ $or: [{ username }, { email }] })
    if (existedUser) {
        throw new ApiError(409, "User with email or username already exists")
    }

    // get uploaded file paths from multer
    const avatarLocalPath = req.files?.avatar?.[0]?.path
    const coverImageLocalPath = req.files?.coverImage?.[0]?.path
    if (!avatarLocalPath) throw new ApiError(400, "Avatar file is required")

    // upload avatar to Cloudinary
    const avatar = await uploadOnCloudinary(avatarLocalPath)
    // upload cover image to Cloudinary if provided
    const coverImage = coverImageLocalPath ? await uploadOnCloudinary(coverImageLocalPath) : null
    if (!avatar) throw new ApiError(400, "Avatar upload failed")

    // create new user document
    const user = await User.create({
        fullName,
        avatar: avatar.url,
        coverImage: coverImage?.url || "",
        email,
        password,
        username: username.toLowerCase()
    })

    // fetch created user without sensitive fields
    const createdUser = await User.findById(user._id).select("-password -refreshToken")
    if (!createdUser) throw new ApiError(500, "Error while registering user")

    return res.status(201).json(new ApiResponse(200, createdUser, "User registered successfully"))
})

// Authenticate user and issue tokens
const loginUser = asyncHandler(async (req, res) => {
    const { email, username, password } = req.body
    // require either username or email
    if (!username && !email) throw new ApiError(400, "Username or email is required")

    // find user by username or email
    const user = await User.findOne({ $or: [{ username }, { email }] })
    if (!user) throw new ApiError(404, "User not found")

    // validate password
    const isPasswordValid = await user.isPasswordCorrect(password)
    if (!isPasswordValid) throw new ApiError(401, "Invalid credentials")

    // generate access and refresh tokens and persist refresh token
    const { accessToken, refreshToken } = await generateAccessAndRefreshTokens(user._id)
    // fetch user to return (exclude sensitive fields)
    const loggedInUser = await User.findById(user._id).select("-password -refreshToken")

    // cookie options for security
    const options = { httpOnly: true, secure: true }

    // set cookies and return response
    return res
        .status(200)
        .cookie("accessToken", accessToken, options)
        .cookie("refreshToken", refreshToken, options)
        .json(
            new ApiResponse(200, { user: loggedInUser, accessToken, refreshToken }, "User logged in successfully")
        )
})

// Logout user and clear cookies
const logoutUser = asyncHandler(async (req, res) => {
    // remove refresh token from DB
    await User.findByIdAndUpdate(req.user._id, { $unset: { refreshToken: 1 } }, { new: true })
    const options = { httpOnly: true, secure: true }

    // clear auth cookies
    return res
        .status(200)
        .clearCookie("accessToken", options)
        .clearCookie("refreshToken", options)
        .json(new ApiResponse(200, {}, "User logged out successfully"))
})

// Refresh access token using valid refresh token
const refreshAccessToken = asyncHandler(async (req, res) => {
    // read refresh token from cookie or body
    const incomingRefreshToken = req.cookies?.refreshToken || req.body?.refreshToken
    if (!incomingRefreshToken) throw new ApiError(401, "Unauthorized request")

    try {
        // verify refresh token signature
        const decodedToken = jwt.verify(incomingRefreshToken, process.env.REFRESH_TOKEN_SECRET)
        // load user referenced in token
        const user = await User.findById(decodedToken?._id)
        if (!user) throw new ApiError(401, "Invalid refresh token")

        // ensure supplied token matches stored token
        if (incomingRefreshToken !== user.refreshToken)
            throw new ApiError(401, "Refresh token expired or already used")

        // generate new tokens and persist new refresh token
        const { accessToken, refreshToken: newRefreshToken } = await generateAccessAndRefreshTokens(user._id)
        const options = { httpOnly: true, secure: true }

        // set cookies and return new tokens
        return res
            .status(200)
            .cookie("accessToken", accessToken, options)
            .cookie("refreshToken", newRefreshToken, options)
            .json(new ApiResponse(200, { accessToken, refreshToken: newRefreshToken }, "Access token refreshed"))
    } catch (error) {
        throw new ApiError(401, error?.message || "Invalid refresh token")
    }
})

// Allow authenticated user to change password
const changeCurrentPassword = asyncHandler(async (req, res) => {
    const { oldPassword, newPassword } = req.body
    // load current user from DB
    const user = await User.findById(req.user?._id)

    // verify old password
    const isPasswordCorrect = await user.isPasswordCorrect(oldPassword)
    if (!isPasswordCorrect) throw new ApiError(400, "Invalid old password")

    // assign new password and save (pre-save hook will hash it)
    user.password = newPassword
    await user.save({ validateBeforeSave: false })

    return res.status(200).json(new ApiResponse(200, {}, "Password changed successfully"))
})

// Return currently authenticated user info
const getCurrentUser = asyncHandler(async (req, res) => {
    // return user attached by auth middleware
    return res.status(200).json(new ApiResponse(200, req.user, "User fetched successfully"))
})

// Update user full name and email
const updateAccountDetails = asyncHandler(async (req, res) => {
    const { fullName, email } = req.body
    // validate required fields
    if (!fullName || !email) throw new ApiError(400, "All fields are required")

    // update and return updated user (exclude password)
    const user = await User.findByIdAndUpdate(
        req.user?._id,
        { $set: { fullName, email } },
        { new: true }
    ).select("-password")

    return res.status(200).json(new ApiResponse(200, user, "Account details updated successfully"))
})

// Replace user avatar image
const updateUserAvatar = asyncHandler(async (req, res) => {
    // get uploaded file path from multer
    const avatarLocalPath = req.file?.path
    if (!avatarLocalPath) throw new ApiError(400, "Avatar file is required")

    // upload avatar to Cloudinary
    const avatar = await uploadOnCloudinary(avatarLocalPath)
    if (!avatar.url) throw new ApiError(400, "Avatar upload failed")

    // update user avatar URL in DB
    const user = await User.findByIdAndUpdate(
        req.user?._id,
        { $set: { avatar: avatar.url } },
        { new: true }
    ).select("-password")

    return res.status(200).json(new ApiResponse(200, user, "Avatar updated successfully"))
})

// Replace user cover image
const updateUserCoverImage = asyncHandler(async (req, res) => {
    // get uploaded file path from multer
    const coverImageLocalPath = req.file?.path
    if (!coverImageLocalPath) throw new ApiError(400, "Cover image file is required")

    // upload cover image to Cloudinary
    const coverImage = await uploadOnCloudinary(coverImageLocalPath)
    if (!coverImage.url) throw new ApiError(400, "Cover image upload failed")

    // update user cover image URL in DB
    const user = await User.findByIdAndUpdate(
        req.user?._id,
        { $set: { coverImage: coverImage.url } },
        { new: true }
    ).select("-password")

    return res.status(200).json(new ApiResponse(200, user, "Cover image updated successfully"))
})

// Retrieve user channel profile including subscriber data
const getUserChannelProfile = asyncHandler(async (req, res) => {
    const { username } = req.params
    if (!username?.trim()) throw new ApiError(400, "Username is required")

    // aggregate channel and subscription data
    const channel = await User.aggregate([
        { $match: { username: username.toLowerCase() } },
        {
            $lookup: {
                from: "subscriptions",
                localField: "_id",
                foreignField: "channel",
                as: "subscribers"
            }
        },
        {
            $lookup: {
                from: "subscriptions",
                localField: "_id",
                foreignField: "subscriber",
                as: "subscribedTo"
            }
        },
        {
            $addFields: {
                // count subscribers
                subscribersCount: { $size: "$subscribers" },
                // count channels this user has subscribed to
                channelsSubscribedToCount: { $size: "$subscribedTo" },
                // determine if requesting user is subscribed
                isSubscribed: {
                    $cond: {
                        if: { $in: [req.user?._id, "$subscribers.subscriber"] },
                        then: true,
                        else: false
                    }
                }
            }
        },
        {
            // project only needed fields
            $project: {
                fullName: 1,
                username: 1,
                subscribersCount: 1,
                channelsSubscribedToCount: 1,
                isSubscribed: 1,
                avatar: 1,
                coverImage: 1
            }
        }
    ])

    if (!channel?.length) throw new ApiError(404, "Channel not found")

    return res.status(200).json(new ApiResponse(200, channel[0], "Channel profile fetched successfully"))
})

// Fetch watch history with populated video and owner details
const getWatchHistory = asyncHandler(async (req, res) => {
    // aggregation pipeline to populate videos and their owners
    const user = await User.aggregate([
        { $match: { _id: new mongoose.Types.ObjectId(req.user._id) } },
        {
            $lookup: {
                from: "videos",
                localField: "watchHistory",
                foreignField: "_id",
                as: "watchHistory",
                pipeline: [
                    {
                        // populate video owner details
                        $lookup: {
                            from: "users",
                            localField: "owner",
                            foreignField: "_id",
                            as: "owner",
                            pipeline: [
                                { $project: { fullName: 1, username: 1, avatar: 1 } }
                            ]
                        }
                    },
                    // flatten owner array to single object
                    { $addFields: { owner: { $first: "$owner" } } }
                ]
            }
        }
    ])

    return res.status(200).json(new ApiResponse(200, user[0].watchHistory, "Watch history fetched successfully"))
})

export {
    registerUser,
    loginUser,
    logoutUser,
    refreshAccessToken,
    changeCurrentPassword,
    getCurrentUser,
    updateAccountDetails,
    updateUserAvatar,
    updateUserCoverImage,
    getUserChannelProfile,
    getWatchHistory
}
