import express from "express";
const router = express.Router();
import isAuth from "../middleware/auth.js";

import {
  getMessages,
  sendMessage,
  deleteMessage,
  addReact,
} from "../controllers/message.js";

router.get("/", isAuth, getMessages);
router.post("/send", isAuth, sendMessage);
router.delete("/delete", isAuth, deleteMessage);
router.post("/react", isAuth, addReact);

export default router;
