package com.example.demo.home.entity.etc;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@Entity
@AllArgsConstructor
@NoArgsConstructor
@Table(name = "USER_REFRESH_TOKEN")
public class RefreshToken {
    @JsonIgnore
    @Id
    @Column(name = "REFRESH_TOKEN_ID")
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long refreshTokenId;

    @Column(name = "USER_NUM", length = 20, unique = true, nullable = false)
    private String userNum;

    @Column(name = "REFRESH_TOKEN", length = 256, nullable = false)
    private String refreshToken;

    public RefreshToken(String userNum, String token) {
        this.userNum = userNum;
        this.refreshToken = token;
    }

    public void updateToken(String newToken) {
        this.refreshToken = newToken;
    }
}
