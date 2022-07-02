import Message from "../models/Message.js";
import mongoose from "mongoose";

export const sendMessage = async (req, res) => {
  try {
    const { text, chatId, media, parent } = req.body;
    // const chatId = req.query.chatId;

    if (!text || !chatId) {
      console.log("Invalid data passed into request");
      return res.sendStatus(400);
    }
    var data = {
      sender: req.user._id,
      text: text,
      chat: chatId,
      media,
      parent,
    };

    const newMessage = await new Message(data);
    const message = await newMessage.save();
    const createdOne = await Message.findOne({ _id: message._id })
      .populate("sender", "name pic")
      .populate({
        path: "chat",
        populate: {
          path: "users",
          select: "name pic email",
        },
      });

    res.status(200).send(createdOne);
  } catch (error) {
    console.log(error);
    res.status(400);
    throw new Error(error.message);
  }
};

export const getMessages = async (req, res) => {
  try {
    const messages = await Message.find({ chat: req.body.chatId })
      .populate("sender", "name pic email")
      .populate("chat")
      .populate({
        path: "parent",
        select: { _id: 1, text: 1, media: 1 },
        populate: {
          path: "sender",
          select: "name",
        },
      });

    res.status(200).send(messages);
  } catch (error) {
    console.log(error);
    res.status(400);
    throw new Error(error.message);
  }
};

export const deleteMessage = async (req, res) => {
  const id = req.body.messageId;
  try {
    const message = await Message.findOneAndUpdate(
      {
        _id: id,
        sender: req.user._id,
      },
      {
        $set: { text: "", media: [] },
      }
    );

    console.log(message);

    res.status(200).send({ message });
  } catch (error) {
    console.log(error);
    res.status(400);
    throw new Error(error.message);
  }
};

export const addReact = async (req, res) => {
  try {
    const { messageId, name } = req.body;

    if (!messageId || !name) {
      console.log("Invalid data passed into request");
      return res.sendStatus(400);
    }

    const message = await Message.findOne({ _id: messageId });
    const existedReact = message.react.find(
      (item) => item.person == req.user._id
    );

    console.log({ existedReact });

    if (existedReact) {
      if (existedReact.name == name) {
        message.react = message.react.filter(
          (item) => item.person != req.user._id
        );
      } else {
        message.react = message.react.filter(
          (item) => item.person != req.user._id
        );

        message.react.push({
          name,
          person: req.user._id,
        });
      }
    } else {
      message.react.push({
        name,
        person: req.user._id,
      });
    }

    await message.save();

    return res.status(200).json(message);
  } catch (error) {
    console.log(error);
    res.status(500).send(error);
  }
};
