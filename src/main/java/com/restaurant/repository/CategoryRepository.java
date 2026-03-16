package com.restaurant.repository;

import com.restaurant.model.Category;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public class CategoryRepository {

    @Autowired
    private JdbcTemplate jdbcTemplate;

    public int addCategory(Category category) {

        String sql = "INSERT INTO category(name) VALUES(?)";

        return jdbcTemplate.update(sql, category.getName());
    }

    public List<Category> getAllCategories() {

        String sql = "SELECT * FROM category";

        return jdbcTemplate.query(sql, (rs, rowNum) ->
                new Category(
                        rs.getInt("id"),
                        rs.getString("name")
                )
        );
    }

    public int deleteCategory(int id) {

        String sql = "DELETE FROM category WHERE id=?";

        return jdbcTemplate.update(sql, id);
    }
}