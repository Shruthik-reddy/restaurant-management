package com.restaurant.model;

public class OrderItem {

    private Integer id;
    private Integer orderId;
    private Integer menuId;
    private Integer quantity;

    public OrderItem() {
    }

    public OrderItem(Integer id, Integer orderId, Integer menuId, Integer quantity) {
        this.id = id;
        this.orderId = orderId;
        this.menuId = menuId;
        this.quantity = quantity;
    }

    public int getId() {
        return id;
    }

    public int getOrderId() {
        return orderId;
    }

    public int getMenuId() {
        return menuId;
    }

    public int getQuantity() {
        return quantity;
    }

    public void setId(Integer id) {
        this.id = id;
    }

    public void setOrderId(Integer orderId) {
        this.orderId = orderId;
    }

    public void setMenuId(Integer menuId) {
        this.menuId = menuId;
    }

    public void setQuantity(Integer quantity) {
        this.quantity = quantity;
    }
}