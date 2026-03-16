package com.restaurant.service;

import com.restaurant.model.Order;
import com.restaurant.model.OrderItem;
import com.restaurant.repository.OrderItemRepository;
import com.restaurant.repository.OrderRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Map;

@Service
public class OrderService {

    @Autowired
    private OrderRepository orderRepository;

    @Autowired
    private OrderItemRepository orderItemRepository;

    public int createOrder(int customerId) {
        return orderRepository.createOrder(customerId);
    }

    public int addItemToOrder(OrderItem item) {
        return orderItemRepository.addItemToOrder(item);
    }

    public List<OrderItem> getItemsByOrder(int orderId) {
        return orderItemRepository.getItemsByOrder(orderId);
    }

    public List<Map<String, Object>> getOrderItemsWithDetails(int orderId) {
        return orderItemRepository.getOrderItemsWithDetails(orderId);
    }

    public double generateBill(int orderId) {
        return orderItemRepository.calculateBill(orderId);
    }

    public List<Order> getAllOrders() {
        return orderRepository.getAllOrders();
    }
}