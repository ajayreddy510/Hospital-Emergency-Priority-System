package com.hospital.priority.controller;

import com.hospital.priority.dto.ApiResponse;
import com.hospital.priority.dto.AuthRequest;
import com.hospital.priority.dto.AuthResponse;
import com.hospital.priority.dto.RegisterRequest;
import com.hospital.priority.security.UserPrincipal;
import com.hospital.priority.service.AuthService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;

    @PostMapping("/register")
    public ResponseEntity<ApiResponse<AuthResponse>> register(@Valid @RequestBody RegisterRequest request) {
        AuthResponse response = authService.register(request);
        return ResponseEntity.ok(ApiResponse.success(response, "User registered successfully"));
    }

    @PostMapping("/login")
    public ResponseEntity<ApiResponse<AuthResponse>> login(@Valid @RequestBody AuthRequest request) {
        AuthResponse response = authService.login(request);
        return ResponseEntity.ok(ApiResponse.success(response, "Authentication successful"));
    }

    @GetMapping("/me")
    public ResponseEntity<ApiResponse<AuthResponse.UserDto>> getCurrentUser(@AuthenticationPrincipal UserPrincipal principal) {
        if (principal == null) {
            return ResponseEntity.status(401).body(ApiResponse.error("Not authenticated", "UNAUTHORIZED"));
        }
        AuthResponse.UserDto userDto = AuthResponse.UserDto.builder()
                .id(principal.getId())
                .name(principal.getName())
                .email(principal.getEmail())
                .role(principal.getRole())
                .build();
        return ResponseEntity.ok(ApiResponse.success(userDto));
    }
}
