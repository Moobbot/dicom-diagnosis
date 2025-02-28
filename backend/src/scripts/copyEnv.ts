const { execSync } = require("child_process");
const os = require("os");

// Kiểm tra hệ điều hành
const isWindows = os.platform() === "win32";
const copyCommand = isWindows ? "copy .env dist\\.env" : "cp .env dist/.env";

try {
    execSync(copyCommand, { stdio: "inherit", shell: true });
    console.log(".env file copied successfully.");
} catch (error) {
    console.error("Error copying .env file:", error);
    process.exit(1);
}
