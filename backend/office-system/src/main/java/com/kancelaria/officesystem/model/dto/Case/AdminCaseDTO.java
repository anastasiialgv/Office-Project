package com.kancelaria.officesystem.model.dto.Case;
import com.kancelaria.officesystem.model.enums.CaseStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;


@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AdminCaseDTO {
    private Integer numberCase;
    private CaseStatus status;
    private LocalDate violationDate;
    private BigDecimal fineAmount;
    private String employeeName;
    private String employeeSurname;
    private Integer employeeId;
}
