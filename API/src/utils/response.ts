import { Response } from 'express';

export interface ApiResponse<T = any> {
    success: boolean;
    data?: T;
    error?: string;
}

export function successResponse<T>(res: Response, data: T, status: number = 200) {
    return res.status(status).json({
        success: true,
        data,
    } as ApiResponse<T>);
}

export function errorResponse(res: Response, error: string, status: number = 400) {
    return res.status(status).json({
        success: false,
        error,
    } as ApiResponse);
}

export const ErrorResponses = {
    unauthorized: (res: Response) => errorResponse(res, 'Unauthorized - Token không hợp lệ hoặc đã hết hạn', 401),
    forbidden: (res: Response) => errorResponse(res, 'Forbidden - Bạn không có quyền truy cập', 403),
    notFound: (res: Response, resource: string = 'Resource') => errorResponse(res, `${resource} không tìm thấy`, 404),
    badRequest: (res: Response, message: string) => errorResponse(res, message, 400),
    internalError: (res: Response) => errorResponse(res, 'Lỗi server nội bộ', 500),
    validationError: (res: Response, message: string) => errorResponse(res, `Validation error: ${message}`, 400),
};
