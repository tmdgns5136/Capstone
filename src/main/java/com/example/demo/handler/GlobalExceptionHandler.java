package com.example.demo.handler;

import com.example.demo.dto.user.CommonResponse;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

@RestControllerAdvice
public class GlobalExceptionHandler {
    // Valid 검증 실패 시 호출
    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<CommonResponse> handleValidation(MethodArgumentNotValidException ex){
        String message = ex.getBindingResult().getAllErrors().getFirst().getDefaultMessage();

        CommonResponse response = CommonResponse.builder()
                .status(400)
                .success(false)
                .message(message)
                .build();

        return ResponseEntity.status(400).body(response);
    }
}
