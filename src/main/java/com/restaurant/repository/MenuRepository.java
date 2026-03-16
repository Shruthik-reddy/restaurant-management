package com.restaurant.repository;

import com.restaurant.model.MenuItem;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public class MenuRepository {

    @Autowired
    private JdbcTemplate jdbcTemplate;

    public int addItem(MenuItem item) {

        String sql = "INSERT INTO menu(name, price, category_id) VALUES (?, ?, ?)";

        return jdbcTemplate.update(
                sql,
                item.getName(),
                item.getPrice(),
                item.getCategoryId()
        );
    }

    public int updatePrice(int id, double price) {

        String sql = "UPDATE menu SET price=? WHERE id=?";

        return jdbcTemplate.update(sql, price, id);
    }

    public int deleteItem(int id) {

        String sql = "DELETE FROM menu WHERE id=?";

        return jdbcTemplate.update(sql, id);
    }

    public MenuItem searchItem(String name) {

        String sql = "SELECT * FROM menu WHERE name=?";

        return jdbcTemplate.queryForObject(
                sql,
                (rs, rowNum) -> new MenuItem(
                        rs.getInt("id"),
                        rs.getString("name"),
                        rs.getDouble("price"),
                        rs.getInt("category_id")
                ),
                name
        );
    }

    public List<MenuItem> getAllItems() {

        String sql = "SELECT * FROM menu";

        return jdbcTemplate.query(sql, (rs, rowNum) ->
                new MenuItem(
                        rs.getInt("id"),
                        rs.getString("name"),
                        rs.getDouble("price"),
                        rs.getInt("category_id")
                )
        );
    }

    public List<MenuItem> sortByPrice() {

        String sql = "SELECT * FROM menu ORDER BY price";

        return jdbcTemplate.query(sql, (rs, rowNum) ->
                new MenuItem(
                        rs.getInt("id"),
                        rs.getString("name"),
                        rs.getDouble("price"),
                        rs.getInt("category_id")
                )
        );
    }

}