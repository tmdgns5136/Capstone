-- ============================================================
-- 캡스톤 출석 관리 시스템 - 테스트 데이터
-- 모든 계정 비밀번호: test1234
-- DB: demo (MySQL)
-- 모든 강의는 연강 (하루에 몰아서 수업)
-- ============================================================

USE demo;

-- 기존 데이터 정리 (순서 중요 - FK 의존성)
SET FOREIGN_KEY_CHECKS = 0;
TRUNCATE TABLE notification;
TRUNCATE TABLE answer;
TRUNCATE TABLE question_board;
TRUNCATE TABLE notice_board;
TRUNCATE TABLE attendance_objection;
TRUNCATE TABLE attendance_official;
TRUNCATE TABLE attendance;
TRUNCATE TABLE lecture_session;
TRUNCATE TABLE lecture_schedules;
TRUNCATE TABLE enrollment;
TRUNCATE TABLE image;
TRUNCATE TABLE user_refresh_token;
TRUNCATE TABLE attendance_records;
TRUNCATE TABLE lecture;
TRUNCATE TABLE student;
TRUNCATE TABLE professor;
TRUNCATE TABLE master;
SET FOREIGN_KEY_CHECKS = 1;

-- ============================================================
-- 1. 관리자 (MASTER)
-- ============================================================
INSERT INTO master (master_num, master_password, role_type) VALUES
('admin', '$2a$10$Krpq2ztgIG146Mv5bnDjG.s6HQk/yNCbRXEMi6DzhXEDdvSpdCjGm', 'MASTER');

-- ============================================================
-- 2. 교수 (PROFESSOR)
-- ============================================================
INSERT INTO professor (professor_num, professor_name, professor_email, major, professor_phonenum, professor_password, role_type, professor_status) VALUES
('100001', '김영수', 'kimys@university.ac.kr', '컴퓨터공학과', '010-1111-1001', '$2a$10$Krpq2ztgIG146Mv5bnDjG.s6HQk/yNCbRXEMi6DzhXEDdvSpdCjGm', 'PROFESSOR', 'EMPLOYED'),
('100002', '이정희', 'leejh@university.ac.kr', '소프트웨어학과', '010-1111-1002', '$2a$10$Krpq2ztgIG146Mv5bnDjG.s6HQk/yNCbRXEMi6DzhXEDdvSpdCjGm', 'PROFESSOR', 'EMPLOYED'),
('100003', '박민수', 'parkms@university.ac.kr', '정보통신공학과', '010-1111-1003', '$2a$10$Krpq2ztgIG146Mv5bnDjG.s6HQk/yNCbRXEMi6DzhXEDdvSpdCjGm', 'PROFESSOR', 'EMPLOYED');

-- ============================================================
-- 3. 학생 (STUDENT) - 10명
-- ============================================================
INSERT INTO student (student_num, student_name, student_email, student_phonenum, student_password, role_type, student_status) VALUES
('202100001', '홍길동', 'hong@univ.ac.kr', '010-2222-0001', '$2a$10$Krpq2ztgIG146Mv5bnDjG.s6HQk/yNCbRXEMi6DzhXEDdvSpdCjGm', 'STUDENT', 'ENROLLED'),
('202100002', '김철수', 'kimcs@univ.ac.kr', '010-2222-0002', '$2a$10$Krpq2ztgIG146Mv5bnDjG.s6HQk/yNCbRXEMi6DzhXEDdvSpdCjGm', 'STUDENT', 'ENROLLED'),
('202100003', '이영희', 'leeyh@univ.ac.kr', '010-2222-0003', '$2a$10$Krpq2ztgIG146Mv5bnDjG.s6HQk/yNCbRXEMi6DzhXEDdvSpdCjGm', 'STUDENT', 'ENROLLED'),
('202100004', '박지민', 'parkjm@univ.ac.kr', '010-2222-0004', '$2a$10$Krpq2ztgIG146Mv5bnDjG.s6HQk/yNCbRXEMi6DzhXEDdvSpdCjGm', 'STUDENT', 'ENROLLED'),
('202100005', '최수진', 'choisj@univ.ac.kr', '010-2222-0005', '$2a$10$Krpq2ztgIG146Mv5bnDjG.s6HQk/yNCbRXEMi6DzhXEDdvSpdCjGm', 'STUDENT', 'ENROLLED'),
('202100006', '정하늘', 'junghn@univ.ac.kr', '010-2222-0006', '$2a$10$Krpq2ztgIG146Mv5bnDjG.s6HQk/yNCbRXEMi6DzhXEDdvSpdCjGm', 'STUDENT', 'ENROLLED'),
('202100007', '강민호', 'kangmh@univ.ac.kr', '010-2222-0007', '$2a$10$Krpq2ztgIG146Mv5bnDjG.s6HQk/yNCbRXEMi6DzhXEDdvSpdCjGm', 'STUDENT', 'ENROLLED'),
('202100008', '윤서연', 'yoonsy@univ.ac.kr', '010-2222-0008', '$2a$10$Krpq2ztgIG146Mv5bnDjG.s6HQk/yNCbRXEMi6DzhXEDdvSpdCjGm', 'STUDENT', 'ENROLLED'),
('202100009', '임재혁', 'limjh@univ.ac.kr', '010-2222-0009', '$2a$10$Krpq2ztgIG146Mv5bnDjG.s6HQk/yNCbRXEMi6DzhXEDdvSpdCjGm', 'STUDENT', 'ENROLLED'),
('202100010', '한소희', 'hansh@univ.ac.kr', '010-2222-0010', '$2a$10$Krpq2ztgIG146Mv5bnDjG.s6HQk/yNCbRXEMi6DzhXEDdvSpdCjGm', 'STUDENT', 'ENROLLED');

