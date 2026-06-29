package com.kancelaria.officesystem.controller;

import com.kancelaria.officesystem.model.dto.Driver.DriverDTO;
import com.kancelaria.officesystem.model.dto.Driver.DriverLegalDTO;
import com.kancelaria.officesystem.model.dto.Driver.DriverShortDTO;
import com.kancelaria.officesystem.model.entity.Driver;
import com.kancelaria.officesystem.repository.DriverRepository;
import com.kancelaria.officesystem.service.DriverService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;


import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/office")
@RequiredArgsConstructor
public class DriverController {
    private final DriverRepository driverRepository;
    private final DriverService driverService;
    //================================================EMPLOYEE=============================================
    @GetMapping("/drivers/{id}")
    public ResponseEntity<DriverLegalDTO> getDriverForLegalDocument(@PathVariable("id") int id) {
        return driverRepository.findById(id)
                .map(driver -> DriverLegalDTO.builder()
                        .idDriver(driver.getIdDriver())
                        .name(driver.getName())
                        .surname(driver.getSurname())
                        .birthDate(driver.getBirthDate())
                        .passportNumber(driver.getPassportNumber())
                        .pesel(driver.getPesel())
                        .email(driver.getEmail())
                        .phone(driver.getPhone())
                        .address(driver.getAddress())
                        .build())
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }
    @PutMapping("/drivers/{driverId}/contacts")
    public ResponseEntity<Void> updateDriverContacts(
            @PathVariable("driverId") int driverId,
            @RequestBody Map<String, String> payload) {
        try {
            String phone = payload.get("phone");
            String address = payload.get("address");
            String email = payload.get("email");
            driverService.updateDriverContacts(driverId, phone, address, email);
            return ResponseEntity.ok().build();
        } catch (Exception e) {
            return ResponseEntity.status(500).build();
        }
    }

    @PatchMapping("/drivers/{driverId}/notes")
    public ResponseEntity<Void> updateDriverNotes(
            @PathVariable("driverId") int driverId,
            @RequestBody java.util.Map<String, String> payload) {
        try {
            String notes = payload.get("notes");
            driverService.updateDriverNotes(driverId, notes);
            return ResponseEntity.ok().build();
        } catch (Exception e) {
            return ResponseEntity.status(500).build();
        }
    }
    //==========================COMMON===============================
    @GetMapping("/drivers/short")
    public ResponseEntity<List<DriverShortDTO>> getAllDriversShort() {
        List<DriverShortDTO> dtoList = driverRepository.findAll().stream()
                .map(driver -> DriverShortDTO.builder()
                        .idDriver(driver.getIdDriver())
                        .name(driver.getName())
                        .surname(driver.getSurname())
                        .email(driver.getEmail())
                        .build())
                .collect(Collectors.toList());
        return ResponseEntity.ok(dtoList);
    }
    //==========================COMMON===============================
    //================================================ADMIN================================================
    @PostMapping("/admin/drivers")
    public ResponseEntity<DriverDTO> createDriver(@RequestBody Driver driver) {
        Driver savedDriver = driverRepository.save(driver);
        DriverDTO dto = DriverDTO.builder()
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
        return ResponseEntity.ok(dto);
    }


}
