package com.example.demo.global.config;

import com.example.demo.global.jwt.TokenProvider;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.http.HttpHeaders;
import org.springframework.test.web.servlet.MockMvc;

import java.util.Date;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
class SecurityAuthorizationTests {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private TokenProvider tokenProvider;

    @Test
    void studentCannotAccessAdminApi() throws Exception {
        mockMvc.perform(get("/api/admin/students")
                        .header(HttpHeaders.AUTHORIZATION, bearerToken("ROLE_STUDENT")))
                .andExpect(status().isForbidden());
    }

    @Test
    void masterCannotAccessProfessorApi() throws Exception {
        mockMvc.perform(get("/api/professors/lectures")
                        .header(HttpHeaders.AUTHORIZATION, bearerToken("ROLE_MASTER")))
                .andExpect(status().isForbidden());
    }

    @Test
    void professorCannotAccessStudentApi() throws Exception {
        mockMvc.perform(get("/api/mylecture")
                        .header(HttpHeaders.AUTHORIZATION, bearerToken("ROLE_PROFESSOR")))
                .andExpect(status().isForbidden());
    }

    @Test
    void studentCannotAccessDeviceApi() throws Exception {
        mockMvc.perform(get("/api/device/config")
                        .header(HttpHeaders.AUTHORIZATION, bearerToken("ROLE_STUDENT")))
                .andExpect(status().isForbidden());
    }

    @Test
    void deviceCannotAccessHumanNotificationApi() throws Exception {
        mockMvc.perform(get("/api/notifications")
                        .header(HttpHeaders.AUTHORIZATION, bearerToken("ROLE_DEVICE")))
                .andExpect(status().isForbidden());
    }

    @Test
    void unauthenticatedRequestCannotAccessProtectedApi() throws Exception {
        mockMvc.perform(get("/api/professors/lectures"))
                .andExpect(status().isForbidden());
    }

    private String bearerToken(String role) {
        Date expiry = new Date(System.currentTimeMillis() + 60_000);
        return "Bearer " + tokenProvider.createToken("security-test-user", role, expiry).getToken();
    }
}
