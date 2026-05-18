package com.myreport.backend.repository;

import com.myreport.backend.entity.PasswordResetToken;
import java.time.LocalDateTime;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface PasswordResetTokenRepository extends JpaRepository<PasswordResetToken, Long> {

    Optional<PasswordResetToken> findByToken(String token);

    long deleteByExpiresAtBefore(LocalDateTime cutoff);
}