-- ============================================================
-- 4. 강의 (LECTURE) - 2026년 1학기, 모두 연강
-- ============================================================
-- 김영수 교수 (professor_id=1)
INSERT INTO lecture (lecture_code, lecture_name, lecture_room, lecture_year, lecture_semester, lecture_division, lecture_start, lecture_end, lecture_day, professor_id) VALUES
('CSE101', '프로그래밍기초', 'IT401', 2026, '1', '01', '09:00', '12:00', 'MONDAY', 1),
('CSE301', '운영체제', 'IT302', 2026, '1', '01', '13:00', '16:00', 'THURSDAY', 1);

-- 이정희 교수 (professor_id=2)
INSERT INTO lecture (lecture_code, lecture_name, lecture_room, lecture_year, lecture_semester, lecture_division, lecture_start, lecture_end, lecture_day, professor_id) VALUES
('SWE201', '데이터베이스', 'IT205', 2026, '1', '01', '09:00', '12:00', 'TUESDAY', 2),
('SWE301', '소프트웨어공학', 'IT206', 2026, '1', '01', '10:00', '12:00', 'WEDNESDAY', 2);

-- 박민수 교수 (professor_id=3)
INSERT INTO lecture (lecture_code, lecture_name, lecture_room, lecture_year, lecture_semester, lecture_division, lecture_start, lecture_end, lecture_day, professor_id) VALUES
('ICE201', '컴퓨터네트워크', 'IT103', 2026, '1', '01', '14:00', '17:00', 'WEDNESDAY', 3),
('ICE301', '임베디드시스템', 'IT104', 2026, '1', '01', '13:00', '15:00', 'FRIDAY', 3);

-- ============================================================
-- 5. 강의 스케줄 (LECTURE_SCHEDULES) - 강의당 1개씩
-- ============================================================
INSERT INTO lecture_schedules (day_of_week, start_time, end_time, lecture_id) VALUES
('MONDAY',    '09:00:00', '12:00:00', 1),  -- CSE101 프로그래밍기초
('THURSDAY',  '13:00:00', '16:00:00', 2),  -- CSE301 운영체제
('TUESDAY',   '09:00:00', '12:00:00', 3),  -- SWE201 데이터베이스
('WEDNESDAY', '10:00:00', '12:00:00', 4),  -- SWE301 소프트웨어공학
('WEDNESDAY', '14:00:00', '17:00:00', 5),  -- ICE201 컴퓨터네트워크
('FRIDAY',    '13:00:00', '15:00:00', 6);  -- ICE301 임베디드시스템

-- ============================================================
-- 6. 수강 신청 (ENROLLMENT)
--    학생 1~5: CSE101(1), SWE201(3), ICE201(5)
--    학생 6~10: CSE301(2), SWE301(4), ICE301(6)
-- ============================================================
INSERT INTO enrollment (student_id, lecture_id) VALUES
(1, 1), (2, 1), (3, 1), (4, 1), (5, 1),
(1, 3), (2, 3), (3, 3), (4, 3), (5, 3),
(1, 5), (2, 5), (3, 5), (4, 5), (5, 5),
(6, 2), (7, 2), (8, 2), (9, 2), (10, 2),
(6, 4), (7, 4), (8, 4), (9, 4), (10, 4),
(6, 6), (7, 6), (8, 6), (9, 6), (10, 6);

-- ============================================================
-- 7. 강의 세션 (LECTURE_SESSION)
--    각 강의당 5회, 종료/미시작 구분 (오늘: 2026-05-15 목)
-- ============================================================

-- CSE101 프로그래밍기초 (월 09~12) lecture_id=1 → session id 1~5
INSERT INTO lecture_session (session_num, scheduled_at, session_start, session_end, session_status, lecture_id) VALUES
(1, '2026-04-27', '2026-04-27 09:00:00', '2026-04-27 12:00:00', 'ENDED', 1),
(2, '2026-05-04', '2026-05-04 09:00:00', '2026-05-04 12:00:00', 'ENDED', 1),
(3, '2026-05-11', '2026-05-11 09:00:00', '2026-05-11 12:00:00', 'ENDED', 1),
(4, '2026-05-18', '2026-05-18 09:00:00', NULL, 'NOT_STARTED', 1),
(5, '2026-05-25', '2026-05-25 09:00:00', NULL, 'NOT_STARTED', 1);

