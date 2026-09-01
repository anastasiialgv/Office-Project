package com.kancelaria.officesystem.service;


import com.kancelaria.officesystem.DTOMapper;
import com.kancelaria.officesystem.model.dto.Driver.DriverDTO;
import com.kancelaria.officesystem.model.dto.Driver.DriverLegalDTO;
import com.kancelaria.officesystem.model.dto.Driver.DriverShortDTO;
import com.kancelaria.officesystem.model.entity.Driver;
import com.kancelaria.officesystem.repository.DriverRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;


@Service
@RequiredArgsConstructor
public class DriverService {
    private final DriverRepository driverRepository;
    private DTOMapper dtoMapper;

    @Transactional
    public void updateDriverContacts(Integer driverId, String phone, String address, String email) {
        Driver driver = driverRepository.findById(driverId)
                .orElseThrow(() -> new RuntimeException("Driver not found"));
        driver.setPhone(phone);
        driver.setAddress(address);
        driver.setEmail(email);
        driverRepository.save(driver);

    }

    @Transactional
    public void updateDriverNotes(Integer driverId, String notes) {
        Driver driver = driverRepository.findById(driverId)
                .orElseThrow(() -> new RuntimeException("Driver not found"));
        driver.setNotes(notes);
        driverRepository.save(driver);
    }

    @Transactional(readOnly = true)
    public Optional<DriverLegalDTO> getDriverForLegalDocument(int id) {
        return driverRepository.findById(id)
                .map(dtoMapper::mapToDriverLegalDTO);
    }

    @Transactional
    public DriverDTO createDriver(Driver driver) {
        Driver savedDriver = driverRepository.save(driver);
        return DriverDTO.builder()
                .idDriver(savedDriver.getIdDriver())
                .name(savedDriver.getSurname())
                .birthDate(savedDriver.getBirthDate())
                .passportNumber(driver.getPassportNumber())
                .pesel(savedDriver.getPesel())
                .email(savedDriver.getEmail())
                .phone(savedDriver.getPhone())
                .address(savedDriver.getAddress())
                .notes(savedDriver.getNotes())
                .build();
    }

    @Transactional(readOnly = true)
    public List<DriverShortDTO> getAllDriversShort() {
        return driverRepository.findAll().stream()
                .map(dtoMapper::mapToDriverShortDTO)
                .collect(Collectors.toList());
    }
    
}
