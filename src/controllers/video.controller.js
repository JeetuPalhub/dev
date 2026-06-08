import mongoose, { isValidObjectId } from "mongoose";
import { Video } from "../models/video.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponce } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";

// GET /api/v1/videos — list published videos with search, sort & pagination
const getAllVideos = asyncHandler(async (req, res) => {
  const {
    page = 1,
    limit = 10,
    query = "",
    sortBy = "createdAt",
    sortType = "desc",
    userId,
  } = req.query;

  const match = { isPublished: true };

  if (query) {
    match.$or = [
      { title: { $regex: query, $options: "i" } },
      { description: { $regex: query, $options: "i" } },
    ];
  }
  if (userId && isValidObjectId(userId)) {
    match.owner = new mongoose.Types.ObjectId(userId);
  }

  const aggregate = Video.aggregate([
    { $match: match },
    {
      $lookup: {
        from: "users",
        localField: "owner",
        foreignField: "_id",
        as: "owner",
        pipeline: [{ $project: { username: 1, fullName: 1, avatar: 1 } }],
      },
    },
    { $addFields: { owner: { $first: "$owner" } } },
    { $sort: { [sortBy]: sortType === "asc" ? 1 : -1 } },
  ]);

  const result = await Video.aggregatePaginate(aggregate, {
    page: parseInt(page, 10),
    limit: parseInt(limit, 10),
  });

  return res
    .status(200)
    .json(new ApiResponce(200, result, "Videos fetched successfully"));
});

// POST /api/v1/videos — publish a new video (multipart: videoFile, thumbnail)
const publishAVideo = asyncHandler(async (req, res) => {
  const { title, description } = req.body;

  if (!title?.trim() || !description?.trim()) {
    throw new ApiError(400, "Title and description are required");
  }

  const videoLocalPath = req.files?.videoFile?.[0]?.path;
  const thumbnailLocalPath = req.files?.thumbnail?.[0]?.path;

  if (!videoLocalPath) throw new ApiError(400, "Video file is required");
  if (!thumbnailLocalPath) throw new ApiError(400, "Thumbnail is required");

  const videoFile = await uploadOnCloudinary(videoLocalPath);
  const thumbnail = await uploadOnCloudinary(thumbnailLocalPath);

  if (!videoFile) throw new ApiError(500, "Video upload failed");
  if (!thumbnail) throw new ApiError(500, "Thumbnail upload failed");

  const video = await Video.create({
    title,
    description,
    videoFile: videoFile.url,
    thumbnail: thumbnail.url,
    duration: videoFile.duration || 0,
    owner: req.user._id,
  });

  return res
    .status(201)
    .json(new ApiResponce(201, video, "Video published successfully"));
});

// GET /api/v1/videos/:videoId
const getVideoById = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
  if (!isValidObjectId(videoId)) throw new ApiError(400, "Invalid video id");

  const video = await Video.findById(videoId).populate(
    "owner",
    "username fullName avatar"
  );
  if (!video) throw new ApiError(404, "Video not found");

  // increment views and reflect the new count in the response
  await Video.findByIdAndUpdate(videoId, { $inc: { views: 1 } });
  video.views += 1;

  return res
    .status(200)
    .json(new ApiResponce(200, video, "Video fetched successfully"));
});

// PATCH /api/v1/videos/:videoId — update title/description/thumbnail
const updateVideo = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
  const { title, description } = req.body;

  if (!isValidObjectId(videoId)) throw new ApiError(400, "Invalid video id");

  const video = await Video.findById(videoId);
  if (!video) throw new ApiError(404, "Video not found");
  if (video.owner.toString() !== req.user._id.toString()) {
    throw new ApiError(403, "You are not allowed to edit this video");
  }

  if (title) video.title = title;
  if (description) video.description = description;

  const thumbnailLocalPath = req.file?.path;
  if (thumbnailLocalPath) {
    const thumbnail = await uploadOnCloudinary(thumbnailLocalPath);
    if (thumbnail?.url) video.thumbnail = thumbnail.url;
  }

  await video.save();

  return res
    .status(200)
    .json(new ApiResponce(200, video, "Video updated successfully"));
});

// DELETE /api/v1/videos/:videoId
const deleteVideo = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
  if (!isValidObjectId(videoId)) throw new ApiError(400, "Invalid video id");

  const video = await Video.findById(videoId);
  if (!video) throw new ApiError(404, "Video not found");
  if (video.owner.toString() !== req.user._id.toString()) {
    throw new ApiError(403, "You are not allowed to delete this video");
  }

  await Video.findByIdAndDelete(videoId);

  return res
    .status(200)
    .json(new ApiResponce(200, {}, "Video deleted successfully"));
});

// PATCH /api/v1/videos/toggle/publish/:videoId
const togglePublishStatus = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
  if (!isValidObjectId(videoId)) throw new ApiError(400, "Invalid video id");

  const video = await Video.findById(videoId);
  if (!video) throw new ApiError(404, "Video not found");
  if (video.owner.toString() !== req.user._id.toString()) {
    throw new ApiError(403, "Not allowed");
  }

  video.isPublished = !video.isPublished;
  await video.save();

  return res
    .status(200)
    .json(
      new ApiResponce(200, video, "Publish status toggled successfully")
    );
});

export {
  getAllVideos,
  publishAVideo,
  getVideoById,
  updateVideo,
  deleteVideo,
  togglePublishStatus,
};
