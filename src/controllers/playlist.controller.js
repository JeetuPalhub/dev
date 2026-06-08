import { isValidObjectId } from "mongoose";
import { Playlist } from "../models/playlist.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponce } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

// POST /api/v1/playlists
const createPlaylist = asyncHandler(async (req, res) => {
  const { name, description } = req.body;
  if (!name?.trim() || !description?.trim()) {
    throw new ApiError(400, "Name and description are required");
  }

  const playlist = await Playlist.create({
    name,
    description,
    owner: req.user._id,
  });

  return res
    .status(201)
    .json(new ApiResponce(201, playlist, "Playlist created successfully"));
});

// GET /api/v1/playlists/user/:userId
const getUserPlaylists = asyncHandler(async (req, res) => {
  const { userId } = req.params;
  if (!isValidObjectId(userId)) throw new ApiError(400, "Invalid user id");

  const playlists = await Playlist.find({ owner: userId });

  return res
    .status(200)
    .json(new ApiResponce(200, playlists, "Playlists fetched successfully"));
});

// GET /api/v1/playlists/:playlistId
const getPlaylistById = asyncHandler(async (req, res) => {
  const { playlistId } = req.params;
  if (!isValidObjectId(playlistId))
    throw new ApiError(400, "Invalid playlist id");

  const playlist = await Playlist.findById(playlistId).populate({
    path: "videos",
    populate: { path: "owner", select: "username fullName avatar" },
  });
  if (!playlist) throw new ApiError(404, "Playlist not found");

  return res
    .status(200)
    .json(new ApiResponce(200, playlist, "Playlist fetched successfully"));
});

// PATCH /api/v1/playlists/add/:videoId/:playlistId
const addVideoToPlaylist = asyncHandler(async (req, res) => {
  const { playlistId, videoId } = req.params;
  if (!isValidObjectId(playlistId) || !isValidObjectId(videoId)) {
    throw new ApiError(400, "Invalid id");
  }

  const playlist = await Playlist.findById(playlistId);
  if (!playlist) throw new ApiError(404, "Playlist not found");
  if (playlist.owner.toString() !== req.user._id.toString()) {
    throw new ApiError(403, "Not allowed");
  }

  await Playlist.findByIdAndUpdate(playlistId, {
    $addToSet: { videos: videoId },
  });

  return res
    .status(200)
    .json(new ApiResponce(200, {}, "Video added to playlist"));
});

// PATCH /api/v1/playlists/remove/:videoId/:playlistId
const removeVideoFromPlaylist = asyncHandler(async (req, res) => {
  const { playlistId, videoId } = req.params;
  if (!isValidObjectId(playlistId) || !isValidObjectId(videoId)) {
    throw new ApiError(400, "Invalid id");
  }

  const playlist = await Playlist.findById(playlistId);
  if (!playlist) throw new ApiError(404, "Playlist not found");
  if (playlist.owner.toString() !== req.user._id.toString()) {
    throw new ApiError(403, "Not allowed");
  }

  await Playlist.findByIdAndUpdate(playlistId, { $pull: { videos: videoId } });

  return res
    .status(200)
    .json(new ApiResponce(200, {}, "Video removed from playlist"));
});

// DELETE /api/v1/playlists/:playlistId
const deletePlaylist = asyncHandler(async (req, res) => {
  const { playlistId } = req.params;
  if (!isValidObjectId(playlistId))
    throw new ApiError(400, "Invalid playlist id");

  const playlist = await Playlist.findById(playlistId);
  if (!playlist) throw new ApiError(404, "Playlist not found");
  if (playlist.owner.toString() !== req.user._id.toString()) {
    throw new ApiError(403, "Not allowed");
  }

  await Playlist.findByIdAndDelete(playlistId);

  return res
    .status(200)
    .json(new ApiResponce(200, {}, "Playlist deleted successfully"));
});

export {
  createPlaylist,
  getUserPlaylists,
  getPlaylistById,
  addVideoToPlaylist,
  removeVideoFromPlaylist,
  deletePlaylist,
};
