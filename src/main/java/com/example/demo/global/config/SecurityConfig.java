package com.example.demo.global.config;

import com.example.demo.global.jwt.JwtTokenFilter;
import com.example.demo.global.jwt.TokenProvider;
import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
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
                        auth.requestMatchers("/api/home/**").permitAll()
                                .requestMatchers("/api/mypage/image/**").permitAll()
                                .requestMatchers("/api/admin/image/**").permitAll()
                                .requestMatchers("/api/mylecture/image/**").permitAll()
                                .anyRequest().authenticated()
                )
                .addFilterBefore(
                        new JwtTokenFilter(tokenProvider),
                        UsernamePasswordAuthenticationFilter.class
                )
                .build();
    }
}