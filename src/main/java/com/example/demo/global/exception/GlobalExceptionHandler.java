package com.example.demo.global.exception;

import com.example.demo.global.response.ActionResponse;
import com.example.demo.global.response.ApiResponse;
import jakarta.persistence.Access;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

@RestControllerAdvice
public class GlobalExceptionHandler {
    // Valid 검증 실패 시 호출
    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ActionResponse> handleValidation(MethodArgumentNotValidException ex){
        String message = ex.getBindingResult().getAllErrors().getFirst().getDefaultMessage();

        ActionResponse actionResponse = ActionResponse.success(
                400, message);
        return ResponseEntity.status(actionResponse.getStatus()).body(actionResponse);
    }

    @ExceptionHandler(CustomException.class)
    public ResponseEntity<ApiResponse<Void>> handleCustomException(CustomException e) {
        return ResponseEntity
                .status(e.getStatus())
                .body(ApiResponse.fail(e.getStatus(), e.getMessage()));
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<ApiResponse<Void>> handleException(Exception e) {
        return ResponseEntity
                .status(500)
                .body(ApiResponse.fail(500, "서버 내부 오류가 발생했습니다."));
    }
}
