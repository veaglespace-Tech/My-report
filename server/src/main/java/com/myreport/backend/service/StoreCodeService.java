package com.myreport.backend.service;

import com.myreport.backend.repository.StoreRepository;
import java.security.SecureRandom;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class StoreCodeService {

    private static final String PREFIX = "MR";
    private static final String ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
    private static final SecureRandom RANDOM = new SecureRandom();

    private final StoreRepository storeRepository;

    public String generateUniqueStoreCode() {
        for (int attempt = 0; attempt < 20; attempt++) {
            String candidate = generateCandidate();
            if (!storeRepository.existsByStoreCode(candidate)) {
                return candidate;
            }
        }
        throw new IllegalStateException("Unable to generate a unique store code");
    }

    private String generateCandidate() {
        StringBuilder code = new StringBuilder(PREFIX).append("-");
        for (int index = 0; index < 8; index++) {
            code.append(ALPHABET.charAt(RANDOM.nextInt(ALPHABET.length())));
        }
        return code.toString();
    }
}
