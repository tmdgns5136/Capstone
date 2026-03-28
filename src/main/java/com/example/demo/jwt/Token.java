package com.example.demo.jwt;

import io.jsonwebtoken.Jwts;
import lombok.Getter;
import lombok.RequiredArgsConstructor;

import javax.crypto.SecretKey;
import java.util.Date;

@RequiredArgsConstructor
public class Token {
    @Getter
    private final String token;
    private final SecretKey key;

    private static final String AUTHORITIES_KEY = "role";

    // RefreshToken
    Token(String id, Date expiry, SecretKey key){
        this.key = key;
        this.token = createToken(id, expiry);
    }

    // AccessToken
    Token(String id, String role, Date expiry, SecretKey key){
        this.key = key;
        this.token = createToken(id, role, expiry);
    }

    private String createToken(String id, Date expiry){
        return Jwts.builder()
                .claim("userNum", id)
                .signWith(key)
                .expiration(expiry)
                .compact();
    }

    private String createToken(String id, String role, Date expiry){
        return Jwts.builder()
                .claim("userNum", id)
                .claim(AUTHORITIES_KEY, role)
                .signWith(key)
                .expiration(expiry)
                .compact();
    }
}
