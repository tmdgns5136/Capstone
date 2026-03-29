package com.example.demo.jwt;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.User;
import org.springframework.stereotype.Component;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.util.Arrays;
import java.util.Collection;
import java.util.Date;

@Component
public class TokenProvider {
    private final SecretKey key;

    public TokenProvider(@Value("${jwt.secret}")String secret){
        this.key = Keys.hmacShaKeyFor(secret.getBytes(StandardCharsets.UTF_8));
    }

    // AccessToken
    public Token createToken(String id, String role, Date expiry){
        return new Token(id, role, expiry, key);
    }

    // RefreshToken
    public Token createToken(String id, Date expiry){
        return new Token(id, expiry, key);
    }

    public Token convertToken(String token){
        return new Token(token, key);
    }

    public Authentication getAuthentication(Token token){
        if(token.validate()){
            Claims claims = token.getTokenClaims();

            // 권한 정보 추출
            Collection<? extends GrantedAuthority> authorities =
                    Arrays.stream(new String[]{claims.get("role").toString()})
                            .map(SimpleGrantedAuthority::new).toList();

            User principal = new User(claims.getSubject(), "", authorities);

            return new UsernamePasswordAuthenticationToken(principal, token, authorities);
        }
        else{
            throw new RuntimeException("Token validation failed");
        }
    }
}
