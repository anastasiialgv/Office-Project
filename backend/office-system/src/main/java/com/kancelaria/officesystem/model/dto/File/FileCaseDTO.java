package com.kancelaria.officesystem.model.dto.File;

import com.kancelaria.officesystem.model.enums.FileType;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class FileCaseDTO {
    private Integer fileId;
    private FileType fileType;
    private LocalDate uploadedAt;
}
