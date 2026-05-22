package com.example.demo.domain.device.exception;

import jakarta.servlet.http.HttpServletRequest;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.core.Ordered;
import org.springframework.core.annotation.Order;

import java.time.OffsetDateTime;
import java.util.LinkedHashMap;
import java.util.Map;

@Order(Ordered.HIGHEST_PRECEDENCE)
@RestControllerAdvice(basePackages = {"com.example.demo.domain.device", "com.example.demo.domain.stream"})
public class DeviceExceptionHandler {

    @ExceptionHandler(DeviceApiException.class)
    public ResponseEntity<Map<String, Object>> handleDeviceApiException(DeviceApiException e, HttpServletRequest request) {
        return ResponseEntity.status(e.getStatus()).body(errorBody(e.getStatus(), e.getErrorCode(), e.getMessage(), request));
    }

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<Map<String, Object>> handleValidation(MethodArgumentNotValidException e, HttpServletRequest request) {
        String message = e.getBindingResult().getAllErrors().getFirst().getDefaultMessage();
        return ResponseEntity.badRequest().body(errorBody(400, "MISSING_REQUIRED_FIELD", message, request));
    }

    @ExceptionHandler(BadCredentialsException.class)
    public ResponseEntity<Map<String, Object>> handleBadCredentials(BadCredentialsException e, HttpServletRequest request) {
        return ResponseEntity.status(401).body(errorBody(401, "INVALID_TOKEN", "유효하지 않은 인증 정보입니다.", request));
    }

    @ExceptionHandler(AccessDeniedException.class)
    public ResponseEntity<Map<String, Object>> handleAccessDenied(AccessDeniedException e, HttpServletRequest request) {
        return ResponseEntity.status(403).body(errorBody(403, "FORBIDDEN", "접근 권한이 없습니다.", request));
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<Map<String, Object>> handleException(Exception e, HttpServletRequest request) {
        e.printStackTrace();
        return ResponseEntity.status(500)
                .body(errorBody(500, "INTERNAL_SERVER_ERROR", "서버 내부 오류가 발생했습니다.", request));
    }

    private Map<String, Object> errorBody(int status, String errorCode, String message, HttpServletRequest request) {
        Map<String, Object> body = new LinkedHashMap<>();
        body.put("status", status);
        body.put("success", false);
        body.put("errorCode", errorCode);
        body.put("message", message);
        body.put("timestamp", OffsetDateTime.now().toString());
        body.put("path", request.getRequestURI());
        return body;
    }
}
