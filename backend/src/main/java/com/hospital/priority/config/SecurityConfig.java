package com.hospital.priority.config;

import com.hospital.priority.security.CustomUserDetailsService;
import com.hospital.priority.security.JwtAuthFilter;
import com.hospital.priority.security.JwtTokenProvider;
import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.dao.DaoAuthenticationProvider;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfigurationSource;

@Configuration
@EnableWebSecurity
@EnableMethodSecurity
@RequiredArgsConstructor
public class SecurityConfig {

    private final CustomUserDetailsService userDetailsService;
    private final JwtTokenProvider tokenProvider;
    private final CorsConfigurationSource corsConfigurationSource;

    @Bean
    public JwtAuthFilter jwtAuthFilter() {
        return new JwtAuthFilter(tokenProvider, userDetailsService);
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public DaoAuthenticationProvider authenticationProvider() {
        DaoAuthenticationProvider authProvider = new DaoAuthenticationProvider();
        authProvider.setUserDetailsService(userDetailsService);
        authProvider.setPasswordEncoder(passwordEncoder());
        return authProvider;
    }

    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration authConfig) throws Exception {
        return authConfig.getAuthenticationManager();
    }

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
                .cors(cors -> cors.configurationSource(corsConfigurationSource))
                .csrf(AbstractHttpConfigurer::disable)
                .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                .authorizeHttpRequests(auth -> auth
                        // Public endpoints
                        .requestMatchers("/", "/api", "/api/", "/api/health").permitAll()
                        .requestMatchers("/api/auth/**").permitAll()
                        .requestMatchers("/ws-hospital/**").permitAll()
                        .requestMatchers("/api/dev/seed").permitAll()
                        .requestMatchers(HttpMethod.GET, "/api/dashboard/**").permitAll()
                        .requestMatchers(HttpMethod.GET, "/api/queue/**").permitAll()

                        // Role-based restrictions
                        .requestMatchers("/api/audit-logs/**").hasRole("ADMIN")
                        .requestMatchers(HttpMethod.POST, "/api/doctors/**").hasRole("ADMIN")
                        .requestMatchers(HttpMethod.PATCH, "/api/doctors/*/status").hasRole("ADMIN")
                        .requestMatchers(HttpMethod.DELETE, "/api/patients/**").hasRole("ADMIN")
                        .requestMatchers(HttpMethod.POST, "/api/patients/**").hasAnyRole("ADMIN", "NURSE", "RECEPTIONIST")
                        .requestMatchers(HttpMethod.PUT, "/api/patients/**").hasAnyRole("ADMIN", "NURSE", "RECEPTIONIST")

                        .requestMatchers(HttpMethod.POST, "/api/emergency-cases").hasAnyRole("ADMIN", "NURSE", "RECEPTIONIST")
                        .requestMatchers(HttpMethod.PATCH, "/api/emergency-cases/*/status").hasAnyRole("ADMIN", "DOCTOR", "NURSE")

                        .requestMatchers("/api/treatments/**").hasAnyRole("ADMIN", "DOCTOR")
                        .requestMatchers(HttpMethod.PATCH, "/api/emergency-cases/*/priority").hasAnyRole("ADMIN", "DOCTOR", "NURSE")
                        .requestMatchers(HttpMethod.POST, "/api/emergency-cases/*/assign-doctor").hasAnyRole("ADMIN", "DOCTOR", "NURSE")

                        // Authenticated endpoints
                        .anyRequest().authenticated()
                );

        http.authenticationProvider(authenticationProvider());
        http.addFilterBefore(jwtAuthFilter(), UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }
}