-- CSE301 운영체제 (목 13~16) lecture_id=2 → session id 6~10
INSERT INTO lecture_session (session_num, scheduled_at, session_start, session_end, session_status, lecture_id) VALUES
(1, '2026-05-01', '2026-05-01 13:00:00', '2026-05-01 16:00:00', 'ENDED', 2),
(2, '2026-05-08', '2026-05-08 13:00:00', '2026-05-08 16:00:00', 'ENDED', 2),
(3, '2026-05-15', '2026-05-15 13:00:00', NULL, 'NOT_STARTED', 2),
(4, '2026-05-22', '2026-05-22 13:00:00', NULL, 'NOT_STARTED', 2),
(5, '2026-05-29', '2026-05-29 13:00:00', NULL, 'NOT_STARTED', 2);

-- SWE201 데이터베이스 (화 09~12) lecture_id=3 → session id 11~15
INSERT INTO lecture_session (session_num, scheduled_at, session_start, session_end, session_status, lecture_id) VALUES
(1, '2026-04-28', '2026-04-28 09:00:00', '2026-04-28 12:00:00', 'ENDED', 3),
(2, '2026-05-05', '2026-05-05 09:00:00', '2026-05-05 12:00:00', 'ENDED', 3),
(3, '2026-05-12', '2026-05-12 09:00:00', '2026-05-12 12:00:00', 'ENDED', 3),
(4, '2026-05-19', '2026-05-19 09:00:00', NULL, 'NOT_STARTED', 3),
(5, '2026-05-26', '2026-05-26 09:00:00', NULL, 'NOT_STARTED', 3);

-- SWE301 소프트웨어공학 (수 10~12) lecture_id=4 → session id 16~20
INSERT INTO lecture_session (session_num, scheduled_at, session_start, session_end, session_status, lecture_id) VALUES
(1, '2026-04-29', '2026-04-29 10:00:00', '2026-04-29 12:00:00', 'ENDED', 4),
(2, '2026-05-06', '2026-05-06 10:00:00', '2026-05-06 12:00:00', 'ENDED', 4),
(3, '2026-05-13', '2026-05-13 10:00:00', '2026-05-13 12:00:00', 'ENDED', 4),
(4, '2026-05-20', '2026-05-20 10:00:00', NULL, 'NOT_STARTED', 4),
(5, '2026-05-27', '2026-05-27 10:00:00', NULL, 'NOT_STARTED', 4);

-- ICE201 컴퓨터네트워크 (수 14~17) lecture_id=5 → session id 21~25
INSERT INTO lecture_session (session_num, scheduled_at, session_start, session_end, session_status, lecture_id) VALUES
(1, '2026-04-29', '2026-04-29 14:00:00', '2026-04-29 17:00:00', 'ENDED', 5),
(2, '2026-05-06', '2026-05-06 14:00:00', '2026-05-06 17:00:00', 'ENDED', 5),
(3, '2026-05-13', '2026-05-13 14:00:00', '2026-05-13 17:00:00', 'ENDED', 5),
(4, '2026-05-20', '2026-05-20 14:00:00', NULL, 'NOT_STARTED', 5),
(5, '2026-05-27', '2026-05-27 14:00:00', NULL, 'NOT_STARTED', 5);

-- ICE301 임베디드시스템 (금 13~15) lecture_id=6 → session id 26~30
INSERT INTO lecture_session (session_num, scheduled_at, session_start, session_end, session_status, lecture_id) VALUES
(1, '2026-05-01', '2026-05-01 13:00:00', '2026-05-01 15:00:00', 'ENDED', 6),
(2, '2026-05-08', '2026-05-08 13:00:00', '2026-05-08 15:00:00', 'ENDED', 6),
(3, '2026-05-15', '2026-05-15 13:00:00', NULL, 'NOT_STARTED', 6),
(4, '2026-05-22', '2026-05-22 13:00:00', NULL, 'NOT_STARTED', 6),
(5, '2026-05-29', '2026-05-29 13:00:00', NULL, 'NOT_STARTED', 6);

-- ============================================================
-- 8. 출석 기록 (ATTENDANCE)
--    종료된 세션에 대해서만 출석 데이터 생성
-- ============================================================

-- ── CSE101 프로그래밍기초 (월 09~12) 학생 1~5 ──

