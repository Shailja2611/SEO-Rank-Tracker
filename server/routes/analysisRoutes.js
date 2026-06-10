import { analyzeUrl, deleteAnalysis, getAnalyses, getAnalysis } from "../controllers/analysisController";
import auth from "../middleware/auth.js";
import express from "express"

const analysisRouter = express.Router();

analysisRouter.post('/analyze' , auth , analyzeUrl);
analysisRouter.get('/list' , auth , getAnalyses);
analysisRouter.get('/:id' , auth , getAnalysis);
analysisRouter.delete('/list' , auth , deleteAnalysis);

export default analysisRouter;
