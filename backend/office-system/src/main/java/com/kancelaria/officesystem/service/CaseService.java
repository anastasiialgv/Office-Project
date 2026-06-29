package com.kancelaria.officesystem.service;

import com.kancelaria.officesystem.DTOMapper;
import com.kancelaria.officesystem.model.dto.Case.AdminCaseDTO;
import com.kancelaria.officesystem.model.dto.Case.CaseDTO;
import com.kancelaria.officesystem.model.dto.Case.EmployeeCaseDetailDTO;
import com.kancelaria.officesystem.model.dto.Case.EmployeeListCaseDTO;
import com.kancelaria.officesystem.model.entity.Case;
import com.kancelaria.officesystem.model.entity.File;
import com.kancelaria.officesystem.model.entity.User;
import com.kancelaria.officesystem.model.enums.CaseStatus;
import com.kancelaria.officesystem.model.enums.FileType;
import com.kancelaria.officesystem.repository.CaseRepository;
import com.kancelaria.officesystem.repository.FileRepository;
import com.kancelaria.officesystem.repository.UserRepository;
import org.springframework.transaction.annotation.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class CaseService {
    private final CaseRepository caseRepository;
    private final UserRepository userRepository;
    private final FileRepository fileRepository;
    private final DTOMapper dtoMapper;
//====================================EMPLOYEE====================================
    public List<EmployeeListCaseDTO> getCasesByEmployee(String email){
        User employee = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Employee not found with email: " + email));

        return caseRepository.findCasesByEmployeeId(employee.getUserId());
    }

    @Transactional(readOnly = true)
    public EmployeeCaseDetailDTO getCaseDetails(Integer caseId) {
        List<File> paymentFiles = fileRepository.findByLawCase_NumberCaseAndFileType(caseId, FileType.PAYMENT_CONFIRMATION);
        File paymentProof = paymentFiles.isEmpty() ? null : paymentFiles.get(0);

        List<File> violationFiles = fileRepository.findByLawCase_NumberCaseAndFileType(caseId, FileType.PHOTOGRAPH_OF_INCIDENT);
        File photo = violationFiles.isEmpty() ? null : violationFiles.get(0);

        Case lawCase = caseRepository.findById(caseId)
                .orElseThrow(() -> new RuntimeException("Case not found"));

        return EmployeeCaseDetailDTO.builder()
                .numberCase(lawCase.getNumberCase())
                .status(lawCase.getStatus())
                .violationDate(lawCase.getViolationDate())
                .fineAmount(lawCase.getFineAmount())
                .address(lawCase.getAddress())
                .overdueCount(lawCase.getOverdueCount())
                .driver(dtoMapper.mapToDriverDTO(lawCase.getDriver()))
                .vehicle(dtoMapper.mapToVehicleDTO(lawCase.getVehicle()))
                .isPaymentProofUploaded(paymentProof != null)
                .paymentProofFileId(paymentProof != null ? paymentProof.getFileId() : null)
                .paymentProofDownloadUrl(paymentProof != null
                        ? "/office/cases/files/download/" + paymentProof.getFileId()
                        : null)
                .photoUrl(photo != null ? photo.getFilePath() : null)
                .build();
    }

    @Transactional
    public void updateStatus(Integer caseId, CaseStatus newStatus) {
        Case lawCase = caseRepository.findById(caseId)
                .orElseThrow(() -> new RuntimeException("Case not found"));
        lawCase.setStatus(newStatus);
        caseRepository.save(lawCase);
    }


    //====================================EMPLOYEE===============================

    //===================================ADMIN===================================
    public List<AdminCaseDTO> getAllCases(){
        return caseRepository.findAll()
                .stream()
                .map(dtoMapper::mapToAdminCaseDTO)
                .collect(Collectors.toList());
    }

    @Transactional
    public void assignEmployeeToCase(Integer caseId, Integer employeeId) {
        // Ищем дело в базе данных
        Case legalCase = caseRepository.findById(caseId)
                .orElseThrow(() -> new RuntimeException("Case not found with id: " + caseId));

        if (employeeId == null) {
            legalCase.setEmployee(null);
            legalCase.setStatus(CaseStatus.REGISTERED);
        } else {
            User employee = userRepository.findById(employeeId)
                    .orElseThrow(() -> new RuntimeException("Employee not found with id: " + employeeId));

            legalCase.setEmployee(employee);
            legalCase.setStatus(CaseStatus.WAITING_FOR_CONTACT); // Автоматически меняем статус на "В процессе"
        }

        // Сохраняем обновленное дело
        caseRepository.save(legalCase);
    }

    /**
     * 2. Архивировать дело (Archive)
     */
    @Transactional
    public void archiveCase(Integer caseId, String closedDateStr) {
        Case legalCase = caseRepository.findById(caseId)
                .orElseThrow(() -> new RuntimeException("Case not found with id: " + caseId));

        legalCase.setStatus(CaseStatus.ARCHIVED);

        if (closedDateStr != null && !closedDateStr.isEmpty()) {
            LocalDate closedDate = LocalDate.parse(closedDateStr, DateTimeFormatter.ISO_LOCAL_DATE);
            legalCase.setClosedDate(closedDate);
        } else {
            legalCase.setClosedDate(LocalDate.now());
        }

        caseRepository.save(legalCase);
    }

    //===================================ADMIN===================================

}
