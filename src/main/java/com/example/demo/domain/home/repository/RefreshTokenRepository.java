package com.example.demo.domain.home.repository;

import com.example.demo.domain.home.entity.etc.RefreshToken;
import org.springframework.data.repository.CrudRepository;

import java.util.Optional;

public interface RefreshTokenRepository extends CrudRepository<RefreshToken, Long> {
    public Optional<RefreshToken> findByUserNum(String userNum);
    public void deleteByUserNum(String userNum);
}
