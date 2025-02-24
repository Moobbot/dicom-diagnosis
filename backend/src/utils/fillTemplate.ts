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
 * Hàm điền dữ liệu vào file DOCX và xuất file báo cáo
 */
export async function fillTemplate({
    dicomPath,
    dataForm
}: {
    dicomPath: string;
    dataForm: DataForm;
}): Promise<void> {
    try {
        // Tạo session_id nếu chưa có
        const session_id = dataForm.session_id ?? Date.now().toString();

        // Tạo thư mục lưu report nếu chưa có
        const reportFolder = path.join(validateEnv().linkSaveReport, session_id);

        if (!fs.existsSync(reportFolder)) fs.mkdirSync(reportFolder, { recursive: true });

        const OUTPUT_DOCX_PATH = path.join(reportFolder, "report.docx");

        // 1️⃣ Chuyển đổi ảnh DICOM sang PNG
        const pngPath = path.join(reportFolder, "dicom-image.png");
        await convertDicomToPng(dicomPath, pngPath);

        // Kiểm tra lại kích thước file PNG
        let retryCount = 0;
        while (!fs.existsSync(pngPath) || fs.statSync(pngPath).size === 0) {
            if (retryCount > 5) throw new Error("❌ Lỗi: File PNG không được tạo thành công!");
            console.log("🔄 Đợi file PNG được tạo...");
            await new Promise((resolve) => setTimeout(resolve, 500)); // Đợi 500ms
            retryCount++;
        }

        // 2️⃣ Đọc file template DOCX
        const templateBuffer = fs.readFileSync(TEMPLATE_PATH);
        // 5️⃣ Tạo dữ liệu thay thế

        const f_id = {
            id_0: dataForm.forecast[0] ? `${(dataForm.forecast[0] * 100).toFixed(2)}%` : "N/A",
            id_1: dataForm.forecast[1] ? `${(dataForm.forecast[1] * 100).toFixed(2)}%` : "N/A",
            id_2: dataForm.forecast[2] ? `${(dataForm.forecast[2] * 100).toFixed(2)}%` : "N/A",
            id_3: dataForm.forecast[3] ? `${(dataForm.forecast[3] * 100).toFixed(2)}%` : "N/A",
            id_4: dataForm.forecast[4] ? `${(dataForm.forecast[4] * 100).toFixed(2)}%` : "N/A",
            id_5: dataForm.forecast[5] ? `${(dataForm.forecast[5] * 100).toFixed(2)}%` : "N/A",
        };

        // 3️⃣ Tạo dữ liệu thay thế
        const data = {
            patient_id: dataForm.patient_id,
            name: dataForm.name,
            group: dataForm.group,
            collectFees: dataForm.collectFees,
            age: dataForm.age,
            sex: dataForm.sex,
            address: dataForm.address,
            diagnosis: dataForm.diagnosis,
            general_conclusion: dataForm.general_conclusion,
            ...f_id,
            images_predict: {
                width: 6, // cm
                height: 4, // cm
                data: await fs.promises.readFile(pngPath, "base64"), // Chỉ lấy Base64, không có tiền tố 'data:image/png;base64,'
                extension: ".png",
            },
        };

        // 4️⃣ Tạo file DOCX từ template
        const buffer = await createReport({
            template: templateBuffer,
            data,
            cmdDelimiter: ["{", "}"], // Đảm bảo sử dụng đúng `{}` làm ký tự định dạng
        });

        // 5️⃣ Lưu file DOCX mới
        fs.writeFileSync(OUTPUT_DOCX_PATH, buffer);
        console.log(`✅ File báo cáo đã được tạo: ${OUTPUT_DOCX_PATH}`);
    } catch (error) {
        console.error("❌ Lỗi khi tạo báo cáo:", error);
    }
}