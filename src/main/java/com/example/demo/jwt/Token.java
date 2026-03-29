package com.example.demo.jwt;

import io.jsonwebtoken.*;
import lombok.Getter;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

import javax.crypto.SecretKey;
import java.util.Date;

@Slf4j
@RequiredArgsConstructor
public class Token {
    @Getter
    private final String token;
    private final SecretKey key;

    private static final String AUTHORITIES_KEY = "role";

    // RefreshToken
    public Token(String id, Date expiry, SecretKey key){
        this.key = key;
        this.token = createToken(id, expiry);
    }

    // AccessToken
    public Token(String id, String role, Date expiry, SecretKey key){
        this.key = key;
        this.token = createToken(id, role, expiry);
    }

    public Token(String token, SecretKey key) {
        this.token = token;
        this.key = key;
    }

    private String createToken(String id, Date expiry){
        return Jwts.builder()
                .subject(id)
                .claim("userNum", id)
                .signWith(key)
                .expiration(expiry)
                .compact();
    }

    private String createToken(String id, String role, Date expiry){
        return Jwts.builder()
                .subject(id)
                .claim("userNum", id)
                .claim(AUTHORITIES_KEY, role)
                .signWith(key)
                .expiration(expiry)
                .compact();
    }

    public boolean validate(){
        return this.getTokenClaims() != null;
    }

    public Claims getTokenClaims(){
        try{
            return Jwts.parser()
                    .verifyWith(key)
                    .build()
                    .parseSignedClaims(token)
                    .getPayload();
        }catch (SecurityException e){
            log.info("Invalid JWT signature.");
        }catch (MalformedJwtException e){
            log.info("Invalid JWT token.");
        } catch (ExpiredJwtException e) {
            log.info("Expired JWT token.");
        } catch (UnsupportedJwtException e) {
            log.info("Unsupported JWT token.");
        } catch (IllegalArgumentException e) {
            log.info("JWT token compact of handler are invalid.");
        }
        return null;


    }

    // 만료되고도 읽어볼때
    public Claims getExpiredTokenClaims(){
        try{
            Jwts.parser()
                    .verifyWith(key)
                    .build()
                    .parseSignedClaims(token)
                    .getPayload();
        }catch (ExpiredJwtException e){
            return e.getClaims();
        }
        return null;
    }
}
