import * as fs from "fs";
import * as path from "path";
import { convertDicomToPng } from "./dicomToPng"; // Chuyển DICOM sang PNG
import { validateEnv } from "../config/env.config";
import createReport from "docx-templates";
import axios from "axios";
import FormData from "form-data";

// Đường dẫn file template DOCX
const TEMPLATE_PATH = path.join(validateEnv().linkTemplateReport, "report-hospital.docx");

/**
 * Điền dữ liệu vào mẫu DOCX
 */
interface DataForm {
    patient_id: string;
    name: string;
    age: string;
    sex: string;
    address?: string | null;
    diagnosis?: string | null;
    general_conclusion?: string | null;
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
    dicomPaths,
    dataForm
}: {
    dicomPaths: string[];
    dataForm: DataForm;
}): Promise<string | null> {
    try {
        // 1️⃣ Tạo session_id và thư mục lưu báo cáo
        const session_id = dataForm.session_id ?? Date.now().toString();
        const reportFolder = path.join(validateEnv().linkSaveReport, session_id);
        ensureDirectoryExistence(reportFolder);
        const OUTPUT_DOCX_PATH = path.join(reportFolder, "report.docx");

        console.log(`📂 Processing report for session: ${session_id}`);

        // 2️⃣ Chuyển đổi tất cả ảnh DICOM sang PNG bằng API Flask
        const formData = new FormData();
        dicomPaths.forEach((dicomPath) => {
            formData.append("files", fs.createReadStream(dicomPath));
        });

        const response = await axios.post(`${validateEnv().sybilModelBaseUrl}/convert-list`, formData, {
            headers: { "Content-Type": "multipart/form-data" },
        });

        const { images } = response.data;
        if (!images || images.length === 0) {
            throw new Error("❌ Did not receive images from API");
        }

        console.log(`✅ Images created from API:`, images.map((img: { filename: string }) => img.filename));

        // 3️⃣ Read DOCX template
        const templateBuffer = fs.readFileSync(TEMPLATE_PATH);

        // 4️⃣ Prepare data
        const forecastData = dataForm.forecast.map((value, index) =>
            value ? `${(value * 100).toFixed(2)}%` : "N/A"
        );

        const columns = 2; // Number of images per row
        // 5️⃣ Convert multiple PNG images to Base64 list
        const images_predict = images.map((image: { image_base64: string }) => ({
            width: 7, // cm  
            height: 7, // cm
            data: image.image_base64, // ✅ Use image_base64 instead of object image
            extension: ".png",
        }));

        // Divide the list of images into 2D arrays, each line contains `columns` images'
        const images_predict_rows = [];
        for (let i = 0; i < images_predict.length; i += columns) {
            images_predict_rows.push(images_predict.slice(i, i + columns));
        }

        const reportData = {
            patient_id: dataForm.patient_id,
            name: dataForm.name,
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
            images_predict_rows
        };

        // 6️⃣ Create DOCX file from template
        const buffer = await createReport({
            template: templateBuffer,
            data: reportData,
            cmdDelimiter: ["{", "}"],
        });

        // 5️⃣ Save new DOCX file
        fs.writeFileSync(OUTPUT_DOCX_PATH, buffer);
        console.log(`✅ Report created successfully: ${OUTPUT_DOCX_PATH}`);
        return OUTPUT_DOCX_PATH;
    } catch (error) {
        console.error("❌ Error when creating report:", error);
        return null;
    }
}

/**
 * Hàm điền dữ liệu vào file DOCX và xuất file báo cáo
 */
export async function fillTemplate_v0({
    dicomPaths,
    dataForm
}: {
    dicomPaths: string[];
    dataForm: DataForm;
}): Promise<string | null> {
    try {
        // 1️⃣ Create session_id and report directory
        const session_id = dataForm.session_id ?? Date.now().toString();
        const reportFolder = path.join(validateEnv().linkSaveReport, session_id);
        ensureDirectoryExistence(reportFolder);
        const OUTPUT_DOCX_PATH = path.join(reportFolder, "report.docx");

        console.log(`📂 Processing report for session: ${session_id}`);

        // 2️⃣ Convert all DICOM images to PNG
        const pngPaths: string[] = [];
        for (const [index, dicomPath] of dicomPaths.entries()) {
            const pngPath = path.join(reportFolder, `dicom-image-${index + 1}.png`);
            await convertDicomToPng(dicomPath, pngPath);

            // Check PNG file again (wait if not created)
            let retryCount = 0;
            while (!fs.existsSync(pngPath) || fs.statSync(pngPath).size === 0) {
                if (retryCount >= 5) throw new Error(`❌ PNG file ${index + 1} was not created: ${pngPath}`);
                console.log(`🔄 Waiting for PNG file ${index + 1} to be created...`);
                await new Promise((resolve) => setTimeout(resolve, 500)); // Wait 500ms
                retryCount++;
            }

            console.log(`✅ Image PNG ${index + 1} created: ${pngPath}`);
            pngPaths.push(pngPath);
        }

        console.log(`✅ PNG images created: ${pngPaths}`);

        // 3️⃣ Read DOCX template
        const templateBuffer = fs.readFileSync(TEMPLATE_PATH);

        // 4️⃣ Prepare data
        const forecastData = dataForm.forecast.map((value, index) =>
            value ? `${(value * 100).toFixed(2)}%` : "N/A"
        );

        const columns = 2; // Number of images per row
        // 5️⃣ Convert multiple PNG images to Base64 list
        const images_predict = await Promise.all(
            pngPaths.map(async (pngPath) => ({
                width: 7, // cm  
                height: 7, // cm
                data: await imageToBase64(pngPath),
                extension: ".png",
            }))
        );
        // Divide the list of images into 2D arrays, each line contains `columns` images
        const images_predict_rows = [];
        for (let i = 0; i < images_predict.length; i += columns) {
            images_predict_rows.push(images_predict.slice(i, i + columns));
        }

        const reportData = {
            patient_id: dataForm.patient_id,
            name: dataForm.name,
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
            images_predict_rows
        };

        // 6️⃣ Create DOCX file from template
        const buffer = await createReport({
            template: templateBuffer,
            data: reportData,
            cmdDelimiter: ["{", "}"],
        });

        // 5️⃣ Save new DOCX file
        fs.writeFileSync(OUTPUT_DOCX_PATH, buffer);
        console.log(`✅ Report created successfully: ${OUTPUT_DOCX_PATH}`);
        return OUTPUT_DOCX_PATH;
    } catch (error) {
        console.error("❌ Error when creating report:", error);
        return null;
    }
}