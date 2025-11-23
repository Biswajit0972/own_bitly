import {Request, Response} from "express";
import {asyncHandler} from "../../utils/asyncHandler";
import {AppError} from "../../utils/AppError";
import db from "../../db/databaseConnection";
import {shortUrlSchema} from "../../db/schema/shortUrl.schema";
import {eq} from "drizzle-orm";
import {CachedUrl, ShortCode} from "../../utils/Types/types";
import {clicksOnShortUrlsSchema} from "../../db/schema/clicks_on_short_urls.schema.ts";
import {client} from "../../redis/client.ts";

export const redirect = asyncHandler(async (req: Request, res: Response) => {

    const {shortCode} = req.params as ShortCode;

    const cachedUrl = await client.json.get(shortCode) as CachedUrl | null;

    if (cachedUrl) {
        console.log(`cache hit`)

        const isItValid = getTime(cachedUrl.expirationDate!) > Date.now();

        if (!isItValid) {
            throw new AppError(410, "Short URL has expired");
        }

        await storeAnalytics(shortCode, req);

        return res.status(302).redirect(cachedUrl.longUrl);
    }

    console.log("cache fault")

    const result = await db
        .select({
            id: shortUrlSchema.id,
            shortCode: shortUrlSchema.shortCode,
            long_url: shortUrlSchema.long_url,
            expirationDate: shortUrlSchema.expirationDate,
        })
        .from(shortUrlSchema)
        .where(eq(shortUrlSchema.shortCode, shortCode))
        .limit(1);


    if (result.length === 0) {
        throw new AppError(404, "Short URL not found");
    }

    if (getTime(result[0].expirationDate!) < Date.now()) {
        throw new AppError(410, "Short URL has expired");
    }

    let targetUrl = result[0].long_url;

    if (!/^https?:\/\//i.test(targetUrl)) {
        targetUrl = `https://${targetUrl}`;
    }

    await storeAnalytics(shortCode, req);

    const cachedObj = {
        longUrl: targetUrl,
        shortCode: result[0].shortCode,
        expirationDate: result[0].expirationDate,
    } as CachedUrl;

    await client.json.set(shortCode, "$", cachedObj);

    await client.expire(shortCode, 60);

    return res.status(302).redirect(targetUrl);
});

const storeAnalytics = async (shortCode: string, req: Request) => {
    try {
        const userAgent = req.headers['user-agent'];
        const ipAddress = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
        const referer = req.headers['referer'] || 'Direct';
        const browser = getUserAgentInfo(userAgent || "");
            console.table([ipAddress, referer, browser]);
        await db.insert(clicksOnShortUrlsSchema).values({
            short_code: shortCode,
            ip_address: ipAddress as string,
            browser: browser as string,
            referer: referer as string,
            user_agent: userAgent as string
        }).execute();
    } catch (e) {
        console.log(e)

    }
}

const getTime = (date: string) => {
    return new Date(date).getTime();
}

const getUserAgentInfo = (userAgent: string) => {
   
  let browser = "Unknown Browser";
  
  if (userAgent.includes("Edg/")) browser = "Microsoft Edge";
  else if (userAgent.includes("OPR/")) browser = "Opera";
  else if (userAgent.includes("Chrome/")) browser = "Google Chrome";
  else if (userAgent.includes("Firefox/")) browser = "Mozilla Firefox";
  else if (userAgent.includes("Safari/")) browser = "Safari";
  else if (userAgent.includes("MSIE ") || userAgent.includes("Trident/")) browser = "Internet Explorer";
  else if (userAgent.includes("Bot") || userAgent.includes("bot") || userAgent.includes("Crawler") || userAgent.includes("Spider")) browser = "Bot";
  else if (userAgent.includes("Mobile")) browser = "Mobile Browser";
  else if (userAgent.includes("Mozilla/")) browser = "Mozilla Compatible";
  else {
    browser = "postman";
  }

  return browser;
}