package com.restaurant.controller;

import com.restaurant.model.Order;
import com.restaurant.model.OrderItem;
import com.restaurant.service.OrderService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
@CrossOrigin(origins="*")
@RestController
@RequestMapping("/order")
public class OrderController {

    @Autowired
    private OrderService orderService;

    @PostMapping("/create/{customerId}")
    public int createOrder(@PathVariable int customerId) {
        return orderService.createOrder(customerId);
    }

    @PostMapping("/addItem")
    public int addItemToOrder(@RequestBody OrderItem item) {
        return orderService.addItemToOrder(item);
    }

    @GetMapping("/items/{orderId}")
    public List<OrderItem> getOrderItems(@PathVariable int orderId) {
        return orderService.getItemsByOrder(orderId);
    }

    @GetMapping("/itemsWithDetails/{orderId}")
    public List<Map<String, Object>> getOrderItemsWithDetails(@PathVariable int orderId) {
        return orderService.getOrderItemsWithDetails(orderId);
    }

    @GetMapping("/bill/{orderId}")
    public double generateBill(@PathVariable int orderId) {
        return orderService.generateBill(orderId);
    }

    @GetMapping("/all")
    public List<Order> getAllOrders() {
        return orderService.getAllOrders();
    }
}