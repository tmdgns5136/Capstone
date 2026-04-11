package com.attendance.attendancesystem.global.jwt;

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
                .subject(id) // 토큰 제목(등록된 클레임)
                .claim("userNum", id) // 비공개 클레임
                .claim(AUTHORITIES_KEY, role) // 비공개 클레임
                .signWith(key)
                .expiration(expiry) // 만료 시간(등록된 클레임)
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
