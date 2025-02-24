import * as fs from "fs";
import * as dicomParser from "dicom-parser";
import { PNG } from "pngjs";

/**
 * Chuyển đổi file DICOM sang PNG
 * @param dicomPaths Đường dẫn file DICOM
 * @param outputDir Thư mục đầu ra để lưu ảnh PNG
 * @returns Đường dẫn ảnh PNG
 */
export async function convertDicomToPng(dicomPath: string, outputPngPath: string): Promise<void> {
    try {
        // Đọc file DICOM
        const dicomBuffer = fs.readFileSync(dicomPath);
        const dataSet = dicomParser.parseDicom(dicomBuffer);

        // Lấy thông tin ảnh từ DICOM
        const rows = dataSet.uint16("x00280010") || 0; // Số hàng
        const cols = dataSet.uint16("x00280011") || 0; // Số cột
        const pixelDataElement = dataSet.elements.x7fe00010; // Dữ liệu ảnh

        if (!pixelDataElement) {
            throw new Error("Không tìm thấy pixel data trong file DICOM.");
        }

        // Lấy mảng pixel từ file DICOM
        const pixelData = new Uint16Array(
            dicomBuffer.buffer,
            pixelDataElement.dataOffset,
            pixelDataElement.length / 2
        );

        // Tạo ảnh PNG từ dữ liệu pixel
        const png = new PNG({ width: cols, height: rows, bitDepth: 8 });

        for (let i = 0; i < rows * cols; i++) {
            const value = pixelData[i] & 0xff; // Chỉ lấy 8 bit thấp
            const index = i * 4;
            png.data[index] = value;      // Red
            png.data[index + 1] = value;  // Green
            png.data[index + 2] = value;  // Blue
            png.data[index + 3] = 255;    // Alpha
        }

        // Ghi file PNG và đảm bảo quá trình hoàn tất
        await new Promise<void>((resolve, reject) => {
            png.pack().pipe(fs.createWriteStream(outputPngPath))
                .on("finish", () => {
                    console.log(`✅ Ảnh PNG đã được tạo thành công: ${outputPngPath}`);
                    resolve();
                })
                .on("error", (err) => {
                    console.error("❌ Lỗi khi ghi file PNG:", err);
                    reject(err);
                });
        });

    } catch (error) {
        console.error("Lỗi khi chuyển đổi DICOM sang PNG:", error);
    }
}