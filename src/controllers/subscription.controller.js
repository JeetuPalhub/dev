import { isValidObjectId } from "mongoose";
import { Subscription } from "../models/subscription.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponce } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

// POST /api/v1/subscriptions/c/:channelId — toggle subscribe/unsubscribe
const toggleSubscription = asyncHandler(async (req, res) => {
  const { channelId } = req.params;
  if (!isValidObjectId(channelId)) throw new ApiError(400, "Invalid channel id");
  if (channelId === req.user._id.toString()) {
    throw new ApiError(400, "You cannot subscribe to yourself");
  }

  const existing = await Subscription.findOne({
    subscriber: req.user._id,
    channel: channelId,
  });

  if (existing) {
    await Subscription.findByIdAndDelete(existing._id);
    return res
      .status(200)
      .json(new ApiResponce(200, { subscribed: false }, "Unsubscribed"));
  }

  await Subscription.create({ subscriber: req.user._id, channel: channelId });
  return res
    .status(200)
    .json(new ApiResponce(200, { subscribed: true }, "Subscribed"));
});

// GET /api/v1/subscriptions/c/:channelId — list subscribers of a channel
const getUserChannelSubscribers = asyncHandler(async (req, res) => {
  const { channelId } = req.params;
  if (!isValidObjectId(channelId)) throw new ApiError(400, "Invalid channel id");

  const subscribers = await Subscription.find({ channel: channelId }).populate(
    "subscriber",
    "username fullName avatar"
  );

  return res
    .status(200)
    .json(
      new ApiResponce(
        200,
        { count: subscribers.length, subscribers },
        "Subscribers fetched"
      )
    );
});

// GET /api/v1/subscriptions/u/:subscriberId — channels a user subscribes to
const getSubscribedChannels = asyncHandler(async (req, res) => {
  const { subscriberId } = req.params;
  if (!isValidObjectId(subscriberId))
    throw new ApiError(400, "Invalid subscriber id");

  const channels = await Subscription.find({
    subscriber: subscriberId,
  }).populate("channel", "username fullName avatar");

  return res
    .status(200)
    .json(
      new ApiResponce(
        200,
        { count: channels.length, channels },
        "Subscribed channels fetched"
      )
    );
});

export { toggleSubscription, getUserChannelSubscribers, getSubscribedChannels };
