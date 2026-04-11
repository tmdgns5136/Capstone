package com.attendance.attendancesystem.domain.professor.entity;

import com.attendance.attendancesystem.domain.professor.RoleType;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Data
@AllArgsConstructor
@NoArgsConstructor
@Table(name = "professors")
public class Professor {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "PROFESSOR_NUM", length = 10, unique = true, nullable = false)
    private String professorNum;

    @Column(name = "name", nullable = false)
    private String name;

    @Column(name = "PROFESSOR_PASSWORD", length = 100, nullable = false)
    private String password;

    @Column(name = "ROLE_TYPE", length = 20, nullable = false)
    @Enumerated(EnumType.STRING)
    private RoleType roleType;


    public Professor(String name) {
        this.name = name;
    }

    public Long getId() {
        return id;
    }

    public String getName() {
        return name;
    }
}