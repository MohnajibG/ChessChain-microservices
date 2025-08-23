import express from "express";
import { joinQueue, leaveQueue } from "../controllers/queueController.js";

const router = express.Router();

router.post("/join", joinQueue);
router.post("/leave", leaveQueue);

export default router;
