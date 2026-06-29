package com.kancelaria.officesystem.model.dto.Driver;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class DriverLegalDTO {
    private Integer idDriver;
    private String name;
    private String surname;
    private LocalDate birthDate;
    private  String passportNumber;
    private  String pesel;
    private String email;
    private String phone;
    private String address;
}
