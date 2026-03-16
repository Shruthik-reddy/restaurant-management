package com.restaurant.controller;

import com.restaurant.model.MenuItem;
import com.restaurant.service.MenuService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;
@CrossOrigin(origins="*")
@RestController
@RequestMapping("/menu")
public class MenuController {

    @Autowired
    private MenuService menuService;

    @PostMapping("/add")
    public int addItem(@RequestBody MenuItem item) {
        return menuService.addItem(item);
    }

    @PutMapping("/updatePrice/{id}/{price}")
    public int updatePrice(@PathVariable int id, @PathVariable double price) {
        return menuService.updatePrice(id, price);
    }

    @DeleteMapping("/delete/{id}")
    public int deleteItem(@PathVariable int id) {
        return menuService.deleteItem(id);
    }

    @GetMapping("/search/{name}")
    public MenuItem searchItem(@PathVariable String name) {
        return menuService.searchItem(name);
    }

    @GetMapping("/all")
    public List<MenuItem> displayMenu() {
        return menuService.displayMenu();
    }

    @GetMapping("/sort")
    public List<MenuItem> sortMenu() {
        return menuService.sortMenuByPrice();
    }
}