<<<<<<<< HEAD:src/main/java/com/example/demo/global/config/PasswordConfig.java
package com.example.demo.global.config;
========
package com.attendance.attendancesystem.global.config;
>>>>>>>> origin/Jeongtaek:src/main/java/com/attendance/attendancesystem/global/config/PasswordConfig.java

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;

@Configuration
public class PasswordConfig {
    @Bean
    public PasswordEncoder passwordEncoder(){
        return new BCryptPasswordEncoder();
    }
}
