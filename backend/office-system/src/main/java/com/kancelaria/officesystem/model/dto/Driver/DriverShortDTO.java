package com.kancelaria.officesystem.model.dto.Driver;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class DriverShortDTO {
    private Integer idDriver;
    private String name;
    private String surname;
    private String email;
}
