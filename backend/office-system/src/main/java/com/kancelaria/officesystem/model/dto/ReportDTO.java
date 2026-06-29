package com.kancelaria.officesystem.model.dto;

import com.kancelaria.officesystem.model.enums.ReportType;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ReportDTO {
    private Integer reportId;
    private LocalDate generatedAt;
    private ReportType reportType;
    private String filePath;
    private Integer userId;
}
