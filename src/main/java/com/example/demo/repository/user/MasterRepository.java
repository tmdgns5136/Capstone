package com.example.demo.repository.user;

import com.example.demo.entity.user.Master;
import org.springframework.data.jpa.repository.JpaRepository;

public interface MasterRepository extends JpaRepository<Master, Long> {
    public Master findByMasterNum(String masterNum);
}
