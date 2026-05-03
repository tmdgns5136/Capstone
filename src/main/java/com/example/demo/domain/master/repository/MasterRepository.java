package com.example.demo.domain.master.repository;

import com.example.demo.domain.master.entity.Master;
import org.springframework.data.jpa.repository.JpaRepository;

public interface MasterRepository extends JpaRepository<Master, Long> {
    public Master findByMasterNum(String masterNum);
}
