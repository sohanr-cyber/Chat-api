import Chat from "../models/Chat.js";

export const getOrCreate = async (req, res) => {
  try {
    const { userId } = req.body;

    if (!userId) {
      console.log("UserId param not sent with request");
      return res.sendStatus(400);
    }

    var existetChat = await Chat.find({
      isGroupChat: false,
      $and: [
        { users: { $elemMatch: { $eq: req.user._id } } },
        { users: { $elemMatch: { $eq: userId } } },
      ],
    })
      .populate("users", "-password")
      .populate("latestMessage");

    if (existetChat.length > 0) {
      res.send(existetChat[0]);
    } else {
      console.log("new chat");
      let chatData = {
        chatName: "sender",
        isGroupChat: false,
        users: [req.user._id, userId],
      };
      const newChat = await new Chat(chatData);
      const createdChat = await newChat.save();
      const FullChat = await Chat.findOne({ _id: createdChat._id })
        .populate("latestMessage")
        .populate("users", "-password");
      res.status(200).json(FullChat);
    }
  } catch (error) {
    console.log(error);
    res.status(400);
    throw new Error(error.message);
  }
};

export const chatList = async (req, res) => {
  try {
    const chats = await Chat.find({
      users: { $elemMatch: { $eq: req.user._id } },
    })
      .populate("users", "-password")
      .populate("groupAdmin", "-password")
      .populate("latestMessage")
      .sort({ updatedAt: -1 });

    console.log(chats);

    res.status(200).send(chats);
  } catch (error) {
    console.log(error);
    res.status(400);
    throw new Error(error.message);
  }
};

export const createGroup = async (req, res) => {
  try {
    if (!req.body.users || !req.body.name) {
      return res.status(400).send({ message: "Please Fill all the feilds" });
    }

    const users = JSON.parse(req.body.users);

    if (users.length < 2) {
      return res
        .status(400)
        .send("More than 2 users are required to form a group chat");
    }

    users.push(req.user);

    const groupChat = await Chat.create({
      chatName: req.body.name,
      users: users,
      isGroupChat: true,
      groupAdmin: req.user,
    });

    const fullGroupChat = await Chat.findOne({ _id: groupChat._id })
      .populate("users", "-password")
      .populate("groupAdmin", "-password");
    res.status(200).send(fullGroupChat);
  } catch (error) {
    console.log(error);
    res.status(400);
    throw new Error(error.message);
  }
};

export const renameGroup = async (req, res) => {
  try {
    const { chatId, chatName } = req.body;

    // check if the requester is admin

    const updatedChat = await Chat.findByIdAndUpdate(
      chatId,
      {
        chatName: chatName,
      },
      {
        new: true,
      }
    )
      .populate("users", "-password")
      .populate("groupAdmin", "-password");

    if (!updatedChat) {
      res.status(404);
      throw new Error("Chat Not Found");
    } else {
      res.json(updatedChat);
    }
  } catch (error) {
    console.log(error);
    res.status(500).send(error);
  }
};

export const removeFromGroup = async (req, res) => {
  try {
    const { chatId, userId } = req.body;

    // check if the requester is admin
    const chat = await Chat.findOne({
      isGroupChat: true,
      _id: chatId,
    }).select("groupAdmin");

    console.log(chat);
    // ObjectId("507c7f79bcf86cd7994f6c0e").toString()

    if (req.user._id !== chat.groupAdmin._id.toString()) {
      return res.status(403).send({ message: "your are not admin" });
    }

    const removed = await Chat.findByIdAndUpdate(
      chatId,
      {
        $pull: { users: userId },
      },
      {
        new: true,
      }
    )
      .populate("users", "-password")
      .populate("groupAdmin", "-password");

    if (!removed) {
      res.status(404);
      throw new Error("Chat Not Found");
    } else {
      res.json(removed);
    }
  } catch (error) {
    console.log(error);
    res.status(500).send(error);
  }
};

export const addToGroup = async (req, res) => {
  try {
    const { chatId, userId } = req.body;

    // check if the requester is admin
    const chat = await Chat.findOne({
      isGroupChat: true,
      _id: chatId,
    }).select("groupAdmin");

    // if (req.user._id !== chat.groupAdmin._id.toString()) {
    //   return res.status(403).send({ message: "your are not admin" });
    // }

    const added = await Chat.findByIdAndUpdate(
      chatId,
      {
        $addToSet: { users: userId },
      },
      {
        new: true,
      }
    )
      .populate("users", "-password")
      .populate("groupAdmin", "-password");

    if (!added) {
      res.status(404);
      throw new Error("Chat Not Found");
    } else {
      res.json(added);
    }
  } catch (error) {
    console.log(error);
    res.status(500).send(error);
  }
};