-- 세션1 (id=1, 4/27 월)
INSERT INTO attendance (attend_status, check_time, enter_time, exit_time, stay_rate, session_id, student_id) VALUES
('ATTEND',   '2026-04-27 09:02:00', '2026-04-27 09:02:00', '2026-04-27 11:58:00', 97.8, 1, 1),
('ATTEND',   '2026-04-27 09:00:00', '2026-04-27 09:00:00', '2026-04-27 12:00:00', 100.0, 1, 2),
('LATENESS', '2026-04-27 09:20:00', '2026-04-27 09:20:00', '2026-04-27 12:00:00', 88.9, 1, 3),
('ATTEND',   '2026-04-27 09:03:00', '2026-04-27 09:03:00', '2026-04-27 11:55:00', 93.3, 1, 4),
('ABSENCE',  NULL, NULL, NULL, 0.0, 1, 5);

-- 세션2 (id=2, 5/4 월)
INSERT INTO attendance (attend_status, check_time, enter_time, exit_time, stay_rate, session_id, student_id) VALUES
('ATTEND',   '2026-05-04 09:00:00', '2026-05-04 09:00:00', '2026-05-04 12:00:00', 100.0, 2, 1),
('ATTEND',   '2026-05-04 09:02:00', '2026-05-04 09:02:00', '2026-05-04 12:00:00', 98.9, 2, 2),
('ATTEND',   '2026-05-04 09:01:00', '2026-05-04 09:01:00', '2026-05-04 12:00:00', 99.4, 2, 3),
('ATTEND',   '2026-05-04 09:00:00', '2026-05-04 09:00:00', '2026-05-04 12:00:00', 100.0, 2, 4),
('ATTEND',   '2026-05-04 09:05:00', '2026-05-04 09:05:00', '2026-05-04 11:50:00', 91.7, 2, 5);

-- 세션3 (id=3, 5/11 월)
INSERT INTO attendance (attend_status, check_time, enter_time, exit_time, stay_rate, session_id, student_id) VALUES
('ATTEND',   '2026-05-11 09:00:00', '2026-05-11 09:00:00', '2026-05-11 12:00:00', 100.0, 3, 1),
('LATENESS', '2026-05-11 09:18:00', '2026-05-11 09:18:00', '2026-05-11 12:00:00', 90.0, 3, 2),
('ATTEND',   '2026-05-11 09:01:00', '2026-05-11 09:01:00', '2026-05-11 12:00:00', 99.4, 3, 3),
('ATTEND',   '2026-05-11 09:02:00', '2026-05-11 09:02:00', '2026-05-11 11:58:00', 97.8, 3, 4),
('ABSENCE',  NULL, NULL, NULL, 0.0, 3, 5);

-- ── CSE301 운영체제 (목 13~16) 학생 6~10 ──

-- 세션1 (id=6, 5/1 목)
INSERT INTO attendance (attend_status, check_time, enter_time, exit_time, stay_rate, session_id, student_id) VALUES
('ATTEND',   '2026-05-01 13:00:00', '2026-05-01 13:00:00', '2026-05-01 16:00:00', 100.0, 6, 6),
('ATTEND',   '2026-05-01 13:03:00', '2026-05-01 13:03:00', '2026-05-01 15:55:00', 95.6, 6, 7),
('ABSENCE',  NULL, NULL, NULL, 0.0, 6, 8),
('ATTEND',   '2026-05-01 13:01:00', '2026-05-01 13:01:00', '2026-05-01 16:00:00', 99.4, 6, 9),
('LATENESS', '2026-05-01 13:20:00', '2026-05-01 13:20:00', '2026-05-01 16:00:00', 88.9, 6, 10);

-- 세션2 (id=7, 5/8 목)
INSERT INTO attendance (attend_status, check_time, enter_time, exit_time, stay_rate, session_id, student_id) VALUES
('ATTEND',   '2026-05-08 13:02:00', '2026-05-08 13:02:00', '2026-05-08 16:00:00', 98.9, 7, 6),
('ATTEND',   '2026-05-08 13:00:00', '2026-05-08 13:00:00', '2026-05-08 16:00:00', 100.0, 7, 7),
('ATTEND',   '2026-05-08 13:05:00', '2026-05-08 13:05:00', '2026-05-08 15:50:00', 91.7, 7, 8),
('LATENESS', '2026-05-08 13:22:00', '2026-05-08 13:22:00', '2026-05-08 16:00:00', 87.8, 7, 9),
('ATTEND',   '2026-05-08 13:01:00', '2026-05-08 13:01:00', '2026-05-08 16:00:00', 99.4, 7, 10);

-- ── SWE201 데이터베이스 (화 09~12) 학생 1~5 ──

-- 세션1 (id=11, 4/28 화)
INSERT INTO attendance (attend_status, check_time, enter_time, exit_time, stay_rate, session_id, student_id) VALUES
('ATTEND',   '2026-04-28 09:00:00', '2026-04-28 09:00:00', '2026-04-28 12:00:00', 100.0, 11, 1),
('ATTEND',   '2026-04-28 09:03:00', '2026-04-28 09:03:00', '2026-04-28 11:55:00', 95.6, 11, 2),
('ATTEND',   '2026-04-28 09:01:00', '2026-04-28 09:01:00', '2026-04-28 12:00:00', 99.4, 11, 3),
('LATENESS', '2026-04-28 09:20:00', '2026-04-28 09:20:00', '2026-04-28 12:00:00', 88.9, 11, 4),
('ATTEND',   '2026-04-28 09:02:00', '2026-04-28 09:02:00', '2026-04-28 12:00:00', 98.9, 11, 5);

