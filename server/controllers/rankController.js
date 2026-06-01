import KeywordTracking from "../models/keywordTracking.js";
import {keywordTracking} from "../services/keywordtrackingService.js";

//add a keyword to track 
export const addKeyword = async (req, res) => {
    try{
        const {keyword, url} = req.body;

        if(!keyword || !url) return res.status(400).json({ success: false, message: "Keyword and URL are required" });

        //extract domain from url

        let domain;
        try{
            const urlObj =new URL(url.startsWith("http") ? url : `http://${url}`);
            domain = urlObj.hostname.replace("www.", "");
        }catch {
            return res.status(400).json({ success: false, message: "Invalid URL format" });
        }

        //check if already tracking this keyword for the user
        const existing= await KeywordTracking.findOne({ userId: req.user._id, keyword: keyword.toLowerCase(), domain });
        
        if(existing) return res.status(400).json({ success: false, message: "Already tracking this keyword for the given URL" });

        //create new entry
        const tracking = await KeywordTracking.create({
            userId: req.user._id,
            keyword: keyword.toLowerCase().trim(),
            url: url.startsWith("http") ? url : `http://${url}`,
            domain,
            status: "checking",
        })

        res.status(201).json({ success: true, message: "Keyword added for tracking", tracking });
        keywordTracking(tracking);

    } catch(error){
        console.error("Add Keyword Error", error.message);
        if(error.code === 11000){
            return res.status(400).json({ success: false, message: "Already tracking this keyword for the given URL" });
        }
        res.status(500).json({ success: false, message: "Server Error" });
    }
}

//get all tracked keywords for user
export const getKeywords = async (req, res) => {
    try{
        const keywords = await KeywordTracking.find({ userId: req.user._id }).sort({ createdAt: -1 }).select("-rankHistory");
        res.status(200).json({ success: true, keywords });
    }catch(error){
        console.error("Get Keywords Error", error.message);
        res.status(500).json({ success: false, message: "Server Error" });
    }
}

//get single keyword with full history
export const getKeyword = async (req, res) => {
    try{
        const tracking = await KeywordTracking.findOne({ _id: req.params.id, userId: req.user._id });
        if(!tracking) return res.status(404).json({ success: false, message: "Keyword not found" });
        res.status(200).json({ success: true, tracking });
    }catch(error){
        console.error("Get Keyword Error", error.message);
        res.status(500).json({ success: false, message: "Server Error" });
    }
}

//Manually refresh a keyword ranking
export const refreshKeyword = async (req, res) => {
    try{
        const tracking = await KeywordTracking.findOne({ _id: req.params.id, userId: req.user._id });
        if(!tracking) return res.status(404).json({ success: false, message: "Keyword not found" });
        tracking.status = "checking";
        await tracking.save();
        res.status(200).json({ success: true, message: "rank check initiated" });
        keywordTracking(tracking);
    }catch(error){
        console.error("Refresh Keyword Error", error.message);
        res.status(500).json({ success: false, message: "Server Error" });
    }
}

//delte keyword from tracking
export const deleteKeyword = async (req, res) => {
    try{
        const tracking = await KeywordTracking.findOneAndDelete({ _id: req.params.id, userId: req.user._id });
        if(!tracking) return res.status(404).json({ success: false, message: "Keyword not found" });
        res.status(200).json({ success: true, message: "Keyword removed from tracking" });
    }catch(error){
        console.error("Delete Keyword Error", error.message);
        res.status(500).json({ success: false, message: "Server Error" });
    }
}

//toggle tracking status of a keyword
export const toggleTracking = async (req, res) => {
    try{
        const tracking = await KeywordTracking.findOne({ _id: req.params.id, userId: req.user._id });
        if(!tracking) return res.status(404).json({ success: false, message: "Keyword not found" });
        tracking.active = !tracking.active;
        await tracking.save();
        res.status(200).json({ success: true, tracking });
    }catch(error){
        console.error("Toggle Tracking Error", error.message);
        res.status(500).json({ success: false, message: "Server Error" });
    }
}