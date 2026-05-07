package com.example.demo.domain.master.entity;


import com.example.demo.domain.enumerate.RoleType;
import com.example.demo.domain.student.notification.entity.Notification;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.ArrayList;
import java.util.List;

@Entity
@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
@Table(name = "MASTER")
public class Master {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "MASTER_ID", unique = true, nullable = false)
    private Long masterId;

    @Column(name = "MASTER_NUM", length = 10, unique = true, nullable = false)
    private String masterNum;

    @Column(name = "MASTER_PASSWORD", length = 100, nullable = false)
    private String masterPassword;

    @Column(name = "ROLE_TYPE", length = 20, nullable = false)
    @Enumerated(EnumType.STRING)
    private RoleType roleType;

    @Builder.Default
    @OneToMany(mappedBy = "master", cascade = CascadeType.ALL)
    private List<Notification> notifications = new ArrayList<>();

}
