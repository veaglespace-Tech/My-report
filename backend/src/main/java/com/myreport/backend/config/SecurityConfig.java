package com.myreport.backend.config;

import com.myreport.backend.security.CustomUserDetailsService;
import com.myreport.backend.security.JwtAuthenticationFilter;
import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.authentication.dao.DaoAuthenticationProvider;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

@Configuration
@EnableMethodSecurity
@RequiredArgsConstructor
public class SecurityConfig {

    private final JwtAuthenticationFilter jwtAuthenticationFilter;
    private final CustomUserDetailsService customUserDetailsService;

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
                .csrf(AbstractHttpConfigurer::disable)
                .cors(Customizer.withDefaults())
                .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                .authenticationProvider(authenticationProvider())
                .authorizeHttpRequests(auth -> auth
                        .requestMatchers(HttpMethod.OPTIONS, "/**")
                        .permitAll()
                        .requestMatchers(HttpMethod.GET, "/", "/api/health", "/favicon.ico")
                        .permitAll()
                        .requestMatchers(HttpMethod.GET, "/uploads/**")
                        .permitAll()
                        .requestMatchers(HttpMethod.GET, "/api/public/plans")
                        .permitAll()
                        .requestMatchers("/api/plans", "/api/plans/**")
                        .permitAll()
                        .requestMatchers(HttpMethod.GET, "/api/public/**")
                        .permitAll()
                        .requestMatchers("/api/auth/**")
                        .permitAll()
                        .requestMatchers(HttpMethod.POST,
                                "/api/payments/payu/success",
                                "/api/payments/payu/failure")
                        .permitAll()
                        .requestMatchers(HttpMethod.GET,
                                "/api/payments/payu/success",
                                "/api/payments/payu/failure")
                        .permitAll()
                        .requestMatchers(HttpMethod.POST,
                                "/api/contact",
                                "/api/contact/send",
                                "/api/enquiry/send",
                                "/api/support/chatbot")
                        .permitAll()
                        .requestMatchers(HttpMethod.GET, "/api/support/enquiries")
                        .hasRole("SUPER_ADMIN")
                        .requestMatchers(HttpMethod.POST, "/api/support/reply")
                        .hasRole("SUPER_ADMIN")
                        .requestMatchers(HttpMethod.PUT, "/api/support/status")
                        .hasRole("SUPER_ADMIN")
                        .requestMatchers(HttpMethod.DELETE, "/api/support/delete/**")
                        .hasRole("SUPER_ADMIN")
                        .requestMatchers("/api/stores/**")
                        .hasRole("SUPER_ADMIN")
                        .requestMatchers("/api/super-admin/**")
                        .hasRole("SUPER_ADMIN")
                        .requestMatchers("/api/admin/**", "/api/payments/**")
                        .hasAnyRole("ADMIN", "SUPER_ADMIN")
                        .requestMatchers("/error")
                        .permitAll()
                        .anyRequest()
                        .authenticated()
                )
                .addFilterBefore(jwtAuthenticationFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }

    @Bean
    public DaoAuthenticationProvider authenticationProvider() {
        DaoAuthenticationProvider provider = new DaoAuthenticationProvider();
        provider.setUserDetailsService(customUserDetailsService);
        provider.setPasswordEncoder(passwordEncoder());
        return provider;
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }
}
