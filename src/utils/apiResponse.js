// Standardized API response structure for consistent output formatting
class ApiResponse {
    constructor(statusCode, data, message = "Success") {
        this.statusCode = statusCode;
        this.data = data;
        this.message = message;
        this.success = statusCode < 400; // Success if status code < 400
    }
}

export { ApiResponse };
