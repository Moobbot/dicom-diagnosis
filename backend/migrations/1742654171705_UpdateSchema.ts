import { Db, MongoClient } from "mongodb";
import { MigrationInterface } from "mongo-migrate-ts";

export class UpdateSchema1742654171705 implements MigrationInterface {
    public async up(db: Db, client: MongoClient): Promise<void | never> {
        const session = client.startSession();
        try {
            await session.withTransaction(async () => {
                // Migrate UserModel
                const users = await db.collection("users").find({}).toArray();
                for (const user of users) {
                    const updateObj = {
                        $rename: {
                            createdBy: "created_by",
                            updatedBy: "updated_by",
                            refreshToken: "refresh_token",
                            createdAt: "created_at",
                            updatedAt: "updated_at",
                            "detail_user.birth_date": "detail_user.dob",
                        },
                    };

                    await db
                        .collection("users")
                        .updateOne({ _id: user._id }, updateObj);
                }

                // Migrate RoleModel
                const roles = await db.collection("roles").find({}).toArray();
                for (const role of roles) {
                    const updateObj = {
                        $rename: {
                            createdBy: "created_by",
                            updatedBy: "updated_by",
                            grantAll: "grant_all",
                            createdAt: "created_at",
                            updatedAt: "updated_at",
                        },
                    };

                    await db
                        .collection("roles")
                        .updateOne({ _id: role._id }, updateObj);
                }

                // Migrate PermissionModel
                const permissions = await db
                    .collection("permissions")
                    .find({})
                    .toArray();
                for (const permission of permissions) {
                    const updateObj = {
                        $rename: {
                            createdBy: "created_by",
                            updatedBy: "updated_by",
                            createdAt: "created_at",
                            updatedAt: "updated_at",
                        },
                    };

                    await db
                        .collection("permissions")
                        .updateOne({ _id: permission._id }, updateObj);
                }

                // Migrate AccessHistoryModel - this is more complex due to structural changes
                const accessHistories = await db
                    .collection("accesshistories")
                    .find({})
                    .toArray();
                for (const history of accessHistories) {
                    // Prepare new structure for miscellany
                    const miscellany = {
                        status: 200, // Default status if not available
                        request_body: history.miscellaneous || {},
                        message: "",
                    };

                    // Create update object with renamed fields and new structure
                    const updateObj = {
                        username: history.username,
                        api: history.api || history.functionName || "",
                        http_method: history.actionName?.includes("GET")
                            ? "GET"
                            : history.actionName?.includes("POST")
                            ? "POST"
                            : history.actionName?.includes("PUT")
                            ? "PUT"
                            : history.actionName?.includes("DELETE")
                            ? "DELETE"
                            : "GET",
                        function_name: history.functionName || "",
                        ip_address: history.ip || "",
                        device_name: history.deviceName || "",
                        device_model: history.deviceModel || "",
                        device_type: history.deviceType || "",
                        os_name: history.osName || "",
                        os_ver: history.osVer || "",
                        os_type: history.osType || "",
                        browser_name: history.browserName || "",
                        browser_ver: history.browserVer || "",
                        browser_type: history.browserType || "",
                        miscellany: miscellany,
                        created_at: history.createdAt || new Date(),
                        updated_at: history.updatedAt || new Date(),
                    };

                    // Replace the entire document
                    await db
                        .collection("accesshistories")
                        .replaceOne({ _id: history._id }, updateObj);
                }
            });
        } finally {
            await session.endSession();
        }
    }

    public async down(db: Db, client: MongoClient): Promise<void | never> {
        const session = client.startSession();
        try {
            await session.withTransaction(async () => {
                // Revert UserModel changes
                const users = await db.collection("users").find({}).toArray();
                for (const user of users) {
                    const updateObj = {
                        $rename: {
                            created_by: "createdBy",
                            updated_by: "updatedBy",
                            refresh_token: "refreshToken",
                            created_at: "createdAt",
                            updated_at: "updatedAt",
                            "detail_user.dob": "detail_user.birth_date",
                        },
                    };

                    await db
                        .collection("users")
                        .updateOne({ _id: user._id }, updateObj);
                }

                // Revert RoleModel changes
                const roles = await db.collection("roles").find({}).toArray();
                for (const role of roles) {
                    const updateObj = {
                        $rename: {
                            created_by: "createdBy",
                            updated_by: "updatedBy",
                            grant_all: "grantAll",
                            created_at: "createdAt",
                            updated_at: "updatedAt",
                        },
                    };

                    await db
                        .collection("roles")
                        .updateOne({ _id: role._id }, updateObj);
                }

                // Revert PermissionModel changes
                const permissions = await db
                    .collection("permissions")
                    .find({})
                    .toArray();
                for (const permission of permissions) {
                    const updateObj = {
                        $rename: {
                            created_by: "createdBy",
                            updated_by: "updatedBy",
                            created_at: "createdAt",
                            updated_at: "updatedAt",
                        },
                    };

                    await db
                        .collection("permissions")
                        .updateOne({ _id: permission._id }, updateObj);
                }

                // Revert AccessHistoryModel - this would need a more complex logic to revert
                // This is a simplified version
                const accessHistories = await db
                    .collection("accesshistories")
                    .find({})
                    .toArray();
                for (const history of accessHistories) {
                    const oldStructure = {
                        username: history.username,
                        actionName: history.http_method || "",
                        functionName: history.function_name || "",
                        api: history.api || "",
                        ip: history.ip_address || "",
                        deviceName: history.device_name || "",
                        deviceModel: history.device_model || "",
                        deviceType: history.device_type || "",
                        osName: history.os_name || "",
                        osVer: history.os_ver || "",
                        osType: history.os_type || "",
                        browserName: history.browser_name || "",
                        browserVer: history.browser_ver || "",
                        browserType: history.browser_type || "",
                        miscellaneous: history.miscellany?.request_body || null,
                        createdAt: history.created_at || new Date(),
                        updatedAt: history.updated_at || new Date(),
                    };

                    await db
                        .collection("accesshistories")
                        .replaceOne({ _id: history._id }, oldStructure);
                }
            });
        } finally {
            await session.endSession();
        }
    }
}
