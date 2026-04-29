package com.myreport.backend.repository;

import com.myreport.backend.entity.Notification;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

public interface NotificationRepository extends JpaRepository<Notification, Long> {

    List<Notification> findTop8ByUserIdOrderByCreatedAtDesc(Long userId);
}
