package com.example.demo.home.user;

import com.example.demo.home.entity.user.Master;
import org.springframework.data.jpa.repository.JpaRepository;

public interface MasterRepository extends JpaRepository<Master, Long> {
    public Master findByMasterNum(String masterNum);
}
