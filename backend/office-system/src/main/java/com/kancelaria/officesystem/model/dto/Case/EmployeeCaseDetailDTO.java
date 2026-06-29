package com.kancelaria.officesystem.model.dto.Case;

import com.kancelaria.officesystem.model.dto.Driver.DriverDTO;
import com.kancelaria.officesystem.model.dto.VehicleDTO;
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
public class EmployeeCaseDetailDTO {
    // --- Case infotmation ---
    private Integer numberCase;
    private CaseStatus status;
    private LocalDate violationDate;
    private BigDecimal fineAmount;
    private String address;
    private Integer overdueCount;

    // --- Driver and vehicle information ---
    private DriverDTO driver;
    private VehicleDTO vehicle;

    // --- Payment Proof ---
    private boolean isPaymentProofUploaded;
    private String paymentProofDownloadUrl;
    private Integer paymentProofFileId;

    // --- Photo ----
    private String photoUrl;
}
