import { isValidObjectId } from "mongoose";
import { Like } from "../models/like.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponce } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

// POST /api/v1/likes/toggle/v/:videoId
const toggleVideoLike = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
  if (!isValidObjectId(videoId)) throw new ApiError(400, "Invalid video id");

  const existing = await Like.findOne({
    video: videoId,
    likedBy: req.user._id,
  });

  if (existing) {
    await Like.findByIdAndDelete(existing._id);
    return res
      .status(200)
      .json(new ApiResponce(200, { liked: false }, "Like removed"));
  }

  await Like.create({ video: videoId, likedBy: req.user._id });
  return res.status(200).json(new ApiResponce(200, { liked: true }, "Liked"));
});

// POST /api/v1/likes/toggle/c/:commentId
const toggleCommentLike = asyncHandler(async (req, res) => {
  const { commentId } = req.params;
  if (!isValidObjectId(commentId)) throw new ApiError(400, "Invalid comment id");

  const existing = await Like.findOne({
    comment: commentId,
    likedBy: req.user._id,
  });

  if (existing) {
    await Like.findByIdAndDelete(existing._id);
    return res
      .status(200)
      .json(new ApiResponce(200, { liked: false }, "Like removed"));
  }

  await Like.create({ comment: commentId, likedBy: req.user._id });
  return res.status(200).json(new ApiResponce(200, { liked: true }, "Liked"));
});

// GET /api/v1/likes/videos — videos the current user liked
const getLikedVideos = asyncHandler(async (req, res) => {
  const likes = await Like.find({
    likedBy: req.user._id,
    video: { $exists: true, $ne: null },
  }).populate({
    path: "video",
    populate: { path: "owner", select: "username fullName avatar" },
  });

  const videos = likes.map((l) => l.video).filter(Boolean);

  return res
    .status(200)
    .json(new ApiResponce(200, videos, "Liked videos fetched successfully"));
});

export { toggleVideoLike, toggleCommentLike, getLikedVideos };
