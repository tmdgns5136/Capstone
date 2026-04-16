package com.example.demo.domain.board.repository;

import com.example.demo.domain.entity.board.NoticeBoard;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

public interface NoticeBoardRepository extends JpaRepository<NoticeBoard, Long> {
    Page<NoticeBoard> findByLecture_LectureId(Long lectureId, Pageable pageable);
}