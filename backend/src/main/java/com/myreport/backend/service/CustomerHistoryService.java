package com.myreport.backend.service;

import com.myreport.backend.dto.common.CustomerDetailsResponse;
import com.myreport.backend.dto.common.CustomerOrderRowResponse;
import com.myreport.backend.entity.Customer;
import com.myreport.backend.entity.Order;
import com.myreport.backend.entity.UserAccount;
import com.myreport.backend.exception.ApiException;
import com.myreport.backend.repository.CustomerRepository;
import com.myreport.backend.repository.OrderRepository;
import com.myreport.backend.repository.UserAccountRepository;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.dao.DataAccessException;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class CustomerHistoryService {

    private static final Logger logger = LoggerFactory.getLogger(CustomerHistoryService.class);

    private final UserAccountRepository userAccountRepository;
    private final CustomerRepository customerRepository;
    private final OrderRepository orderRepository;

    @Transactional(readOnly = true)
    public CustomerDetailsResponse getCustomerDetails(String email, Long customerId) {
        logger.info("Loading customer details. admin={}, customerId={}", email, customerId);
        UserAccount admin = userAccountRepository.findByEmailIgnoreCase(email)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Admin not found"));
        Customer customer = customerRepository.findById(customerId)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Customer not found"));

        if (customer.getStore() == null || customer.getStore().getOwner() == null
                || !admin.getId().equals(customer.getStore().getOwner().getId())) {
            throw new ApiException(HttpStatus.NOT_FOUND, "Customer not found");
        }

        return new CustomerDetailsResponse(
                customer.getId(),
                customer.getFullName(),
                customer.getMobileNumber(),
                customer.getCity(),
                customer.getTotalSpent(),
                customer.getPurchaseCount()
        );
    }

    @Transactional(readOnly = true)
    public List<CustomerOrderRowResponse> getCustomerOrders(String email, Long customerId, LocalDate startDate, LocalDate endDate) {
        logger.info("Loading customer orders. admin={}, customerId={}, startDate={}, endDate={}", email, customerId, startDate, endDate);
        UserAccount admin = userAccountRepository.findByEmailIgnoreCase(email)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Admin not found"));
        Customer customer = customerRepository.findById(customerId)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Customer not found"));

        if (customer.getStore() == null || customer.getStore().getOwner() == null
                || !admin.getId().equals(customer.getStore().getOwner().getId())) {
            throw new ApiException(HttpStatus.NOT_FOUND, "Customer not found");
        }

        LocalDateTime start = startDate != null ? startDate.atStartOfDay() : null;
        LocalDateTime end = endDate != null ? endDate.atTime(LocalTime.MAX) : null;

        List<Order> orders;
        try {
            orders = (startDate != null || endDate != null)
                    ? orderRepository.findByOwnerAndCustomerWithDateRange(admin.getId(), customerId, start, end)
                    : orderRepository.findByOwnerAndCustomerOrderByCreatedAtDesc(admin.getId(), customerId);
        } catch (DataAccessException e) {
            return List.of();
        }

        List<CustomerOrderRowResponse> mapped = orders.stream().map(this::mapRow).toList();
        logger.info("Loaded customer orders. customerId={}, count={}", customerId, mapped.size());
        return mapped;
    }

    @Transactional(readOnly = true)
    public List<CustomerOrderRowResponse> filterOrders(String email, String name, LocalDate startDate, LocalDate endDate) {
        UserAccount admin = userAccountRepository.findByEmailIgnoreCase(email)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Admin not found"));

        LocalDateTime start = startDate != null ? startDate.atStartOfDay() : null;
        LocalDateTime end = endDate != null ? endDate.atTime(LocalTime.MAX) : null;

        try {
            return orderRepository.filterOrders(admin.getId(), name, start, end).stream().map(this::mapRow).toList();
        } catch (DataAccessException e) {
            return List.of();
        }
    }

    private CustomerOrderRowResponse mapRow(Order order) {
        return new CustomerOrderRowResponse(
                order.getId(),
                order.getCreatedAt(),
                order.getProduct() != null ? order.getProduct().getName() : null,
                order.getQuantity(),
                order.getPrice(),
                order.getTotalAmount()
        );
    }
}
