import { NextFunction, Request, Response } from "express";

import UAParser from "ua-parser-js";

import { IAccessHistory } from "../interfaces/access-history.interface";

import { AccessHistoryService } from "../services/access-history.service";

import redactLogData from "../utils/redact-logs";

const accessHistoryService = new AccessHistoryService();

const accessHistoryMiddleware = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    let username = "Unknown";
    if (req.userData && req.userData.username) {
        username = req.userData.username;
    } else if (req.body && req.body.username) {
        username = req.body.username;
    }

    const userAgent = req.headers["user-agent"] || "";
    const parser = new UAParser(userAgent);
    const result = parser.getResult();

    // console.log(result);

    const osType = (() => {
        const osName = result.os.name?.toLowerCase();
        if (!osName) return "unknown";
        if (
            osName.includes("windows") ||
            osName.includes("mac os") ||
            osName.includes("linux")
        ) {
            return "Desktop";
        }
        if (osName.includes("android") || osName.includes("ios")) {
            return "Mobile";
        }
        return "Other";
    })();

    const accessData: Partial<IAccessHistory> = {
        username: username,
        actionName: req.method,
        api: req.originalUrl,
        ip: req.ip,
        deviceName: result.device.vendor || "Unknown",
        deviceModel: result.device.model || "Unknown",
        deviceType: result.device.type || "Unknown",
        osName: result.os.name || "Unknown",
        osVer: result.os.version || "Unknown",
        osType,
        browserName: result.browser.name || "Unknown",
        browserVer: result.browser.version || "Unknown",
        browserType: result.engine.name || "Unknown",
        miscellaneous: {
            status: null, // sẽ cập nhật sau khi hoàn thành request
            message: "",
            requestBody:
                req.method === "POST" || req.method === "PUT"
                    ? redactLogData(req.body)
                    : null,
        },
    };

    // Tạo AccessHistory sau khi response gửi đi
    res.on("finish", async () => {
        accessData.miscellaneous!.status =
            res.statusCode >= 200 && res.statusCode < 300 ? true : false;
        try {
            accessHistoryService.createAccessHistory(accessData);
        } catch (error) {
            console.error("Something went wrong:", error);
        }
    });

    next();
};

export default accessHistoryMiddleware;
