package com.hospital.priority.service;

import com.hospital.priority.dto.AuthRequest;
import com.hospital.priority.dto.AuthResponse;
import com.hospital.priority.dto.RegisterRequest;
import com.hospital.priority.exception.InvalidInputException;
import com.hospital.priority.model.User;
import com.hospital.priority.model.Role;
import com.hospital.priority.repository.UserRepository;
import com.hospital.priority.security.JwtTokenProvider;
import com.hospital.priority.security.UserPrincipal;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.time.Instant;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final AuthenticationManager authenticationManager;
    private final JwtTokenProvider tokenProvider;
    private final AuditLogService auditLogService;

    public AuthResponse register(RegisterRequest request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new InvalidInputException("Email address is already registered: " + request.getEmail());
        }

        User user = User.builder()
                .name(request.getName())
                .email(request.getEmail().toLowerCase().trim())
                .passwordHash(passwordEncoder.encode(request.getPassword()))
                .role(Role.RECEPTIONIST)
                .active(true)
                .createdAt(Instant.now())
                .build();

        user = userRepository.save(user);

        auditLogService.logAction("USER_REGISTER", "USER", user.getId(), null, user.getRole().name(), "New user registered");

        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.getEmail(), request.getPassword())
        );

        String token = tokenProvider.generateToken(authentication);

        return AuthResponse.builder()
                .token(token)
                .user(AuthResponse.UserDto.builder()
                        .id(user.getId())
                        .name(user.getName())
                        .email(user.getEmail())
                        .role(user.getRole())
                        .build())
                .build();
    }

    public AuthResponse login(AuthRequest request) {
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.getEmail().toLowerCase().trim(), request.getPassword())
        );

        UserPrincipal principal = (UserPrincipal) authentication.getPrincipal();
        String token = tokenProvider.generateToken(authentication);

        auditLogService.logAction("USER_LOGIN", "USER", principal.getId(), null, principal.getRole().name(), "Successful login");

        return AuthResponse.builder()
                .token(token)
                .user(AuthResponse.UserDto.builder()
                        .id(principal.getId())
                        .name(principal.getName())
                        .email(principal.getEmail())
                        .role(principal.getRole())
                        .build())
                .build();
    }
}
