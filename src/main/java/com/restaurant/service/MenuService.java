package com.restaurant.service;

import com.restaurant.model.MenuItem;
import com.restaurant.repository.MenuRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class MenuService {

    @Autowired
    private MenuRepository menuRepository;

    public int addItem(MenuItem item) {
        return menuRepository.addItem(item);
    }

    public int updatePrice(int id, double price) {
        return menuRepository.updatePrice(id, price);
    }

    public int deleteItem(int id) {
        return menuRepository.deleteItem(id);
    }

    public MenuItem searchItem(String name) {
        return menuRepository.searchItem(name);
    }

    public List<MenuItem> displayMenu() {
        return menuRepository.getAllItems();
    }

    public List<MenuItem> sortMenuByPrice() {
        return menuRepository.sortByPrice();
    }
}