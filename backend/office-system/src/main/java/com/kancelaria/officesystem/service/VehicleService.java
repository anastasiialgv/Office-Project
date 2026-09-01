package com.kancelaria.officesystem.service;

import com.kancelaria.officesystem.model.dto.VehicleDTO;
import com.kancelaria.officesystem.model.entity.Driver;
import com.kancelaria.officesystem.model.entity.Vehicle;
import com.kancelaria.officesystem.repository.DriverRepository;
import com.kancelaria.officesystem.repository.VehicleRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class VehicleService {
    private final VehicleRepository vehicleRepository;
    private final DriverRepository driverRepository;

    @Transactional
    public VehicleDTO createVehicle(VehicleDTO vehicleDTO) {
        Driver driver = driverRepository.findById(vehicleDTO.getIdDriver())
                .orElseThrow(() -> new RuntimeException("Driver not found with ID: " + vehicleDTO.getIdDriver()));

        Vehicle vehicle = Vehicle.builder()
                .plateNumber(vehicleDTO.getPlateNumber().trim())
                .brand(vehicleDTO.getBrand())
                .model(vehicleDTO.getModel())
                .color(vehicleDTO.getColor())
                .driver(driver)
                .build();

        Vehicle savedVehicle = vehicleRepository.save(vehicle);

        return VehicleDTO.builder()
                .plateNumber(savedVehicle.getPlateNumber())
                .model(savedVehicle.getModel())
                .brand(savedVehicle.getBrand())
                .color(savedVehicle.getColor())
                .idDriver(savedVehicle.getDriver().getIdDriver())
                .build();
    }

    @Transactional(readOnly = true)
    public List<VehicleDTO> getAllVehicles() {
        return vehicleRepository.findAll().stream()
                .map(vehicle -> VehicleDTO.builder()
                        .plateNumber(vehicle.getPlateNumber())
                        .model(vehicle.getModel())
                        .brand(vehicle.getBrand())
                        .color(vehicle.getColor())
                        .idDriver(vehicle.getDriver() != null ? vehicle.getDriver().getIdDriver() : null)
                        .build())
                .collect(Collectors.toList());
    }

}
