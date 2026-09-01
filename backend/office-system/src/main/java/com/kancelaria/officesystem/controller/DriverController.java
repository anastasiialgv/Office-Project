package com.kancelaria.officesystem.controller;

import com.kancelaria.officesystem.model.dto.Driver.DriverDTO;
import com.kancelaria.officesystem.model.dto.Driver.DriverLegalDTO;
import com.kancelaria.officesystem.model.dto.Driver.DriverShortDTO;
import com.kancelaria.officesystem.model.entity.Driver;
import com.kancelaria.officesystem.service.DriverService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;


import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/office")
@RequiredArgsConstructor
public class DriverController {
    private final DriverService driverService;
    //================================================EMPLOYEE=============================================
    @GetMapping("/drivers/{id}")
    public ResponseEntity<DriverLegalDTO> getDriverForLegalDocument(@PathVariable("id") int id) {
        return driverService.getDriverForLegalDocument(id)
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
            @RequestBody Map<String, String> payload) {
        try {
            String notes = payload.get("notes");
            driverService.updateDriverNotes(driverId, notes);
            return ResponseEntity.ok().build();
        } catch (Exception e) {
            return ResponseEntity.status(500).build();
        }
    }

    //================================================ADMIN================================================
    @PostMapping("/admin/drivers")
    public ResponseEntity<DriverDTO> createDriver(@RequestBody Driver driver) {
        DriverDTO dto = driverService.createDriver(driver);
        return ResponseEntity.ok(dto);
    }
    //================================================ADMIN================================================

    //==========================BOTH===============================
    @GetMapping("/drivers/short")
    public ResponseEntity<List<DriverShortDTO>> getAllDriversShort() {
        return ResponseEntity.ok(driverService.getAllDriversShort());
    }
    //==========================BOTH===============================
}
