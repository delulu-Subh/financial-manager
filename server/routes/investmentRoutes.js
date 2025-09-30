import express from "express";
import { getInvestments, addInvestment } from "../controllers/investmentController.js";

const router = express.Router();

router.get("/", getInvestments);
router.post("/", addInvestment);

export default router;
 