-- 세션2 (id=12, 5/5 화)
INSERT INTO attendance (attend_status, check_time, enter_time, exit_time, stay_rate, session_id, student_id) VALUES
('ATTEND',   '2026-05-05 09:00:00', '2026-05-05 09:00:00', '2026-05-05 12:00:00', 100.0, 12, 1),
('ABSENCE',  NULL, NULL, NULL, 0.0, 12, 2),
('ATTEND',   '2026-05-05 09:02:00', '2026-05-05 09:02:00', '2026-05-05 12:00:00', 98.9, 12, 3),
('ATTEND',   '2026-05-05 09:01:00', '2026-05-05 09:01:00', '2026-05-05 12:00:00', 99.4, 12, 4),
('ATTEND',   '2026-05-05 09:00:00', '2026-05-05 09:00:00', '2026-05-05 12:00:00', 100.0, 12, 5);

-- 세션3 (id=13, 5/12 화)
INSERT INTO attendance (attend_status, check_time, enter_time, exit_time, stay_rate, session_id, student_id) VALUES
('ATTEND',   '2026-05-12 09:00:00', '2026-05-12 09:00:00', '2026-05-12 12:00:00', 100.0, 13, 1),
('ATTEND',   '2026-05-12 09:02:00', '2026-05-12 09:02:00', '2026-05-12 12:00:00', 98.9, 13, 2),
('LATENESS', '2026-05-12 09:18:00', '2026-05-12 09:18:00', '2026-05-12 12:00:00', 90.0, 13, 3),
('ATTEND',   '2026-05-12 09:00:00', '2026-05-12 09:00:00', '2026-05-12 12:00:00', 100.0, 13, 4),
('ATTEND',   '2026-05-12 09:03:00', '2026-05-12 09:03:00', '2026-05-12 11:55:00', 95.6, 13, 5);

-- ── SWE301 소프트웨어공학 (수 10~12) 학생 6~10 ──

-- 세션1 (id=16, 4/29 수)
INSERT INTO attendance (attend_status, check_time, enter_time, exit_time, stay_rate, session_id, student_id) VALUES
('ATTEND',   '2026-04-29 10:00:00', '2026-04-29 10:00:00', '2026-04-29 12:00:00', 100.0, 16, 6),
('LATENESS', '2026-04-29 10:15:00', '2026-04-29 10:15:00', '2026-04-29 12:00:00', 87.5, 16, 7),
('ATTEND',   '2026-04-29 10:02:00', '2026-04-29 10:02:00', '2026-04-29 12:00:00', 98.3, 16, 8),
('ATTEND',   '2026-04-29 10:00:00', '2026-04-29 10:00:00', '2026-04-29 12:00:00', 100.0, 16, 9),
('ABSENCE',  NULL, NULL, NULL, 0.0, 16, 10);

-- 세션2 (id=17, 5/6 수)
INSERT INTO attendance (attend_status, check_time, enter_time, exit_time, stay_rate, session_id, student_id) VALUES
('ATTEND',   '2026-05-06 10:01:00', '2026-05-06 10:01:00', '2026-05-06 12:00:00', 99.2, 17, 6),
('ATTEND',   '2026-05-06 10:00:00', '2026-05-06 10:00:00', '2026-05-06 12:00:00', 100.0, 17, 7),
('ATTEND',   '2026-05-06 10:03:00', '2026-05-06 10:03:00', '2026-05-06 11:55:00', 93.3, 17, 8),
('ABSENCE',  NULL, NULL, NULL, 0.0, 17, 9),
('ATTEND',   '2026-05-06 10:00:00', '2026-05-06 10:00:00', '2026-05-06 12:00:00', 100.0, 17, 10);

-- 세션3 (id=18, 5/13 수)
INSERT INTO attendance (attend_status, check_time, enter_time, exit_time, stay_rate, session_id, student_id) VALUES
('ATTEND',   '2026-05-13 10:00:00', '2026-05-13 10:00:00', '2026-05-13 12:00:00', 100.0, 18, 6),
('ATTEND',   '2026-05-13 10:02:00', '2026-05-13 10:02:00', '2026-05-13 12:00:00', 98.3, 18, 7),
('LATENESS', '2026-05-13 10:18:00', '2026-05-13 10:18:00', '2026-05-13 12:00:00', 85.0, 18, 8),
('ATTEND',   '2026-05-13 10:00:00', '2026-05-13 10:00:00', '2026-05-13 12:00:00', 100.0, 18, 9),
('ATTEND',   '2026-05-13 10:01:00', '2026-05-13 10:01:00', '2026-05-13 12:00:00', 99.2, 18, 10);

