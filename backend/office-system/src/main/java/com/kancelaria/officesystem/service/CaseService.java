package com.kancelaria.officesystem.service;

import com.kancelaria.officesystem.DTOMapper;
import com.kancelaria.officesystem.model.dto.Case.AdminCaseDTO;
import com.kancelaria.officesystem.model.dto.Case.EmployeeCaseDetailDTO;
import com.kancelaria.officesystem.model.dto.Case.EmployeeListCaseDTO;
import com.kancelaria.officesystem.model.dto.Case.PublicCaseDTO;
import com.kancelaria.officesystem.model.entity.*;
import com.kancelaria.officesystem.model.enums.CaseStatus;
import com.kancelaria.officesystem.model.enums.ContactType;
import com.kancelaria.officesystem.model.enums.FileType;
import com.kancelaria.officesystem.repository.*;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.transaction.annotation.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.math.BigDecimal;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class CaseService {
    private final CaseRepository caseRepository;
    private final UserRepository userRepository;
    private final DriverRepository driverRepository;
    private final VehicleRepository vehicleRepository;
    private final ContactRepository contactRepository;
    private final FileRepository fileRepository;
    private final EmailService emailService;
    private final DTOMapper dtoMapper;

    @Value("${app.upload-dir}")
    private String uploadDir;

    //====================================EMPLOYEE====================================
    @Transactional(readOnly = true)
    public List<EmployeeListCaseDTO> getCasesByEmployee(String email) {
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
    public void addPenalty(Integer caseId, BigDecimal amount, String reason) {
        Case foundCase = caseRepository.findById(caseId)
                .orElseThrow(() -> new RuntimeException("Case not found"));

        foundCase.setFineAmount(foundCase.getFineAmount().add(amount));
        caseRepository.save(foundCase);

        Contact log = Contact.builder()
                .contactDate(LocalDateTime.now())
                .contactType(ContactType.PHONE)
                .result("Additional penalty applied: " + amount + " PLN. Reason: " + reason)
                .lawCase(foundCase)
                .build();
        contactRepository.save(log);

        emailService.sendPenaltyIncreasedNotification(
                foundCase.getDriver().getEmail(),
                foundCase.getDriver().getName(),
                amount,
                foundCase.getFineAmount(),
                foundCase.getNumberCase()
        );
    }

    @Transactional
    public void uploadPaymentProof(Integer caseId, MultipartFile file, String employeeEmail) throws IOException {
        User employee = userRepository.findByEmail(employeeEmail)
                .orElseThrow(() -> new RuntimeException("Logged in user not found in database"));

        Case lawCase = caseRepository.findById(caseId)
                .orElseThrow(() -> new RuntimeException("Case not found"));

        Path uploadPath = Paths.get(uploadDir, "payments");
        if (!Files.exists(uploadPath)) {
            Files.createDirectories(uploadPath);
        }

        String originalFileName = file.getOriginalFilename();
        String cleanFileName = originalFileName != null ? originalFileName.replaceAll("[^a-zA-Z0-9.]", "_") : "file";
        String uniqueFileName = caseId + "_payment_" + System.currentTimeMillis() + "_" + cleanFileName;
        Path filePath = uploadPath.resolve(uniqueFileName);

        Files.copy(file.getInputStream(), filePath, StandardCopyOption.REPLACE_EXISTING);
        String webUrlPath = "/uploads/payments/" + uniqueFileName;

        File dbFile = new File();
        dbFile.setLawCase(lawCase);
        dbFile.setGeneratedBy(employee);
        dbFile.setFilePath(webUrlPath);
        dbFile.setFileType(FileType.PAYMENT_CONFIRMATION);
        dbFile.setUploadedAt(LocalDate.now());

        fileRepository.save(dbFile);

        lawCase.setStatus(CaseStatus.CLOSED);
        lawCase.setClosedDate(LocalDate.now());
    }
    //====================================EMPLOYEE===============================

    //===================================ADMIN===================================
    @Transactional(readOnly = true)
    public List<AdminCaseDTO> getAllCases() {
        return caseRepository.findAllWithRelations()
                .stream()
                .map(dtoMapper::mapToAdminCaseDTO)
                .collect(Collectors.toList());
    }

    @Transactional
    public void assignEmployeeToCase(Integer caseId, Integer employeeId) {
        Case legalCase = caseRepository.findById(caseId)
                .orElseThrow(() -> new RuntimeException("Case not found with id: " + caseId));

        if (employeeId == null) {
            legalCase.setEmployee(null);
            legalCase.setStatus(CaseStatus.REGISTERED);
        } else {
            User employee = userRepository.findById(employeeId)
                    .orElseThrow(() -> new RuntimeException("Employee not found with id: " + employeeId));

            legalCase.setEmployee(employee);
            legalCase.setStatus(CaseStatus.WAITING_FOR_CONTACT);
        }

        caseRepository.save(legalCase);
    }

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

    @Transactional
    public Case createCase(Integer idDriver, String plateNumber, String address, String violationDateStr,
                           String fineAmountStr, MultipartFile photo, String adminEmail) throws IOException {
        Driver driver = driverRepository.findById(idDriver)
                .orElseThrow(() -> new RuntimeException("Driver not found with ID: " + idDriver));

        Vehicle vehicle = vehicleRepository.findById(plateNumber)
                .orElseThrow(() -> new RuntimeException("Vehicle not found with Plate: " + plateNumber));

        BigDecimal fineAmount = new BigDecimal(fineAmountStr);

        Case newCase = Case.builder()
                .status(CaseStatus.REGISTERED)
                .violationDate(LocalDate.parse(violationDateStr))
                .fineAmount(fineAmount)
                .address(address)
                .overdueCount(0)
                .driver(driver)
                .vehicle(vehicle)
                .employee(null)
                .build();

        Case savedCase = caseRepository.save(newCase);

        emailService.sendNewCaseNotification(
                savedCase.getDriver().getEmail(),
                savedCase.getDriver().getName(),
                savedCase.getVehicle().getPlateNumber(),
                savedCase.getFineAmount(),
                savedCase.getNumberCase()
        );

        if (photo != null && !photo.isEmpty()) {
            saveIncidentPhoto(savedCase, photo, adminEmail);
        }

        return savedCase;
    }

    @Transactional
    public int importCases(List<Map<String, Object>> payloadList, String adminEmail) {
        int importedCount = 0;

        for (Map<String, Object> item : payloadList) {
            Map<String, Object> driverMap = (Map<String, Object>) item.get("driver");
            String passportNumber = (String) driverMap.get("passportNumber");

            Driver driver = driverRepository.findByPassportNumber(passportNumber)
                    .orElseGet(() -> {
                        Driver newDriver = Driver.builder()
                                .name((String) driverMap.get("name"))
                                .surname((String) driverMap.get("surname"))
                                .passportNumber(passportNumber)
                                .pesel((String) driverMap.get("pesel"))
                                .phone((String) driverMap.get("phone"))
                                .email((String) driverMap.get("email"))
                                .birthDate(LocalDate.parse((String) driverMap.get("birthDate")))
                                .notes("Imported automatically via JSON")
                                .build();
                        return driverRepository.save(newDriver);
                    });

            Map<String, Object> vehicleMap = (Map<String, Object>) item.get("vehicle");
            String plateNumber = (String) vehicleMap.get("plateNumber");

            Vehicle vehicle = vehicleRepository.findById(plateNumber)
                    .orElseGet(() -> {
                        Vehicle newVehicle = Vehicle.builder()
                                .plateNumber(plateNumber)
                                .brand((String) vehicleMap.get("brand"))
                                .model((String) vehicleMap.get("model"))
                                .color((String) vehicleMap.get("color"))
                                .driver(driver)
                                .build();
                        return vehicleRepository.save(newVehicle);
                    });

            String violationDateStr = (String) item.get("violationDate");
            BigDecimal fineAmount = new BigDecimal(item.get("fineAmount").toString());
            String address = (String) item.get("address");

            Case newCase = Case.builder()
                    .status(CaseStatus.REGISTERED)
                    .violationDate(LocalDate.parse(violationDateStr))
                    .fineAmount(fineAmount)
                    .address(address)
                    .overdueCount(0)
                    .driver(driver)
                    .vehicle(vehicle)
                    .employee(null)
                    .build();

            Case savedCase = caseRepository.save(newCase);

            emailService.sendNewCaseNotification(
                    savedCase.getDriver().getEmail(),
                    savedCase.getDriver().getName(),
                    savedCase.getVehicle().getPlateNumber(),
                    savedCase.getFineAmount(),
                    savedCase.getNumberCase()
            );

            if (item.containsKey("file") && item.get("file") != null) {
                Map<String, Object> fileMap = (Map<String, Object>) item.get("file");
                String filePath = (String) fileMap.get("filePath");
                String fileTypeStr = (String) fileMap.get("fileType");

                if (filePath != null && !filePath.trim().isEmpty()) {
                    FileType type = fileTypeStr != null ? FileType.valueOf(fileTypeStr) : FileType.PHOTOGRAPH_OF_INCIDENT;

                    User currentAdmin = userRepository.findByEmail(adminEmail)
                            .orElseThrow(() -> new RuntimeException("Current authenticated admin not found in database"));

                    File file = File.builder()
                            .fileType(type)
                            .uploadedAt(LocalDate.now())
                            .filePath(filePath)
                            .lawCase(savedCase)
                            .generatedBy(currentAdmin)
                            .build();

                    fileRepository.save(file);
                }
            }

            importedCount++;
        }

        return importedCount;
    }

    private void saveIncidentPhoto(Case savedCase, MultipartFile photo, String adminEmail) throws IOException {
        Path dir = Paths.get(uploadDir, "photos");
        if (!Files.exists(dir)) {
            Files.createDirectories(dir);
        }

        String originalFilename = photo.getOriginalFilename();
        String extension = originalFilename != null && originalFilename.contains(".")
                ? originalFilename.substring(originalFilename.lastIndexOf(".")) : ".jpg";

        String newFileName = "photo_" + savedCase.getNumberCase() + extension;
        Path path = dir.resolve(newFileName);
        Files.write(path, photo.getBytes());

        String savedFilePath = "/uploads/photos/" + newFileName;

        User currentAdmin = userRepository.findByEmail(adminEmail)
                .orElseThrow(() -> new RuntimeException("Current authenticated admin not found in database"));

        File file = File.builder()
                .fileType(FileType.PHOTOGRAPH_OF_INCIDENT)
                .uploadedAt(LocalDate.now())
                .filePath(savedFilePath)
                .lawCase(savedCase)
                .generatedBy(currentAdmin)
                .build();

        fileRepository.save(file);
    }
    //===================================ADMIN===================================

    // ==========================================DRIVER==========================================
    @Transactional(readOnly = true)
    public PublicCaseDTO getPublicCaseInfo(Integer caseId) {
        Case caseEntity = caseRepository.findById(caseId)
                .orElseThrow(() -> new RuntimeException("Case not found"));

        return PublicCaseDTO.builder()
                .fineAmount(caseEntity.getFineAmount())
                .plateNumber(caseEntity.getVehicle().getPlateNumber())
                .status(caseEntity.getStatus())
                .build();
    }
    // ==========================================DRIVER==========================================

}
