INSERT IGNORE INTO professors (id, name) VALUES (1, '김교수');

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