-- ── ICE201 컴퓨터네트워크 (수 14~17) 학생 1~5 ──

-- 세션1 (id=21, 4/29 수)
INSERT INTO attendance (attend_status, check_time, enter_time, exit_time, stay_rate, session_id, student_id) VALUES
('ATTEND',   '2026-04-29 14:00:00', '2026-04-29 14:00:00', '2026-04-29 17:00:00', 100.0, 21, 1),
('ATTEND',   '2026-04-29 14:02:00', '2026-04-29 14:02:00', '2026-04-29 16:58:00', 97.8, 21, 2),
('ATTEND',   '2026-04-29 14:01:00', '2026-04-29 14:01:00', '2026-04-29 17:00:00', 99.4, 21, 3),
('ABSENCE',  NULL, NULL, NULL, 0.0, 21, 4),
('ATTEND',   '2026-04-29 14:03:00', '2026-04-29 14:03:00', '2026-04-29 17:00:00', 98.3, 21, 5);

-- 세션2 (id=22, 5/6 수)
INSERT INTO attendance (attend_status, check_time, enter_time, exit_time, stay_rate, session_id, student_id) VALUES
('ATTEND',   '2026-05-06 14:00:00', '2026-05-06 14:00:00', '2026-05-06 17:00:00', 100.0, 22, 1),
('LATENESS', '2026-05-06 14:15:00', '2026-05-06 14:15:00', '2026-05-06 17:00:00', 91.7, 22, 2),
('ATTEND',   '2026-05-06 14:02:00', '2026-05-06 14:02:00', '2026-05-06 16:58:00', 97.8, 22, 3),
('ATTEND',   '2026-05-06 14:01:00', '2026-05-06 14:01:00', '2026-05-06 17:00:00', 99.4, 22, 4),
('ATTEND',   '2026-05-06 14:00:00', '2026-05-06 14:00:00', '2026-05-06 17:00:00', 100.0, 22, 5);

-- 세션3 (id=23, 5/13 수)
INSERT INTO attendance (attend_status, check_time, enter_time, exit_time, stay_rate, session_id, student_id) VALUES
('ATTEND',   '2026-05-13 14:00:00', '2026-05-13 14:00:00', '2026-05-13 17:00:00', 100.0, 23, 1),
('ATTEND',   '2026-05-13 14:02:00', '2026-05-13 14:02:00', '2026-05-13 17:00:00', 98.9, 23, 2),
('ABSENCE',  NULL, NULL, NULL, 0.0, 23, 3),
('ATTEND',   '2026-05-13 14:00:00', '2026-05-13 14:00:00', '2026-05-13 17:00:00', 100.0, 23, 4),
('ATTEND',   '2026-05-13 14:03:00', '2026-05-13 14:03:00', '2026-05-13 16:55:00', 95.6, 23, 5);

-- ── ICE301 임베디드시스템 (금 13~15) 학생 6~10 ──

-- 세션1 (id=26, 5/1 금)
INSERT INTO attendance (attend_status, check_time, enter_time, exit_time, stay_rate, session_id, student_id) VALUES
('ATTEND',   '2026-05-01 13:00:00', '2026-05-01 13:00:00', '2026-05-01 15:00:00', 100.0, 26, 6),
('ATTEND',   '2026-05-01 13:02:00', '2026-05-01 13:02:00', '2026-05-01 14:55:00', 94.2, 26, 7),
('ATTEND',   '2026-05-01 13:01:00', '2026-05-01 13:01:00', '2026-05-01 15:00:00', 99.2, 26, 8),
('LATENESS', '2026-05-01 13:15:00', '2026-05-01 13:15:00', '2026-05-01 15:00:00', 87.5, 26, 9),
('ATTEND',   '2026-05-01 13:03:00', '2026-05-01 13:03:00', '2026-05-01 15:00:00', 97.5, 26, 10);

-- 세션2 (id=27, 5/8 금)
INSERT INTO attendance (attend_status, check_time, enter_time, exit_time, stay_rate, session_id, student_id) VALUES
('ABSENCE',  NULL, NULL, NULL, 0.0, 27, 6),
('ATTEND',   '2026-05-08 13:00:00', '2026-05-08 13:00:00', '2026-05-08 15:00:00', 100.0, 27, 7),
('ATTEND',   '2026-05-08 13:04:00', '2026-05-08 13:04:00', '2026-05-08 14:55:00', 92.5, 27, 8),
('ATTEND',   '2026-05-08 13:01:00', '2026-05-08 13:01:00', '2026-05-08 15:00:00', 99.2, 27, 9),
('ATTEND',   '2026-05-08 13:02:00', '2026-05-08 13:02:00', '2026-05-08 15:00:00', 98.3, 27, 10);

