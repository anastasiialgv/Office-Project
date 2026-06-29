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
public class CaseDTO {
    private Integer numberCase;
    private CaseStatus status;
    private LocalDate violationDate;
    private BigDecimal fineAmount;
    private Integer overdueCount;
    private String address;
    private LocalDate closedDate;
    private Integer userId;
    private String plateNumber;
    private Integer driverId;
}
