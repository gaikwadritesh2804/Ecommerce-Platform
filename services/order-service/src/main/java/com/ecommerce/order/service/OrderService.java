
package com.ecommerce.order.service;

import com.ecommerce.order.entity.Order;
import com.ecommerce.order.repository.OrderRepository;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@Service
public class OrderService {

    private final OrderRepository repository;

    public OrderService(OrderRepository repository) {
        this.repository = repository;
    }

    public List<Order> getAllOrders() {
        return repository.findAll();
    }

    public Order getOrder(Long id) {
        return repository.findById(id)
            .orElseThrow(() -> new ResponseStatusException(
                HttpStatus.NOT_FOUND, "Order not found"));
    }

    public Order createOrder(Long userId, Long productId, Integer quantity) {
        if (quantity == null || quantity <= 0) {
            throw new ResponseStatusException(
                HttpStatus.BAD_REQUEST, "Quantity must be positive");
        }

        return repository.save(new Order(userId, productId, quantity));
    }

    public void deleteOrder(Long id) {
        if (!repository.existsById(id)) {
            throw new ResponseStatusException(
                HttpStatus.NOT_FOUND, "Order not found");
        }

        repository.deleteById(id);
    }
}
