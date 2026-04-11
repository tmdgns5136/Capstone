package com.attendance.attendancesystem;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.data.jpa.repository.config.EnableJpaAuditing;

@EnableJpaAuditing
@SpringBootApplication
public class AttendanceSystemApplication {

	public static void main(String[] args) {
		SpringApplication.run(AttendanceSystemApplication.class, args);
	}

}
