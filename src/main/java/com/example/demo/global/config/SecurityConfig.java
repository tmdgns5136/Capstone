package com.example.demo.global.config;

import com.example.demo.global.jwt.JwtTokenFilter;
import com.example.demo.global.jwt.TokenProvider;
import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

@Configuration
@RequiredArgsConstructor
@EnableWebSecurity
public class SecurityConfig {

    private final TokenProvider tokenProvider;

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity httpSecurity) throws Exception {
        return httpSecurity.httpBasic(AbstractHttpConfigurer::disable)
                .formLogin(AbstractHttpConfigurer::disable)
                .csrf(AbstractHttpConfigurer::disable)
                .sessionManagement(session ->
                        session.sessionCreationPolicy(SessionCreationPolicy.STATELESS)
                )
                .authorizeHttpRequests(auth ->
                        auth.requestMatchers("/error").permitAll()
                                .requestMatchers(HttpMethod.POST,
                                        "/api/home/signup/student",
                                        "/api/home/signup/professor",
                                        "/api/home/login",
                                        "/api/home/refresh",
                                        "/api/home/email-send",
                                        "/api/home/email-check",
                                        "/api/home/password-email-send"
                                ).permitAll()
                                .requestMatchers(HttpMethod.PATCH, "/api/home/password-change").permitAll()
                                .requestMatchers(HttpMethod.POST, "/api/device/register", "/api/device/login").permitAll()

                                // Images are rendered directly by the browser and currently cannot attach a bearer token.
                                .requestMatchers("/api/mypage/image/**").permitAll()
                                .requestMatchers("/api/admin/image/**").permitAll()
                                .requestMatchers("/api/mylecture/image/**").permitAll()

                                .requestMatchers("/api/admin/**").hasRole("MASTER")
                                .requestMatchers("/api/professors/**").hasRole("PROFESSOR")
                                .requestMatchers("/api/mylecture/**").hasRole("STUDENT")
                                .requestMatchers("/api/device/test/**").hasRole("MASTER")
                                .requestMatchers("/api/device/**").hasRole("DEVICE")

                                .requestMatchers("/api/home/today-courses", "/api/home/current-lecture")
                                .hasRole("STUDENT")
                                .requestMatchers("/api/home/logout", "/api/home/password-check")
                                .hasAnyRole("STUDENT", "PROFESSOR", "MASTER")
                                .requestMatchers("/api/mypage/**").hasAnyRole("STUDENT", "PROFESSOR")
                                .requestMatchers("/api/notifications/**")
                                .hasAnyRole("STUDENT", "PROFESSOR", "MASTER")
                                .requestMatchers("/swagger-ui/**", "/v3/api-docs/**").hasRole("MASTER")
                                .anyRequest().denyAll()
                )
                .addFilterBefore(
                        new JwtTokenFilter(tokenProvider),
                        UsernamePasswordAuthenticationFilter.class
                )
                .build();
    }
}
