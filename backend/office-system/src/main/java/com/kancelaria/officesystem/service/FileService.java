package com.kancelaria.officesystem.service;

import com.kancelaria.officesystem.DTOMapper;
import com.kancelaria.officesystem.model.dto.File.FileCaseDTO;
import com.kancelaria.officesystem.model.dto.File.FileDTO;
import com.kancelaria.officesystem.model.entity.Case;
import com.kancelaria.officesystem.model.entity.File;
import com.kancelaria.officesystem.model.enums.FileType;
import com.kancelaria.officesystem.repository.CaseRepository;
import com.kancelaria.officesystem.repository.FileRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.time.LocalDate;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class FileService {
    private final FileRepository fileRepository;
    private final CaseRepository caseRepository;
    private final DTOMapper dtoMapper;
    //#########-------------7-------------#########//
    public List<FileCaseDTO> getFilesByCaseId(Integer caseId) {
        return fileRepository.findByLawCase_NumberCase(caseId)
                .stream()
                .map(dtoMapper::mapToFileCaseDTO)
                .collect(Collectors.toList());
    }

    //#########-------------10-------------#########//
    public List<FileDTO> getFilesByEmployeeId(Integer userId) {
        return fileRepository.findByLawCase_Employee_UserId(userId)
                .stream()
                .map(dtoMapper::mapToFileDTO)
                .collect(Collectors.toList());
    }

    //#########-------------13-------------#########//
    public FileDTO getFileById(Integer fileId) {
        File file = fileRepository.findById(fileId)
                .orElseThrow(() -> new RuntimeException("File not found"));
        return dtoMapper.mapToFileDTO(file);
    }

    public void uploadPaymentProof(Integer caseId, MultipartFile fileData) throws IOException {
        Case lawCase = caseRepository.findById(caseId)
                .orElseThrow(() -> new RuntimeException("Case not found"));

        File fileEntity = new File();
        fileEntity.setLawCase(lawCase);
        fileEntity.setFileType(FileType.PAYMENT_CONFIRMATION);
        fileEntity.setUploadedAt(LocalDate.now());
        String fileName = fileData.getOriginalFilename();
        fileEntity.setFilePath("/uploads/" + fileName);

        fileRepository.save(fileEntity);
    }
}
