package com.kancelaria.officesystem.model.dto.Case;

import java.math.BigDecimal;
import com.kancelaria.officesystem.model.enums.CaseStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PublicCaseDTO {
    String plateNumber;
    BigDecimal fineAmount;
    CaseStatus status;
}
