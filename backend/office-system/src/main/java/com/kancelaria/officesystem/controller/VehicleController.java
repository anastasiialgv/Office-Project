package com.kancelaria.officesystem.controller;

import com.kancelaria.officesystem.model.dto.VehicleDTO;
import com.kancelaria.officesystem.service.VehicleService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/office/admin/vehicles")
@RequiredArgsConstructor
public class VehicleController {
    private final VehicleService vehicleService;

    @PostMapping
    public ResponseEntity<VehicleDTO> createCar(@RequestBody VehicleDTO vehicleDTO) {
        return ResponseEntity.ok(vehicleService.createVehicle(vehicleDTO));
    }

    @GetMapping
    public ResponseEntity<List<VehicleDTO>> getAllCars() {
        return ResponseEntity.ok(vehicleService.getAllVehicles());
    }

}