-- ============================================================
-- 9. 공지사항 (NOTICE_BOARD)
-- ============================================================
INSERT INTO notice_board (notice_title, notice_context, notice_views, notice_created_at, notice_modified_at, professor_id, lecture_id) VALUES
('프로그래밍기초 중간고사 안내', '중간고사는 5월 20일 화요일 09:00~10:30에 IT401에서 진행됩니다.\n시험 범위: 1장~7장\n지참물: 학생증, 필기구', 42, '2026-05-01 10:00:00', '2026-05-01 10:00:00', 1, 1),
('프로그래밍기초 과제 제출 안내', '3차 과제 제출 마감일은 5월 16일입니다.\nLMS에 업로드해주세요.', 35, '2026-05-05 14:00:00', '2026-05-05 14:00:00', 1, 1),
('운영체제 실습 안내', '다음 주부터 리눅스 실습이 시작됩니다.\n개인 노트북에 Ubuntu를 설치해오세요.', 28, '2026-05-03 09:00:00', '2026-05-03 09:00:00', 1, 2),
('데이터베이스 프로젝트 팀 구성', '기말 프로젝트 팀을 구성해주세요.\n3~4인 1팀, 5월 15일까지 팀원 명단 제출', 38, '2026-05-02 11:00:00', '2026-05-02 11:00:00', 2, 3),
('소프트웨어공학 발표 일정', '팀별 발표는 5월 19일부터 시작됩니다.\n발표 순서는 추첨으로 결정합니다.', 22, '2026-05-06 16:00:00', '2026-05-06 16:00:00', 2, 4),
('컴퓨터네트워크 퀴즈 안내', '매주 수요일 수업 시작 시 퀴즈가 있습니다.\n범위: 전주 수업 내용', 30, '2026-05-04 08:00:00', '2026-05-04 08:00:00', 3, 5),
('임베디드시스템 부품 구매 안내', '라즈베리파이 키트를 학과 사무실에서 수령하세요.\n수령 기간: 5월 12일~16일', 25, '2026-05-07 10:00:00', '2026-05-07 10:00:00', 3, 6);

-- ============================================================
-- 10. 질문 게시판 (QUESTION_BOARD)
-- ============================================================
INSERT INTO question_board (question_title, question_context, question_views, question_private, question_created_at, student_id, professor_id, lecture_id) VALUES
('과제 관련 질문입니다', '3차 과제에서 포인터 배열 부분이 이해가 안 됩니다.\n예제 코드 좀 더 설명해주실 수 있나요?', 15, false, '2026-05-06 20:30:00', 1, 1, 1),
('시험 범위 질문', '중간고사 범위에 실습 내용도 포함되나요?', 25, false, '2026-05-08 09:15:00', 2, 1, 1),
('성적 관련 문의 (비공개)', '지난 과제 점수가 낮게 나왔는데 확인 부탁드립니다.', 3, true, '2026-05-09 14:00:00', 3, 1, 1),
('DB 정규화 질문', '3NF와 BCNF의 차이가 잘 이해가 안 됩니다.\n예시로 설명해주실 수 있나요?', 18, false, '2026-05-07 19:00:00', 1, 2, 3),
('프로젝트 주제 관련', '프로젝트 주제를 출석 관리 시스템으로 해도 될까요?', 12, false, '2026-05-10 11:30:00', 4, 2, 3),
('네트워크 실습 오류', 'Wireshark에서 패킷 캡처가 안 됩니다.\nWindows 방화벽 설정 문제인가요?', 20, false, '2026-05-08 16:45:00', 2, 3, 5);

-- ============================================================
-- 11. 답변 (ANSWER) - 교수당 1개씩
-- ============================================================
INSERT INTO answer (answer_content, answer_created_at, answer_modified_at, question_id, professor_id) VALUES
('포인터 배열은 배열의 각 요소가 포인터인 경우입니다.\nint *arr[5]; 는 int 포인터 5개를 담는 배열입니다.\n교재 5장 예제를 다시 확인해보세요.', '2026-05-07 10:00:00', '2026-05-07 10:00:00', 1, 1),
('3NF는 이행적 함수 종속을 제거하고, BCNF는 모든 결정자가 후보키여야 합니다.\n수업 자료 42페이지에 예시가 있으니 참고하세요.', '2026-05-08 09:00:00', '2026-05-08 09:00:00', 4, 2),
('Wireshark 실행 시 관리자 권한으로 실행해보세요.\n그래도 안 되면 WinPcap을 재설치하면 됩니다.', '2026-05-09 11:00:00', '2026-05-09 11:00:00', 6, 3);

