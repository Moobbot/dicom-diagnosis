import { api } from './api';
import { PatientData } from '@/types/lcrd';

interface FileError {
    type: string;
    message: string;
    path?: string;
}

class PatientService {
    private baseUrl: string;

    constructor() {
        this.baseUrl = '/patients';
    }

    private logError(method: string, error: any, additionalInfo?: any) {
        const errorDetails = {
            timestamp: new Date().toISOString(),
            method,
            message: error.message || error,
            response: error.response?.data,
            status: error.response?.status,
            additionalInfo,
            stack: error.stack,
            isNetworkError: error.message === 'Network Error',
            code: error.code,
            isAxiosError: error.isAxiosError
        };

        console.error(JSON.stringify(errorDetails, null, 2));
    }

    private handleFileErrors(errors: FileError[]): string[] {
        const errorMessages: string[] = [];

        errors.forEach(error => {
            switch (error.type) {
                case 'UPLOAD_FOLDER_MISSING':
                    errorMessages.push('Folder with original images is missing');
                    break;
                case 'RESULTS_FOLDER_MISSING':
                    errorMessages.push('Folder with result images is missing');
                    break;
                case 'UPLOAD_FILE_NOT_READABLE':
                    errorMessages.push(`Cannot read original file: ${error.path?.split('/').pop()}`);
                    break;
                case 'RESULT_FILE_NOT_READABLE':
                    errorMessages.push(`Cannot read result file: ${error.path?.split('/').pop()}`);
                    break;
                case 'NO_UPLOAD_FILES':
                    errorMessages.push('No images found in the upload folder');
                    break;
                case 'INVALID_FILE_FORMAT':
                    errorMessages.push(`Invalid file format: ${error.message}`);
                    break;
                case 'FILE_SYSTEM_ERROR':
                    errorMessages.push(`System error: ${error.message}`);
                    break;
                default:
                    errorMessages.push(error.message);
            }
        });

        return errorMessages;
    }

    async createPatient(data: {
        patient_id: string;
        name: string;
        age: string;
        sex: string;
        address?: string | null;
        diagnosis?: string | null;
        general_conclusion?: string | null;
        attentent?: string | null;
        session_id: string
    }): Promise<any> {
        try {
            const response = await api.post(this.baseUrl, data);
            return response.data;
        } catch (error: any) {
            this.logError('createPatient', error, { data });
            
            // Handle specific error cases
            if (error.response?.status === 400) {
                if (error.response.data?.message?.includes('Patient already exists')) {
                    throw new Error('A patient with this ID already exists in the system');
                }
            }

            // Handle network errors
            if (error.message === 'Network Error') {
                throw new Error('Unable to connect to the server. Please check your internet connection.');
            }

            // Handle timeout errors
            if (error.code === 'ECONNABORTED') {
                throw new Error('The request timed out. Please try again.');
            }

            // Handle other errors
            throw new Error(
                error.response?.data?.message ||
                error.message ||
                'Cannot create patient profile. Please try again later.'
            );
        }
    }

    updatePatient = async (id: string, data: PatientData) => {
        try {
            const response = await api.put(`${this.baseUrl}/${id}`, data);
            return response.data;
        } catch (error: any) {
            this.logError('updatePatient', error, { id, data });

            // Handle network errors
            if (error.message === 'Network Error') {
                throw new Error('Unable to connect to the server. Please check your internet connection.');
            }

            // Handle timeout errors
            if (error.code === 'ECONNABORTED') {
                throw new Error('The request timed out. Please try again.');
            }

            throw new Error(
                error.response?.data?.message ||
                error.message ||
                'Cannot update patient. Please try again later.'
            );
        }
    };

    async getPatients(page: number, limit: number, search?: string): Promise<{ data: any[]; total: number; limit: number; pages: number }> {
        try {
            const validPage = Math.max(1, page);
            const validLimit = Math.max(1, limit);

            const response = await api.get(this.baseUrl, {
                params: {
                    page: validPage,
                    limit: validLimit,
                    ...(search && search.trim() !== '' ? { search: search.trim() } : {})
                },
                timeout: 10000
            });

            if (!response.data) {
                throw new Error('No data received from server');
            }

            if (!Array.isArray(response.data.data)) {
                throw new Error('Data is not in the correct format');
            }

            const { data, total, limit: responseLimit, pages } = response.data;

            // Xử lý và kiểm tra dữ liệu
            const processedData = data.map((record: any) => {
                if (!record || !record.session_id) {
                    console.warn('Skipping invalid record:', record);
                    return null;
                }

                // Xử lý các lỗi về file nếu có
                if (record.errors && Array.isArray(record.errors)) {
                    const errorMessages = this.handleFileErrors(record.errors);
                    if (errorMessages.length > 0) {
                        record.fileErrors = errorMessages;
                        console.warn('File errors for patient:', {
                            patientId: record._id,
                            errors: errorMessages
                        });
                    }
                }

                return record;
            }).filter(Boolean);

            if (processedData.length === 0) {
                console.warn('No valid data after filtering', {
                    originalCount: data.length,
                    page,
                    limit,
                    search
                });
                return {
                    data: [],
                    total: 0,
                    limit: validLimit,
                    pages: 0
                };
            }

            return {
                data: processedData,
                total: total || 0,
                limit: responseLimit || validLimit,
                pages: pages || 1
            };
        } catch (error: any) {
            this.logError('getPatients', error, { page, limit, search });
            
            if (error.message === 'Network Error') {
                throw new Error(
                    'Unable to connect to the server. Please check your internet connection and try again.'
                );
            }
            
            if (error.code === 'ECONNABORTED') {
                throw new Error(
                    'The request timed out. Please try again.'
                );
            }

            throw new Error(
                error.response?.data?.message ||
                error.message ||
                'Cannot load patient data. Please try again later.'
            );
        }
    }

    async deletePatient(id: string): Promise<void> {
        try {
            await api.delete(`${this.baseUrl}/${id}`);
        } catch (error: any) {
            console.error('deletePatient', error, { id });
            throw new Error(
                error.response?.data?.message ||
                error.message ||
                'Cannot delete patient. Please try again later.'
            );
        }
    }
}

export default new PatientService();
