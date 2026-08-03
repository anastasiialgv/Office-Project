package com.kancelaria.officesystem.service;


import com.kancelaria.officesystem.model.entity.Driver;
import com.kancelaria.officesystem.repository.DriverRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;


@Service
@RequiredArgsConstructor
public class DriverService {
    private final DriverRepository driverRepository;
    @Transactional
    public void updateDriverContacts(Integer driverId, String phone, String address, String email) {
        Driver driver = driverRepository.findById(driverId)
                .orElseThrow(() -> new RuntimeException("Driver not found"));  
    }

    @Transactional
    public void updateDriverNotes(Integer driverId, String notes) {
        Driver driver = driverRepository.findById(driverId)
                .orElseThrow(() -> new RuntimeException("Driver not found"));
        driver.setNotes(notes);
        driverRepository.save(driver);
    }
    
}
