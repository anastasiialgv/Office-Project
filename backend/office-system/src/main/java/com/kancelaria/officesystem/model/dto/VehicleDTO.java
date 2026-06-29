package com.kancelaria.officesystem.model.dto;


import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class VehicleDTO {
    private String plateNumber;
    private String brand;
    private String model;
    private String color;
    private Integer idDriver;
}
