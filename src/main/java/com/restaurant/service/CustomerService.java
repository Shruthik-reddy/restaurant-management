package com.restaurant.service;

import com.restaurant.model.Customer;
import com.restaurant.repository.CustomerRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class CustomerService {

    @Autowired
    private CustomerRepository customerRepository;

    public int addCustomer(Customer customer) {
        return customerRepository.addCustomer(customer);
    }

    public Customer searchCustomer(int id) {
        return customerRepository.searchCustomer(id);
    }

    public List<Customer> getAllCustomers() {
        return customerRepository.getAllCustomers();
    }
}