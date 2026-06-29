package com.kancelaria.officesystem.service;

import com.kancelaria.officesystem.DTOMapper;
import com.kancelaria.officesystem.model.dto.VehicleDTO;
import com.kancelaria.officesystem.model.entity.Vehicle;
import com.kancelaria.officesystem.repository.VehicleRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.Optional;

@Service
@RequiredArgsConstructor
public class VehicleService {
    private final VehicleRepository vehicleRepository;
    private final DTOMapper dtoMapper;

    public Vehicle getOrCreateVehicle(VehicleDTO vehicleDTO) {
        String plate = vehicleDTO.getPlateNumber();

        Optional<Vehicle> existingVehicle = vehicleRepository.findById(plate);
        if (existingVehicle.isPresent()) {
            return existingVehicle.get();
        }

        Vehicle newVehicle = new Vehicle();
        newVehicle.setPlateNumber(plate);
        newVehicle.setBrand(vehicleDTO.getBrand());
        newVehicle.setModel(vehicleDTO.getModel());
        newVehicle.setColor(vehicleDTO.getColor());

        return vehicleRepository.save(newVehicle);
    }
}
