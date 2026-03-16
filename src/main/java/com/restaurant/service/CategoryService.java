package com.restaurant.service;

import com.restaurant.model.Category;
import com.restaurant.repository.CategoryRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class CategoryService {

    @Autowired
    private CategoryRepository categoryRepository;

    public int addCategory(Category category) {
        return categoryRepository.addCategory(category);
    }

    public List<Category> getAllCategories() {
        return categoryRepository.getAllCategories();
    }

    public int deleteCategory(int id) {
        return categoryRepository.deleteCategory(id);
    }
}