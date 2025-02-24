import * as fs from "fs";
import * as path from "path";
import { convertDicomToPng } from "./dicomToPng"; // Chuyển DICOM sang PNG
import { validateEnv } from "../config/env.config";
import createReport from "docx-templates";

// Đường dẫn file template DOCX
const TEMPLATE_PATH = path.join(validateEnv().linkTemplateReport, "report-hospital.docx");

/**
 * Điền dữ liệu vào mẫu DOCX
 */
interface DataForm {
    patient_id: string;
    name: string;
    group: string;
    collectFees: string;
    age: string;
    sex: string;
    address: string;
    diagnosis: string;
    general_conclusion: string;
    session_id?: string;
    file_name: string[];
    forecast: number[];
}

/**
 * Chuyển file PNG sang base64 để chèn vào DOCX
 */
async function imageToBase64(imagePath: string): Promise<string> {
    try {
        if (!fs.existsSync(imagePath)) throw new Error(`❌ File không tồn tại: ${imagePath}`);

        const buffer = await fs.promises.readFile(imagePath);
        if (buffer.length === 0) throw new Error(`❌ File PNG rỗng: ${imagePath}`);

        return buffer.toString("base64");
    } catch (error) {
        if (error instanceof Error) {
            console.error(error.message);
        } else {
            console.error(error);
        }
        return "";
    }
}

/**
 * Tạo thư mục nếu chưa tồn tại
 */
function ensureDirectoryExistence(dir: string) {
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
}

/**
 * Hàm điền dữ liệu vào file DOCX và xuất file báo cáo
 */
export async function fillTemplate({
    dicomPath,
    dataForm
}: {
    dicomPath: string;
    dataForm: DataForm;
}): Promise<string | null> {
    try {
        // 1️⃣ Tạo session_id và thư mục lưu báo cáo
        const session_id = dataForm.session_id ?? Date.now().toString();
        const reportFolder = path.join(validateEnv().linkSaveReport, session_id);
        ensureDirectoryExistence(reportFolder);
        const OUTPUT_DOCX_PATH = path.join(reportFolder, "report.docx");

        console.log(`📂 Đang xử lý báo cáo cho session: ${session_id}`);

        // 2️⃣ Chuyển đổi ảnh DICOM sang PNG
        const pngPath = path.join(reportFolder, "dicom-image.png");
        await convertDicomToPng(dicomPath, pngPath);

        // 3️⃣ Kiểm tra lại file PNG (đợi nếu chưa có)
        let retryCount = 0;
        while (!fs.existsSync(pngPath) || fs.statSync(pngPath).size === 0) {
            if (retryCount > 5) throw new Error("❌ Lỗi: File PNG không được tạo thành công!");
            console.log("🔄 Đợi file PNG được tạo...");
            await new Promise((resolve) => setTimeout(resolve, 500)); // Đợi 500ms
            retryCount++;
        }

        console.log(`✅ Ảnh PNG đã được tạo: ${pngPath}`);

        // 4️⃣ Đọc file template DOCX
        const templateBuffer = fs.readFileSync(TEMPLATE_PATH);

        // 5️⃣ Chuẩn bị dữ liệu
        const forecastData = dataForm.forecast.map((value, index) =>
            value ? `${(value * 100).toFixed(2)}%` : "N/A"
        );

        const reportData = {
            patient_id: dataForm.patient_id,
            name: dataForm.name,
            group: dataForm.group,
            collectFees: dataForm.collectFees,
            age: dataForm.age,
            sex: dataForm.sex,
            address: dataForm.address,
            diagnosis: dataForm.diagnosis,
            general_conclusion: dataForm.general_conclusion,
            id_0: forecastData[0],
            id_1: forecastData[1],
            id_2: forecastData[2],
            id_3: forecastData[3],
            id_4: forecastData[4],
            id_5: forecastData[5],
            images_predict: {
                width: 6, // cm
                height: 4, // cm
                data: await imageToBase64(pngPath),
                extension: ".png",
            },
        };

        // 6️⃣ Tạo file DOCX từ template
        const buffer = await createReport({
            template: templateBuffer,
            data: reportData,
            cmdDelimiter: ["{", "}"],
        });

        // 5️⃣ Lưu file DOCX mới
        fs.writeFileSync(OUTPUT_DOCX_PATH, buffer);
        console.log(`✅ Báo cáo đã được tạo thành công: ${OUTPUT_DOCX_PATH}`);
        return OUTPUT_DOCX_PATH;
    } catch (error) {
        console.error("❌ Lỗi khi tạo báo cáo:", error);
        return null;
    }
}