package com.kancelaria.officesystem.repository;

import com.kancelaria.officesystem.model.entity.Contact;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ContactRepository extends JpaRepository<Contact, Integer> {
    List<Contact> findByLawCase_NumberCase(Integer numberCase);
    List<Contact> findByLawCase_Employee_UserId(Integer userId);
}
