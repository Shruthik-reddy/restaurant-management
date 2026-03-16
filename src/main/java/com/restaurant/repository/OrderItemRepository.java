package com.restaurant.repository;

import com.restaurant.model.OrderItem;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Map;

@Repository
public class OrderItemRepository {

    @Autowired
    private JdbcTemplate jdbcTemplate;

    public int addItemToOrder(OrderItem item) {

        String sql = "INSERT INTO order_items(order_id, menu_id, quantity) VALUES (?, ?, ?)";

        return jdbcTemplate.update(
                sql,
                item.getOrderId(),
                item.getMenuId(),
                item.getQuantity()
        );
    }

    public int removeItemFromOrder(int id) {

        String sql = "DELETE FROM order_items WHERE id=?";

        return jdbcTemplate.update(sql, id);
    }

    public List<OrderItem> getItemsByOrder(int orderId) {

        String sql = "SELECT * FROM order_items WHERE order_id=?";

        return jdbcTemplate.query(
                sql,
                (rs, rowNum) -> new OrderItem(
                        rs.getInt("id"),
                        rs.getInt("order_id"),
                        rs.getInt("menu_id"),
                        rs.getInt("quantity")
                ),
                orderId
        );
    }

    public List<Map<String, Object>> getOrderItemsWithDetails(int orderId) {
        String sql = "SELECT oi.id, oi.order_id, oi.menu_id, oi.quantity, " +
                     "m.name as item_name, m.price as item_price " +
                     "FROM order_items oi " +
                     "JOIN menu m ON oi.menu_id = m.id " +
                     "WHERE oi.order_id = ?";

        return jdbcTemplate.queryForList(sql, orderId);
    }

    public double calculateBill(int orderId) {

        String sql = "SELECT SUM(m.price * oi.quantity) " +
                     "FROM order_items oi " +
                     "JOIN menu m ON oi.menu_id = m.id " +
                     "WHERE oi.order_id = ?";

        Double total = jdbcTemplate.queryForObject(sql, Double.class, orderId);

        return total != null ? total : 0.0;
    }
}