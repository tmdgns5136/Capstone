package com.example.demo.domain.appeal.repository;

import com.example.demo.domain.appeal.entity.Appeal;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

public interface AppealRepository extends JpaRepository<Appeal, Long> {

    Page<Appeal> findAll(Pageable pageable);
}