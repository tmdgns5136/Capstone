package com.example.demo.domain.home.repository;

import com.example.demo.domain.home.entity.user.Master;
import org.springframework.data.jpa.repository.JpaRepository;

public interface MasterRepository extends JpaRepository<Master, Long> {
    public Master findByMasterNum(String masterNum);
}
