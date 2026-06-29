package com.kancelaria.officesystem.model.dto.Case;

import com.kancelaria.officesystem.model.enums.CaseStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class EmployeeListCaseDTO {
    private Integer numberCase;
    private CaseStatus status;
    private LocalDate violationDate;
    private String driverName;
    private String driverSurname;
}
