import express from "express";
const router = express.Router();
import isAuth from "../middleware/auth.js";

import {
  chatList,
  getOrCreate,
  createGroup,
  renameGroup,
  removeFromGroup,
  addToGroup,
} from "../controllers/chat.js";

router.get("/fetch", isAuth, getOrCreate);
router.get("/chatlist", isAuth, chatList);
router.post("/group/create", isAuth, createGroup);
router.put("/group/rename", isAuth, renameGroup);
router.put("/group/remove", isAuth, removeFromGroup);
router.put("/group/add", isAuth, addToGroup);

export default router;
