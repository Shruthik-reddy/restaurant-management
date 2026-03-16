package com.restaurant.repository;

import com.restaurant.model.Customer;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public class CustomerRepository {

    @Autowired
    private JdbcTemplate jdbcTemplate;

    public int addCustomer(Customer customer) {

        String sql = "INSERT INTO customer(name, phone) VALUES (?, ?)";

        return jdbcTemplate.update(
                sql,
                customer.getName(),
                customer.getPhone()
        );
    }

    public Customer searchCustomer(int id) {

        String sql = "SELECT * FROM customer WHERE id=?";

        return jdbcTemplate.queryForObject(
                sql,
                (rs, rowNum) -> new Customer(
                        rs.getInt("id"),
                        rs.getString("name"),
                        rs.getString("phone")
                ),
                id
        );
    }

    public List<Customer> getAllCustomers() {

        String sql = "SELECT * FROM customer";

        return jdbcTemplate.query(sql, (rs, rowNum) ->
                new Customer(
                        rs.getInt("id"),
                        rs.getString("name"),
                        rs.getString("phone")
                )
        );
    }
}