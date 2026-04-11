package com.example.demo.domain.home.service;

import com.attendance.attendancesystem.global.exception.CustomException;
import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import lombok.RequiredArgsConstructor;
import org.springframework.mail.MailException;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class EmailService {
    private final JavaMailSender javaMailSender;

    // 인증 코드를 포함한 이메일 발송
    public void sendEmail(String toEmail, String code, String type){
        MimeMessage mimeMessage = javaMailSender.createMimeMessage();
        try{
            MimeMessageHelper mimeMessageHelper = new MimeMessageHelper(mimeMessage, false, "UTF-8");
            mimeMessageHelper.setTo(toEmail);
            if(type.equals("join")){
                mimeMessageHelper.setSubject("[Assas] 회원가입 이메일 인증 코드입니다.");

                String emailBody = createHtmlEmailBody(code);
                mimeMessageHelper.setText(emailBody, true);
            }
            else if(type.equals("password")){
                mimeMessageHelper.setSubject("[Assas] 비밀번호 재설정 인증 코드입니다.");

                String emailBody = createPasswordResetEmailBody(code);
                mimeMessageHelper.setText(emailBody, true);
            }
            javaMailSender.send(mimeMessage);

        } catch (MailException e) {
            // 타임아웃이나 전송 실패 시 발생하는 예외
            // 504(Gateway Timeout) 또는 500을 사용합니다.
            throw new CustomException(504, "이메일 발송 시간이 초과되었습니다. 잠시 후 다시 시도해주세요.");
        } catch (MessagingException e) {
            // 메일 설정 오류 등
            throw new CustomException(500, "이메일 양식 생성 중 오류가 발생했습니다.");
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

    private String createPasswordResetEmailBody(String code){
        StringBuilder emailBody = new StringBuilder();
        emailBody.append("<div style='font-family: Arial, sans-serif; text-align: center; color: #333;'>");
        emailBody.append("<h1 style='color: #E67E22;'>Assas 비밀번호 재설정</h1>");
        emailBody.append("<p>비밀번호 재설정을 위한 인증 코드입니다.</p>");
        emailBody.append("<p>본인이 요청하지 않은 경우, 이 이메일을 무시해주세요.</p>");
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
