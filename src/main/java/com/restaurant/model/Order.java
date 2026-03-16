package com.restaurant.model;

import java.time.LocalDateTime;

public class Order {

    private int id;
    private int customerId;
    private LocalDateTime orderDate;

    public Order() {
    }

    public Order(int id, int customerId, LocalDateTime orderDate) {
        this.id = id;
        this.customerId = customerId;
        this.orderDate = orderDate;
    }

    public int getId() {
        return id;
    }

    public int getCustomerId() {
        return customerId;
    }

    public LocalDateTime getOrderDate() {
        return orderDate;
    }

    public void setId(int id) {
        this.id = id;
    }

    public void setCustomerId(int customerId) {
        this.customerId = customerId;
    }

    public void setOrderDate(LocalDateTime orderDate) {
        this.orderDate = orderDate;
    }
}