import {rankTracker} from "./rankTrackerService.js"


export async function keywordTracking(tracking){
    try{
        let result;

        // Try up to 2 times for temporary failures
        for (let attempt = 1; attempt <= 2; attempt++) {
            console.log(`🔄 Rank check attempt ${attempt}/2`);

            result = await rankTracker(
                tracking.keyword,
                tracking.domain
            );

            // Successful result
            if (
                result.success &&
                result.data.totalResultsScanned !== null
            ) {
                break;
            }

            // Google has blocked the automated request.
            // Do NOT create another Browserbase session.
            const errorMessage = result.error?.toLowerCase() || "";

            if (
                errorMessage.includes("challenge") ||
                errorMessage.includes("unusual traffic") ||
                errorMessage.includes("captcha") ||
                errorMessage.includes("automated queries")
            ) {
                console.log(
                    "🚫 Google blocked the request. Skipping retry."
                );
                break;
            }

            // Retry other temporary failures
            if (attempt < 2) {
                console.log("⏳ Retrying after 5 seconds...");

                await new Promise((r) =>
                    setTimeout(r, 5000)
                );
            }
        }
        if(result.success){
            const prev = tracking.currentPosition;
            const today = new Date();
            today.setHours(0,0,0,0);

            tracking.currentPosition = result.data.position;
            tracking.currentPage = result.data.page;
            tracking.lastChecked = new Date();
            tracking.status ="completed";
            tracking.competitors = result.data.competitors || [];

            //update stats
            tracking.positionChange = prev && result.data.position ? prev - result.data.position : 0;
            if(result.data.position && (!tracking.bestPosition || result.data.position 
                < tracking.bestPosition)){
                    tracking.bestPosition = result.data.position;
                }
                //update history
                const historyEntry = {
                    date: today,
                    position: result.data.position,
                    page: result.data.page,
                    title: result.data.title,
                    snippet: result.data.snippet
                };
                const idx= tracking.rankHistory.findIndex((h) => h.date.toDateString() === today.toDateString());
                if(idx >= 0){
                    tracking.rankHistory[idx] = historyEntry;
                }
                else{
                    tracking.rankHistory.push(historyEntry);
                }
        }
        else{
            tracking.status = "failed";
        }
        await tracking.save();
        return result;
    }catch(error){
        console.error("Rank update Error", error.message);
        tracking.status = "failed";
        try {
            await tracking.save();
        } catch (saveErr) {
            console.error("CRITICAL: failed to persist error status:", saveErr.message);
        }
        return {success: false, error: error.message};
    }
}