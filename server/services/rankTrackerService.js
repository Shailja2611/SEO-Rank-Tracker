import "dotenv/config";

/**
 * Search Google through Serper and find the ranking
 * position of a target domain.
 *
 * @param {string} keyword
 * @param {string} targetDomain
 * @returns {Promise<object>}
 */
export async function rankTracker(keyword, targetDomain) {
    try {
        console.log("\n🔎 Starting rank check");
        console.log(`Keyword: ${keyword}`);
        console.log(`Target: ${targetDomain}`);

        // --------------------------------------------------
        // 1. Check Serper API key
        // --------------------------------------------------

        if (!process.env.SERPER_API_KEY) {
            throw new Error(
                "SERPER_API_KEY is missing from environment variables"
            );
        }

        // --------------------------------------------------
        // 2. Normalize target domain
        // --------------------------------------------------

        const cleanTarget = normalizeDomain(targetDomain);

        if (!cleanTarget) {
            throw new Error(
                `Invalid target domain: ${targetDomain}`
            );
        }

        console.log(`Normalized target: ${cleanTarget}`);

        // --------------------------------------------------
        // 3. Call Serper API
        // --------------------------------------------------

        console.log("🌐 Searching Google through Serper...");

        const response = await fetch(
            "https://google.serper.dev/search",
            {
                method: "POST",

                headers: {
                    "X-API-KEY": process.env.SERPER_API_KEY,
                    "Content-Type": "application/json",
                },

                body: JSON.stringify({
                    q: keyword,
                    gl: "us",
                    hl: "en",
                    num: 100,
                }),
            }
        );

        // --------------------------------------------------
        // 4. Handle Serper API errors
        // --------------------------------------------------

        if (!response.ok) {
            const errorText = await response.text();

            throw new Error(
                `Serper API error ${response.status}: ${errorText}`
            );
        }

        const data = await response.json();

        console.log("✅ Serper response received");

        // --------------------------------------------------
        // 5. Extract organic results
        // --------------------------------------------------

        const organicResults = Array.isArray(data.organic)
            ? data.organic
            : [];

        console.log(
            `📊 Organic results received: ${organicResults.length}`
        );

        // --------------------------------------------------
        // 6. Convert Serper results to our format
        // --------------------------------------------------

        const allResults = organicResults.map((result, index) => {
            const url = result.link || "";

            return {
                position: result.position || index + 1,
                domain: normalizeDomain(url),
                title: result.title || "",
                snippet: result.snippet || "",
                url,
            };
        });

        // --------------------------------------------------
        // 7. Find target domain
        // --------------------------------------------------

        const found = allResults.find((result) => {
            const resultDomain = normalizeDomain(result.domain);

            return (
                resultDomain === cleanTarget ||
                resultDomain.endsWith(`.${cleanTarget}`) ||
                cleanTarget.endsWith(`.${resultDomain}`)
            );
        });

        // --------------------------------------------------
        // 8. Build competitors ahead of target
        // --------------------------------------------------

        const competitorsAhead = found
            ? allResults
                  .filter(
                      (result) =>
                          result.position < found.position
                  )
                  .map((result) => ({
                      position: result.position,
                      domain: result.domain,
                      title: result.title,
                      url: result.url,
                      snippet: result.snippet,
                  }))
            : [];

        const competitorsAheadCount =
            competitorsAhead.length;

        // --------------------------------------------------
        // 9. Calculate page number
        // --------------------------------------------------

        const page = found
            ? Math.ceil(found.position / 10)
            : null;

        // --------------------------------------------------
        // 10. Build response
        // --------------------------------------------------

        const responseData = {
            keyword,
            targetDomain,

            position: found
                ? found.position
                : null,

            page,

            title: found?.title || "",

            snippet: found?.snippet || "",

            url: found?.url || "",

            competitors: competitorsAhead,

            competitorsAheadCount,

            totalResultsScanned: allResults.length,
        };

        // --------------------------------------------------
        // 11. Logging
        // --------------------------------------------------

        console.log("\n--------------------------------");
        console.log("🏁 Rank check complete");
        console.log("--------------------------------");

        console.log(`Keyword: ${keyword}`);
        console.log(`Target: ${targetDomain}`);

        if (found) {
            console.log(`🎯 Position: #${found.position}`);
            console.log(`📄 Google page: ${page}`);
            console.log(`🌐 Domain: ${found.domain}`);
            console.log(`🏆 Title: ${found.title}`);

            console.log(
                `👥 Competitors ahead: ${competitorsAheadCount}`
            );
        } else {
            console.log(
                "❌ Position: Not found in scanned results"
            );
        }

        console.log(
            `📊 Results scanned: ${allResults.length}`
        );

        console.log("--------------------------------\n");

        // --------------------------------------------------
        // 12. Return result
        // --------------------------------------------------

        return {
            success: true,
            data: responseData,
        };

    } catch (error) {
        // --------------------------------------------------
        // Error handling
        // --------------------------------------------------

        console.error(
            "\n❌ Rank check error:",
            error?.message || error
        );

        return {
            success: false,

            error:
                error?.message ||
                String(error),

            data: {
                keyword,
                targetDomain,

                position: null,
                page: null,

                title: "",
                snippet: "",
                url: "",

                competitors: [],
                competitorsAheadCount: 0,

                totalResultsScanned: 0,
            },
        };
    }
}


/**
 * Normalize a domain/URL so domain comparisons
 * are reliable.
 *
 * Examples:
 *
 * www.imdb.com
 * https://www.imdb.com/
 * http://imdb.com/title/123
 *
 * all become:
 *
 * imdb.com
 */
function normalizeDomain(domain) {
    if (!domain) {
        return "";
    }

    let value = String(domain)
        .trim()
        .toLowerCase();

    // Add protocol if missing
    if (
        !value.startsWith("http://") &&
        !value.startsWith("https://")
    ) {
        value = `https://${value}`;
    }

    try {
        const url = new URL(value);

        return url.hostname
            .toLowerCase()
            .replace(/^www\./, "")
            .replace(/\.$/, "");

    } catch {
        return String(domain)
            .toLowerCase()
            .replace(/^https?:\/\//, "")
            .replace(/^www\./, "")
            .split("/")[0]
            .split("?")[0]
            .split("#")[0]
            .trim();
    }
}