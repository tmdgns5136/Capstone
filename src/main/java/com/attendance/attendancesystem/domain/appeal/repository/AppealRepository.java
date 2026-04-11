package com.attendance.attendancesystem.domain.appeal.repository;

import com.attendance.attendancesystem.domain.appeal.entity.Appeal;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

public interface AppealRepository extends JpaRepository<Appeal, Long> {

    Page<Appeal> findAll(Pageable pageable);
}