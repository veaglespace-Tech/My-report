package com.myreport.backend.dto.common;

public record ApiResponse<T>(boolean success, String message, T data) {
}
