package com.example.demo.home.user;

import com.example.demo.home.entity.etc.RefreshToken;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface RefreshTokenRepository extends JpaRepository<RefreshToken, Long> {
    public Optional<RefreshToken> findByUserNum(String userNum);
    public void deleteByUserNum(String userNum);
}
