package com.kancelaria.officesystem.repository;

import com.kancelaria.officesystem.model.entity.Vehicle;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface VehicleRepository extends JpaRepository<Vehicle, String> {
    boolean existsByPlateNumber(String plateNumber);
}
