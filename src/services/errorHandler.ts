export interface ServiceError {
  code: string;
  message: string;
  statusCode?: number;
}

// Error codes by domain
export const ErrorCodes = {
  // Auth
  AUTH_INVALID_CREDENTIALS: 'AUTH_INVALID_CREDENTIALS',
  AUTH_EMAIL_NOT_FOUND: 'AUTH_EMAIL_NOT_FOUND',
  AUTH_CODE_INVALID: 'AUTH_CODE_INVALID',
  AUTH_WRONG_PASSWORD: 'AUTH_WRONG_PASSWORD',
  // User
  USER_DUPLICATE_EMAIL: 'USER_DUPLICATE_EMAIL',
  USER_DUPLICATE_DOCUMENT: 'USER_DUPLICATE_DOCUMENT',
  // Book
  BOOK_SERVICE_UNAVAILABLE: 'BOOK_SERVICE_UNAVAILABLE',
  BOOK_DUPLICATE_ISBN: 'BOOK_DUPLICATE_ISBN',
  BOOK_NOT_FOUND: 'BOOK_NOT_FOUND',
  // Generic
  NOT_FOUND: 'NOT_FOUND',
  UNAUTHORIZED: 'UNAUTHORIZED',
  FORBIDDEN: 'FORBIDDEN',
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  NETWORK_ERROR: 'NETWORK_ERROR',
  SERVER_ERROR: 'SERVER_ERROR',
} as const;

const errorMessages: Record<string, string> = {
  [ErrorCodes.AUTH_INVALID_CREDENTIALS]: 'Usuario o contraseña incorrectos',
  [ErrorCodes.AUTH_EMAIL_NOT_FOUND]: 'Correo no registrado',
  [ErrorCodes.AUTH_CODE_INVALID]: 'Código de verificación incorrecto o expirado',
  [ErrorCodes.AUTH_WRONG_PASSWORD]: 'Contraseña actual incorrecta',
  [ErrorCodes.USER_DUPLICATE_EMAIL]: 'El correo ya está registrado',
  [ErrorCodes.USER_DUPLICATE_DOCUMENT]: 'El documento ya está registrado',
  [ErrorCodes.BOOK_SERVICE_UNAVAILABLE]: 'El servicio de libros no está disponible',
  [ErrorCodes.BOOK_DUPLICATE_ISBN]: 'El ISBN ya está registrado',
  [ErrorCodes.BOOK_NOT_FOUND]: 'Libro no encontrado',
  [ErrorCodes.NOT_FOUND]: 'Recurso no encontrado',
  [ErrorCodes.UNAUTHORIZED]: 'No autorizado',
  [ErrorCodes.FORBIDDEN]: 'No tienes permisos para realizar esta acción',
  [ErrorCodes.VALIDATION_ERROR]: 'Datos inválidos',
  [ErrorCodes.NETWORK_ERROR]: 'Sin conexión a internet',
  [ErrorCodes.SERVER_ERROR]: 'Error interno del servidor',
};

export function parseError(err: unknown): ServiceError {
  // Already a ServiceError
  if (isServiceError(err)) {
    return err;
  }

  if (err instanceof TypeError && err.message.includes('fetch')) {
    return {
      code: ErrorCodes.NETWORK_ERROR,
      message: errorMessages[ErrorCodes.NETWORK_ERROR],
    };
  }

  if (err instanceof ApiError) {
    const code = mapStatusToCode(err.statusCode, err.errorCode);
    // Use the server message when available, fall back to hardcoded translation
    const message = errorMessages[code] ?? err.message;
    return {
      code,
      message,
      statusCode: err.statusCode,
    };
  }

  return {
    code: ErrorCodes.SERVER_ERROR,
    message: errorMessages[ErrorCodes.SERVER_ERROR],
  };
}

function isServiceError(err: unknown): err is ServiceError {
  return (
    typeof err === 'object' &&
    err !== null &&
    'code' in err &&
    'message' in err &&
    typeof (err as ServiceError).code === 'string' &&
    typeof (err as ServiceError).message === 'string'
  );
}

function mapStatusToCode(statusCode: number, errorCode?: string): string {
  // If the server sent a specific code, use it directly
  if (errorCode) {
    return errorCode;
  }
  if (statusCode === 0 || statusCode === undefined) {
    return ErrorCodes.NETWORK_ERROR;
  }
  if (statusCode === 401) return ErrorCodes.UNAUTHORIZED;
  if (statusCode === 403) return ErrorCodes.FORBIDDEN;
  if (statusCode === 404) return ErrorCodes.NOT_FOUND;
  if (statusCode === 422) return ErrorCodes.VALIDATION_ERROR;
  if (statusCode >= 500) {
    return ErrorCodes.SERVER_ERROR;
  }
  return ErrorCodes.SERVER_ERROR;
}

export class ApiError extends Error {
  constructor(
    public readonly statusCode: number,
    message: string,
    public readonly errorCode?: string,
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

export async function handleResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    let errorCode: string | undefined;
    let message = response.statusText;
    try {
      const body = await response.json();
      errorCode = body?.code;
      message = body?.message ?? message;
    } catch {
      // ignore parse errors
    }
    throw new ApiError(response.status, message, errorCode);
  }
  // 204 No Content — no body to parse
  if (response.status === 204) {
    return undefined as unknown as T;
  }
  return response.json() as Promise<T>;
}
