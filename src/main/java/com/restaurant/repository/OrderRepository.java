package com.restaurant.repository;

import com.restaurant.model.Order;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public class OrderRepository {

    @Autowired
    private JdbcTemplate jdbcTemplate;

    public int createOrder(int customerId) {

        String sql = "INSERT INTO orders(customer_id) VALUES(?)";

        return jdbcTemplate.update(sql, customerId);
    }

    public List<Order> getAllOrders() {

        String sql = "SELECT * FROM orders";

        return jdbcTemplate.query(sql, (rs, rowNum) ->
                new Order(
                        rs.getInt("id"),
                        rs.getInt("customer_id"),
                        rs.getTimestamp("order_date").toLocalDateTime()
                )
        );
    }
}