-- ============================================================
-- 12. 공결 신청 (ATTENDANCE_OFFICIAL)
-- ============================================================
INSERT INTO attendance_official (official_title, official_reason, evidence_file, official_status, file_name, rejected_reason, official_created_at, student_id, professor_id, lecture_id, session_id) VALUES
('병원 진료로 인한 결석', '4월 27일 병원 정기 검진으로 인해 수업에 참석하지 못했습니다.', 'uploads/evidence/medical_202100005_1.pdf', 'APPROVED', 'medical_202100005_1.pdf', NULL, '2026-04-28 18:00:00', 5, 1, 1, 1),
('가족 경조사', '4월 28일 조부모님 칠순 행사로 결석합니다.', 'uploads/evidence/family_202100004_1.pdf', 'PENDING', 'family_202100004_1.pdf', NULL, '2026-04-28 20:00:00', 4, 2, 3, 11);

-- ============================================================
-- 13. 이의 신청 (ATTENDANCE_OBJECTION)
-- ============================================================
INSERT INTO attendance_objection (objection_title, objection_reason, evidence_file, objection_status, rejected_reason, objection_created_at, student_id, professor_id, lecture_id, session_id) VALUES
('출석 인정 요청', '4월 27일 수업에 참석했으나 시스템 오류로 결석 처리되었습니다.\n교실 CCTV 확인 부탁드립니다.', 'uploads/evidence/objection_202100005_1.jpg', 'PENDING', NULL, '2026-04-28 09:00:00', 5, 1, 1, 1),
('지각 처리 이의', '5월 1일 수업 시작 전에 도착했으나 지각으로 처리되었습니다.\n입실 시간 확인 부탁드립니다.', 'uploads/evidence/objection_202100010_1.jpg', 'REJECTED', '시스템 로그 확인 결과 13:20에 입실하신 것으로 확인됩니다. 수업 시작 시간은 13:00입니다.', '2026-05-02 10:00:00', 10, 1, 2, 6);

-- ============================================================
-- 14. 알림 (NOTIFICATION)
-- ============================================================
INSERT INTO notification (notification_message, notification_related_id, notification_is_read, notification_created_at, notification_type, student_id, professor_id, master_id, lecture_id) VALUES
-- 학생 알림
('프로그래밍기초 새 공지가 등록되었습니다.', '1', false, '2026-05-01 10:00:00', 'NOTICE', 1, NULL, NULL, 1),
('프로그래밍기초 새 공지가 등록되었습니다.', '1', true, '2026-05-01 10:00:00', 'NOTICE', 2, NULL, NULL, 1),
('과제 관련 질문에 답변이 등록되었습니다.', '1', false, '2026-05-07 10:00:00', 'ANSWER', 1, NULL, NULL, 1),
('공결 신청이 승인되었습니다.', '1', true, '2026-05-07 15:00:00', 'ABSENCE_OFFICIAL', 5, NULL, NULL, 1),
('이의 신청이 반려되었습니다.', '2', false, '2026-05-07 11:00:00', 'ABSENCE_OBJECTION', 10, NULL, NULL, 2),
-- 교수 알림
('프로그래밍기초 새 공결 신청이 있습니다.', '1', false, '2026-05-06 18:00:00', 'ABSENCE_OFFICIAL', NULL, 1, NULL, 1),
('프로그래밍기초 새 이의 신청이 있습니다.', '1', false, '2026-05-05 09:00:00', 'ABSENCE_OBJECTION', NULL, 1, NULL, 1),
('데이터베이스 새 질문이 등록되었습니다.', '4', true, '2026-05-07 19:00:00', 'ANSWER', NULL, 2, NULL, 3);

-- ============================================================
-- 데이터 확인 쿼리
-- ============================================================
SELECT '=== 데이터 삽입 결과 ===' AS '';
SELECT '테이블' AS '테이블', '건수' AS '건수'
UNION ALL SELECT 'master', CAST(COUNT(*) AS CHAR) FROM master
UNION ALL SELECT 'professor', CAST(COUNT(*) AS CHAR) FROM professor
UNION ALL SELECT 'student', CAST(COUNT(*) AS CHAR) FROM student
UNION ALL SELECT 'lecture', CAST(COUNT(*) AS CHAR) FROM lecture
UNION ALL SELECT 'lecture_schedules', CAST(COUNT(*) AS CHAR) FROM lecture_schedules
UNION ALL SELECT 'enrollment', CAST(COUNT(*) AS CHAR) FROM enrollment
UNION ALL SELECT 'lecture_session', CAST(COUNT(*) AS CHAR) FROM lecture_session
UNION ALL SELECT 'attendance', CAST(COUNT(*) AS CHAR) FROM attendance
UNION ALL SELECT 'notice_board', CAST(COUNT(*) AS CHAR) FROM notice_board
UNION ALL SELECT 'question_board', CAST(COUNT(*) AS CHAR) FROM question_board
UNION ALL SELECT 'answer', CAST(COUNT(*) AS CHAR) FROM answer
UNION ALL SELECT 'attendance_official', CAST(COUNT(*) AS CHAR) FROM attendance_official
UNION ALL SELECT 'attendance_objection', CAST(COUNT(*) AS CHAR) FROM attendance_objection
UNION ALL SELECT 'notification', CAST(COUNT(*) AS CHAR) FROM notification;
