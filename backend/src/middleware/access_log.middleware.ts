import { NextFunction, Request, Response } from "express";

import UAParser from "ua-parser-js";

import { IAccessHistory } from "../interfaces/access-history.interface";

import { AccessHistoryService } from "../services/access-history.service";

import redactLogData from "../utils/redact-logs";

class AccessHistoryMiddleware {
    private readonly accessHistoryService: AccessHistoryService;

    constructor() {
        this.accessHistoryService = new AccessHistoryService();
    }

    public handle = async (req: Request, res: Response, next: NextFunction) => {
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
            if (!osName) return "Unknown";
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
            api: req.originalUrl,
            http_method: req.method,
            function_name: req.functionName || "",
            ip_address: req.ip,
            device_name: result.device.vendor,
            device_model: result.device.model,
            device_type: result.device.type,
            os_name: result.os.name,
            os_ver: result.os.version,
            os_type: osType,
            browser_name: result.browser.name,
            browser_ver: result.browser.version,
            browser_type: result.engine.name,
            miscellany: {
                status: 200,
                message: "",
                request_body:
                    req.method === "POST" || req.method === "PUT"
                        ? redactLogData(req.body)
                        : null,
            },
        };

        // Lưu lại phương thức json gốc
        const resJson = res.json;
        let responseBody: any;

        res.json = function (body: any) {
            responseBody = body;
            return resJson.call(this, body);
        };

        // Tạo AccessHistory sau khi response gửi đi
        res.on("finish", async () => {
            accessData.miscellany!.status = res.statusCode;
            accessData.miscellany!.message = responseBody?.message || "";
            try {
                this.accessHistoryService.createAccessHistory(accessData);
            } catch (error) {
                console.error("Something went wrong:", error);
            }
        });

        next();
    };
}

export default new AccessHistoryMiddleware().handle;
