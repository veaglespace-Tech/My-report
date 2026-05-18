package com.myreport.backend.repository;

import com.myreport.backend.entity.UserAccount;
import com.myreport.backend.entity.enums.Role;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface UserAccountRepository extends JpaRepository<UserAccount, Long> {

    Optional<UserAccount> findByEmailIgnoreCase(String email);

    List<UserAccount> findByRole(Role role);

    List<UserAccount> findAllByRoleOrderByCreatedAtDesc(Role role);

    long countByRole(Role role);
}
