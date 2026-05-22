INSERT IGNORE INTO professors (id, name, professor_password, professor_num, role_type) VALUES
(1, '김교수', '1234', '202611', 'PROFESSOR');

INSERT IGNORE INTO lectures (id, lecture_code, name, room, professor_id) VALUES
(1, 'CS001', '알고리즘', 'G207', 1),
(2, 'CS002', '객체지향 프로그래밍', 'G209', 1);

INSERT IGNORE INTO lecture_schedules (id, day_of_week, start_time, end_time, lecture_id) VALUES
(1, 'MONDAY', '09:00:00', '10:50:00', 1),
(2, 'TUESDAY', '13:00:00', '14:50:00', 1),
(3, 'MONDAY', '15:00:00', '16:50:00', 2);

INSERT IGNORE INTO students (id, student_number, name) VALUES
(1, '20210001', '학생1'),
(2, '20210002', '학생2'),
(3, '20210003', '학생3');

INSERT IGNORE INTO enrollments (id, lecture_id, student_id) VALUES
(1, 1, 1),
(2, 1, 2),
(3, 2, 2),
(4, 2, 3);

INSERT IGNORE INTO absence_requests
(id, absence_date, reason, request_date, status, has_document, file_name, file_path, reject_reason, student_id, lecture_id)
VALUES
(1, '2026-03-10', '병원 진료', '2026-03-11', 'WAIT', true, 'medical.txt', 'files/medical.txt', null, 1, 1),
(2, '2026-03-12', '가족 행사', '2026-03-13', 'APPROVED', false, null, null, null, 2, 1);

INSERT IGNORE INTO appeals
(id, appeal_date, reason, request_date, status, reject_reason, student_id, lecture_id)
VALUES
(1, '2026-03-18', '얼굴 인식 단말기가 정상적으로 인식하지 못했습니다.', '2026-03-18', 'WAIT', null, 1, 1),
(2, '2026-03-19', '정상적으로 출석했는데 결석으로 처리되었습니다.', '2026-03-19', 'APPROVED', null, 2, 1);