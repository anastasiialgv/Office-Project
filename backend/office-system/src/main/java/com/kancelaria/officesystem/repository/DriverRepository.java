package com.kancelaria.officesystem.repository;

import com.kancelaria.officesystem.model.entity.Driver;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface DriverRepository extends JpaRepository<Driver, Integer> {
    boolean existsByPesel(String pesel);
    boolean existsByPassportNumber(String passportNumber);
    Optional<Driver> findByPassportNumber(String PassportNumber);
}
