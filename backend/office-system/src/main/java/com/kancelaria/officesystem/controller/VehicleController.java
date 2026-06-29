package com.kancelaria.officesystem.controller;

import com.kancelaria.officesystem.model.dto.VehicleDTO;
import com.kancelaria.officesystem.model.entity.Driver;
import com.kancelaria.officesystem.model.entity.Vehicle;
import com.kancelaria.officesystem.repository.VehicleRepository;
import com.kancelaria.officesystem.repository.DriverRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/office/admin/vehicles")
@RequiredArgsConstructor
public class VehicleController {
    private final VehicleRepository vehicleRepository;
    private final DriverRepository driverRepository;

    @PostMapping
    public ResponseEntity<VehicleDTO> createCar(@RequestBody VehicleDTO vehicleDTO) { // Принимаем VehicleDTO!

        // 1. Безопасно достаем idDriver из DTO и ищем водителя в базе данных
        Driver driver = driverRepository.findById(vehicleDTO.getIdDriver())
                .orElseThrow(() -> new RuntimeException("Driver not found with ID: " + vehicleDTO.getIdDriver()));

        // 2. Вручную собираем полноценный объект Vehicle для Hibernate
        Vehicle vehicle = Vehicle.builder()
                .plateNumber(vehicleDTO.getPlateNumber().trim())
                .brand(vehicleDTO.getBrand())
                .model(vehicleDTO.getModel())
                .color(vehicleDTO.getColor())
                .driver(driver) // Подставляем найденный реальный объект Driver
                .build();

        // 3. Сохраняем готовую машину в базу данных
        Vehicle savedVehicle = vehicleRepository.save(vehicle);

        // 4. Возвращаем чистый DTO обратно на фронтенд
        VehicleDTO dto = VehicleDTO.builder()
                .plateNumber(savedVehicle.getPlateNumber())
                .model(savedVehicle.getModel())
                .brand(savedVehicle.getBrand())
                .color(savedVehicle.getColor())
                .idDriver(savedVehicle.getDriver().getIdDriver())
                .build();

        return ResponseEntity.ok(dto);
    }

    // Получение ВСЕХ машин (Обязательно превращаем список в DTO)
    @GetMapping
    public ResponseEntity<List<VehicleDTO>> getAllCars() {
        List<VehicleDTO> dtoList = vehicleRepository.findAll().stream()
                .map(vehicle -> VehicleDTO.builder()
                        .plateNumber(vehicle.getPlateNumber())
                        .model(vehicle.getModel())
                        .brand(vehicle.getBrand())
                        .color(vehicle.getColor())
                        .idDriver(vehicle.getDriver() != null ? vehicle.getDriver().getIdDriver() : null)
                        .build())
                .collect(Collectors.toList());

        return ResponseEntity.ok(dtoList);
    }

}
