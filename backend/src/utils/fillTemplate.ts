import * as fs from "fs";
import * as path from "path";
import PizZip from "pizzip";
import Docxtemplater from "docxtemplater";
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
export async function fillTemplate({ dicomPath, dataForm }: { dicomPath: string; dataForm: DataForm; }): Promise<void> {
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

        // 2️⃣ Đọc file DOCX template
        const templateContent = fs.readFileSync(TEMPLATE_PATH, "binary");
        const zip = new PizZip(templateContent);
        const doc = new Docxtemplater(zip, {});
        // 5️⃣ Tạo dữ liệu thay thế

        const f_id = [
            {
                id_0: dataForm.forecast[0]?.toFixed(6) || "N/A",
                id_1: dataForm.forecast[1]?.toFixed(6) || "N/A",
                id_2: dataForm.forecast[2]?.toFixed(6) || "N/A",
                id_3: dataForm.forecast[3]?.toFixed(6) || "N/A",
                id_4: dataForm.forecast[4]?.toFixed(6) || "N/A",
                id_5: dataForm.forecast[4]?.toFixed(6) || "N/A",
            }
        ];
        doc.render({
            patient_id: dataForm.patient_id,
            patient_name: dataForm.name,
            group: dataForm.group,
            collectFees: dataForm.collectFees,
            age: dataForm.age,
            sex: dataForm.sex,
            address: dataForm.address,
            diagnosis: dataForm.diagnosis,
            general_conclusion: dataForm.general_conclusion,
            f_id: f_id,
            images_predict: {
                width: 6, // cm
                height: 4, // cm
                data: fs.readFileSync(pngPath).toString("base64"),
                extension: ".png",
            },
        });
        // // 3️⃣ Tạo báo cáo với dữ liệu
        // const report = await createReport({
        //     template: templateContent,
        //     data: {
        //         patient_id: dataForm.patient_id,
        //         patient_name: dataForm.name,
        //         group: dataForm.group,
        //         collectFees: dataForm.collectFees,
        //         age: dataForm.age,
        //         sex: dataForm.sex,
        //         address: dataForm.address,
        //         diagnosis: dataForm.diagnosis,
        //         general_conclusion: dataForm.general_conclusion,
        //         f_id: f_id,
        //         images_predict: {
        //             width: 6, // cm
        //             height: 4, // cm
        //             data: fs.readFileSync(pngPath).toString("base64"),
        //             extension: ".png",
        //         },
        //     },
        // });

        // 4️⃣ Ghi file DOCX kết quả
        // fs.writeFileSync(OUTPUT_DOCX_PATH, report);
        fs.writeFileSync(OUTPUT_DOCX_PATH, doc.getZip().generate({ type: "nodebuffer" }));
        console.log(`✅ File báo cáo đã được tạo: ${OUTPUT_DOCX_PATH}`);
    } catch (error) {
        console.error("❌ Lỗi khi tạo báo cáo:", error);
    }
}