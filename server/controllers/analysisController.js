import Analysis from "../models/Analysis.js";
import { analyzerSeoData } from "../services/geminiService.js";
import { scraperUrl } from "../services/scraperService.js";

// Analyze a URL
export const analyzeUrl = async (req, res) => {
    try {
        const { url } = req.body;

        if (!url) {
            return res.status(400).json({
                success: false,
                message: "URL is required"
            });
        }

        // Validate URL format
        let validUrl;

        try {
            validUrl = new URL(
                url.startsWith("http") ? url : `http://${url}`
            );
        } catch (error) {
            return res.status(400).json({
                success: false,
                message: "Invalid URL format"
            });
        }

        // Create analysis entry
        const analysis = await Analysis.create({
            userId: req.user._id,
            url: validUrl.href,
            status: "processing"
        });

        // Send immediate response
        res.json({
            success: true,
            message: "Analysis started",
            analysisId: analysis._id
        });

        // Run scraping and analysis in background
        try {
            // Step 1: Scrape URL
            const scrapeResult = await scraperUrl(validUrl.href);

            if (!scrapeResult.success) {
                analysis.status = "failed";
                await analysis.save();
                return;
            }
            console.log("Scrape result:", scrapeResult.data);
            // Step 2: Analyze with Gemini
            const aiResult = await analyzerSeoData(scrapeResult.data);

            if (!aiResult.success) {
                analysis.status = "failed";
                await analysis.save();
                return;
            }
            console.log("Gemini result:", aiResult.data);
            // Step 3: Save results
            analysis.overallScore = aiResult.data.overallScore || 0;
            analysis.categories = aiResult.data.categories || {};
            analysis.metaData = scrapeResult.data.metaData || {};
            analysis.headings = scrapeResult.data.headings || {};
            analysis.links = scrapeResult.data.links || {};
            analysis.images = scrapeResult.data.images || {};
            analysis.keywords = aiResult.data.keywords || [];
            analysis.issues = aiResult.data.issues || [];
            analysis.loadTime = scrapeResult.data.loadTime || 0;
            analysis.pageSize = scrapeResult.data.pageSize || 0;
            analysis.wordCount = scrapeResult.data.wordCount || 0;
            analysis.status = "completed";

            // IMPORTANT
            await analysis.save();

        } catch (bgError) {
            console.error(
                "Background analysis error:",
                bgError.message
            );

            try {
                analysis.status = "failed";
                await analysis.save();
            } catch (saveError) {
                console.error(
                    "Failed to save failed status:",
                    saveError.message
                );
            }
        }

    } catch (error) {
        console.error("Analyze URL error:", error.message);

        if (!res.headersSent) {
            res.status(500).json({
                success: false,
                message: "Server error"
            });
        }
    }
};


// Get analysis by ID
export const getAnalysis = async (req, res) => {
    try {
        const analysis = await Analysis.findOne({
            _id: req.params.id,
            userId: req.user._id
        });

        if (!analysis) {
            return res.status(404).json({
                success: false,
                message: "Analysis not found"
            });
        }

        res.json({
            success: true,
            analysis
        });

    } catch (error) {
        console.error("Get analysis error:", error.message);

        res.status(500).json({
            success: false,
            message: "Server error"
        });
    }
};


// Get all analyses for user
export const getAnalyses = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;

        console.log("Authenticated user:", req.user);
        console.log("Looking for analyses for:", req.user._id);

        const analyses = await Analysis.find({
            userId: req.user._id
        })
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit)
            .select("-issues -keywords");

        const total = await Analysis.countDocuments({
            userId: req.user._id
        });

        console.log("Fetched analyses:", analyses);
        console.log("Total analyses count:", total);

        res.json({
            success: true,
            analyses,
            pagination: {
                page,
                limit,
                total,
                pages: Math.ceil(total / limit)
            }
        });

    } catch (error) {
        console.error("Get analyses error:", error.message);

        res.status(500).json({
            success: false,
            message: "Server error"
        });
    }
};


// Delete analysis
export const deleteAnalysis = async (req, res) => {
    try {
        const deleted = await Analysis.findOneAndDelete({
            _id: req.params.id,
            userId: req.user._id
        });

        if (!deleted) {
            return res.status(404).json({
                success: false,
                message: "Analysis not found"
            });
        }

        res.json({
            success: true,
            message: "Analysis deleted"
        });

    } catch (error) {
        console.error("Delete analysis error:", error.message);

        res.status(500).json({
            success: false,
            message: "Server error"
        });
    }
};