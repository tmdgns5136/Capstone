-- ── 교수 ──
INSERT IGNORE INTO professors
(PROFESSOR_ID, PROFESSOR_NAME, PROFESSOR_PASSWORD, PROFESSOR_NUM, PROFESSOR_EMAIL, MAJOR, PROFESSOR_PHONENUM, ROLE_TYPE, PROFESSOR_STATUS)
VALUES
(1, '김교수', '1234', '202611', 'kimprof@univ.ac.kr', '컴퓨터공학', '010-1111-1111', 'PROFESSOR', 'ACTIVE');

-- ── 학생 ──
INSERT IGNORE INTO students
(STUDENT_ID, STUDENT_NUM, STUDENT_NAME, STUDENT_EMAIL, STUDENT_PHONENUM, STUDENT_PASSWORD, ROLE_TYPE, STUDENT_CLASS_STATUS)
VALUES
(1, '202100001', '학생1', 'stu1@univ.ac.kr', '010-2001-0001', '1234', 'STUDENT', 'ENROLLED'),
(2, '202100002', '학생2', 'stu2@univ.ac.kr', '010-2001-0002', '1234', 'STUDENT', 'ENROLLED'),
(3, '202100003', '학생3', 'stu3@univ.ac.kr', '010-2001-0003', '1234', 'STUDENT', 'ENROLLED');

-- ── 강의 (2026년 1학기, 단일 요일) ──
INSERT IGNORE INTO lectures
(LECTURE_ID, LECTURE_CODE, LECTURE_NAME, LECTURE_ROOM, LECTURE_YEAR, LECTURE_SEMESTER, lecture_division, lecture_day, lecture_start, lecture_end, PROFESSOR_ID)
VALUES
(1, 'CS001', '알고리즘',        'G207', 2026, '1학기', '01', 'MONDAY',  '09:00', '10:50', 1),
(2, 'CS002', '객체지향 프로그래밍', 'G209', 2026, '1학기', '01', 'WEDNESDAY', '13:00', '14:50', 1);

-- ── 수강 등록 ──
INSERT IGNORE INTO enrollments (ENROLLMENT_ID, LECTURE_ID, STUDENT_ID) VALUES
(1, 1, 1),
(2, 1, 2),
(3, 2, 2),
(4, 2, 3);

-- ── 강의 세션 (알고리즘: 월요일 3주차, 객체지향: 수요일 2주차) ──
INSERT IGNORE INTO lecture_sessions
(SESSION_ID, SESSION_NUM, SCHEDULED_AT, SESSION_START, SESSION_END, Session_Status, LECTURE_ID)
VALUES
(1, 1, '2026-03-02', '2026-03-02 09:00:00', '2026-03-02 10:50:00', 'ENDED', 1),
(2, 2, '2026-03-09', '2026-03-09 09:00:00', '2026-03-09 10:50:00', 'ENDED', 1),
(3, 3, '2026-03-16', '2026-03-16 09:00:00', '2026-03-16 10:50:00', 'ENDED', 1),
(4, 1, '2026-03-04', '2026-03-04 13:00:00', '2026-03-04 14:50:00', 'ENDED', 2),
(5, 2, '2026-03-11', '2026-03-11 13:00:00', '2026-03-11 14:50:00', 'ENDED', 2);

-- ── 출결 기록 ──
INSERT IGNORE INTO attendances
(ATTENDANCE_ID, ATTEND_STATUS, CHECK_TIME, SESSION_ID, STUDENT_ID)
VALUES
-- 알고리즘 1주차: 학생1 출석, 학생2 지각
(1, 'ATTEND',   '2026-03-02 09:01:00', 1, 1),
(2, 'LATENESS', '2026-03-02 09:15:00', 1, 2),
-- 알고리즘 2주차: 학생1 결석, 학생2 출석
(3, 'ABSENCE',  null,                  2, 1),
(4, 'ATTEND',   '2026-03-09 09:02:00', 2, 2),
-- 알고리즘 3주차: 학생1 출석, 학생2 출석
(5, 'ATTEND',   '2026-03-16 09:00:00', 3, 1),
(6, 'ATTEND',   '2026-03-16 09:03:00', 3, 2),
-- 객체지향 1주차: 학생2 출석, 학생3 결석
(7, 'ATTEND',   '2026-03-04 13:01:00', 4, 2),
(8, 'ABSENCE',  null,                  4, 3),
-- 객체지향 2주차: 학생2 출석, 학생3 출석
(9, 'ATTEND',   '2026-03-11 13:00:00', 5, 2),
(10, 'ATTEND',  '2026-03-11 13:02:00', 5, 3);

-- ── 공결 신청 ──
INSERT IGNORE INTO attendance_official
(OFFICIAL_ID, OFFICIAL_TITLE, OFFICIAL_REASON, EVIDENCE_FILE, FILE_NAME, OFFICIAL_STATUS, REJECTED_REASON, OFFICIAL_CREATED_AT, STUDENT_ID, PROFESSOR_ID, LECTURE_ID, SESSION_ID)
VALUES
(1, '병원 진료', '정기 검진으로 인한 결석', 'files/medical.pdf', 'medical.pdf', 'WAIT', null, '2026-03-11 10:00:00', 1, 1, 1, 2),
(2, '가족 행사',  '가족 결혼식 참석',       null,               null,          'APPROVED', null, '2026-03-13 09:00:00', 2, 1, 1, 1);

-- ── 이의 신청 ──
INSERT IGNORE INTO attendance_objection
(OBJECTION_ID, OBJECTION_TITLE, OBJECTION_REASON, EVIDENCE_FILE, OBJECTION_STATUS, REJECTED_REASON, OBJECTION_CREATED_AT, STUDENT_ID, PROFESSOR_ID, LECTURE_ID, SESSION_ID)
VALUES
(1, '출석 인식 오류',   '얼굴 인식 단말기가 정상적으로 인식하지 못했습니다.', null, 'WAIT',     null, '2026-03-18 11:00:00', 1, 1, 1, 2),
(2, '결석 처리 이의', '정상적으로 출석했는데 결석으로 처리되었습니다.',     null, 'APPROVED', null, '2026-03-19 14:00:00', 2, 1, 1, 1);
