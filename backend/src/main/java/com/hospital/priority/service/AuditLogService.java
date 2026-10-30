package com.hospital.priority.service;

import com.hospital.priority.model.AuditLog;
import com.hospital.priority.model.Role;
import com.hospital.priority.repository.AuditLogRepository;
import com.hospital.priority.security.UserPrincipal;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.time.Instant;

@Service
@RequiredArgsConstructor
public class AuditLogService {

    private final AuditLogRepository auditLogRepository;

    public void logAction(String action, String entityType, String entityId, String oldValue, String newValue, String reason) {
        String userId = "SYSTEM";
        String userName = "SYSTEM_AUTOMATION";
        Role userRole = Role.ADMIN;

        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth != null && auth.getPrincipal() instanceof UserPrincipal principal) {
            userId = principal.getId();
            userName = principal.getName();
            userRole = principal.getRole();
        }

        AuditLog log = AuditLog.builder()
                .userId(userId)
                .userName(userName)
                .userRole(userRole)
                .action(action)
                .entityType(entityType)
                .entityId(entityId)
                .oldValue(oldValue)
                .newValue(newValue)
                .reason(reason)
                .timestamp(Instant.now())
                .build();

        auditLogRepository.save(log);
    }

    public Page<AuditLog> getAuditLogs(int page, int size) {
        return auditLogRepository.findAllByOrderByTimestampDesc(PageRequest.of(page, size));
    }
}
