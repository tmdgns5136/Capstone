package com.example.demo.service;

import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import lombok.RequiredArgsConstructor;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class EmailService {
    private final JavaMailSender javaMailSender;

    // 인증 코드를 포함한 이메일 발송
    public void sendEmail(String toEmail, String code){
        MimeMessage mimeMessage = javaMailSender.createMimeMessage();
        try{
            MimeMessageHelper mimeMessageHelper = new MimeMessageHelper(mimeMessage, false, "UTF-8");
            mimeMessageHelper.setTo(toEmail);

            mimeMessageHelper.setSubject("[Assas] 회원가입 이메일 인증 코드입니다.");

            String emailBody = createHtmlEmailBody(code);
            mimeMessageHelper.setText(emailBody, true);
        } catch (MessagingException e) {
            throw new RuntimeException(e);
        }
    }

    private String createHtmlEmailBody(String code){
        StringBuilder emailBody = new StringBuilder();
        emailBody.append("<div style='font-family: Arial, sans-serif; text-align: center; color: #333;'>");
        emailBody.append("<h1 style='color: #4A90E2;'>Assas 이메일 인증</h1>");
        emailBody.append("<p>아래 인증 코드를 입력하여 가입을 완료해주세요.</p>");
        emailBody.append("<div style='background-color: #f2f2f2; padding: 20px; border-radius: 10px; display: inline-block; margin: 20px 0;'>");
        emailBody.append("<h2 style='color: #E74C3C; font-size: 24px; letter-spacing: 4px; margin: 0;'>");
        emailBody.append(code);
        emailBody.append("</h2>");
        emailBody.append("</div>");
        emailBody.append("<p style='font-size: 12px; color: #888;'>이 코드는 3분 동안 유효합니다.</p>");
        emailBody.append("</div>");
        return emailBody.toString();
    }
}
