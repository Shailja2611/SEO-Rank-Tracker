import {rankTracker} from "./rankTrackerService.js"


export async function keywordTracking(tracking){
    try{
        let result;

        //try up to 2 times for reliability
        for(let attempt =1; attempt <=2 ; attempt++){
            result = await rankTracker(tracking.keyword, tracking.domain)
            if(result.success && result.data.totalResultsScanned > 0) break;
            if(attempt < 2) await new Promise((r)=> settimeou(r, result.success ? 3000 : 5000))
        }
        if(result.success){
            const prev = tracking.currentPosition;
            const today = new Date();
            today.setHours(0,0,0,0);

            tracking.currentPosition = result.data.position;
            tracking.currentPage = result.data.page;
            tracking.lastChecked = new Date();
            tracking.status ="completed";

            //update stats
            tracking.postionChange = prev && result.data.position ? prev - result.data.position : 0;
            if(result.data.position && (!tracking.bestPosition || result.data.position 
                < tracking.bestPosition)){
                    tracking.bestposition = result.data.position;
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
            tracking.status = "error";
        }
        await tracking.save();
        return result;
    }catch(error){
        console.error("Rank update Error", error.message);
        tracking.status = "error";
        await tracking.save().catch(()=> {});
        return {success: false, error: error.message};
    }
}