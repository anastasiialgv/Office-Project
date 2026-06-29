package com.kancelaria.officesystem.controller;

import com.kancelaria.officesystem.model.dto.Case.AdminCaseDTO;
import com.kancelaria.officesystem.model.dto.Case.EmployeeCaseDetailDTO;
import com.kancelaria.officesystem.model.dto.Case.EmployeeListCaseDTO;
import com.kancelaria.officesystem.model.entity.*;
import com.kancelaria.officesystem.model.enums.CaseStatus;
import com.kancelaria.officesystem.model.enums.ContactType;
import com.kancelaria.officesystem.model.enums.FileType;
import com.kancelaria.officesystem.repository.*;
import com.kancelaria.officesystem.service.CaseService;
import com.kancelaria.officesystem.service.EmailService;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.math.BigDecimal;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.security.Principal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.nio.file.StandardCopyOption;
import java.util.*;

@RestController
@RequiredArgsConstructor
@RequestMapping("/office")
public class CaseController {
    private final CaseService caseService;
    private final CaseRepository caseRepository;
    private final ContactRepository contactRepository;
    private final DriverRepository driverRepository;
    private final VehicleRepository vehicleRepository;
    private final FileRepository fileRepository;
    private final UserRepository userRepository;
    private final EmailService emailService;
//==========================================EMPLOYEE==========================================
    @GetMapping("/cases")
    public ResponseEntity<List<EmployeeListCaseDTO>> getCasesByEmployee(
            @org.springframework.security.core.annotation.AuthenticationPrincipal String email){
        try {
            List<EmployeeListCaseDTO> cases =
                    caseService.getCasesByEmployee(email);

            return ResponseEntity.ok(cases);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(500).build();
        }
    }

    @GetMapping("/cases/{caseId}")
    public ResponseEntity<EmployeeCaseDetailDTO> getCase(@PathVariable("caseId") int caseId) {
        return ResponseEntity.ok(caseService.getCaseDetails(caseId));
    }

    @PatchMapping("/cases/{caseId}/addPenalty")
    @Transactional
    public ResponseEntity<?> addPenalty(@PathVariable("caseId") int caseId,
                                        @RequestParam BigDecimal amount,
                                        @RequestParam String reason){

        Case foundCase = caseRepository.findById(caseId).orElseThrow(() -> new RuntimeException("Case not found"));
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
                foundCase.getFineAmount()
        );

        return ResponseEntity.ok("Penalty increased by " + amount + ". History record added.");
    }


    @PostMapping("/cases/{caseId}/payment-proof")
    @Transactional
    public ResponseEntity<?> uploadPaymentProof(
            @PathVariable("caseId") int caseId,
            @RequestParam("file") MultipartFile file,
            Principal principal) {

        if (file.isEmpty()) {
            return ResponseEntity.badRequest().build();
        }

        try {
            String username = principal.getName();
            User employee = userRepository.findByEmail(username)
                    .orElseThrow(() -> new RuntimeException("Logged in user not found in database"));

            Case lawCase = caseRepository.findById(caseId)
                    .orElseThrow(() -> new RuntimeException("Case not found"));

            String relativeDir = "uploads/payments";
            Path uploadPath = Paths.get(relativeDir);
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

            return ResponseEntity.ok("Payment proof successfully uploaded and linked to case.");
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(500).build();
        }
    }
//==========================================EMPLOYEE==========================================

//==========================================ADMIN==========================================
    @GetMapping("/admin/cases")
    public ResponseEntity<List<AdminCaseDTO>> getAllCases(){
        return ResponseEntity.ok(caseService.getAllCases());
    }

    @PatchMapping("/admin/cases/{numberCase}/assign")
    public ResponseEntity<?> assignEmployee(@PathVariable Integer numberCase, @RequestBody Map<String, Integer> payload) {
        Integer employeeId = payload.get("employeeId");
        caseService.assignEmployeeToCase(numberCase, employeeId);
        return ResponseEntity.ok("Assigned successfully");
    }

    @PatchMapping("/admin/cases/{caseId}/archive")
    public ResponseEntity<?> archiveCase(@PathVariable Integer caseId, @RequestBody Map<String, String> payload) {
        String closedDate = payload.get("closedDate");
        caseService.archiveCase(caseId, closedDate);
        return ResponseEntity.ok("Archived successfully");
    }

    @PostMapping(value = "/admin/case", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @Transactional
    public ResponseEntity<?> createCase(
            @RequestParam("idDriver") Integer idDriver,
            @RequestParam("plateNumber") String plateNumber,
            @RequestParam("address") String address,
            @RequestParam("violationDate") String violationDateStr,
            @RequestParam("fineAmount") String fineAmountStr,
            @RequestParam(value = "photo", required = false) MultipartFile photo) {
        try {
            Driver driver = driverRepository.findById(idDriver)
                    .orElseThrow(() -> new RuntimeException("Driver not found with ID: " + idDriver));

            Vehicle vehicle = vehicleRepository.findById(plateNumber)
                    .orElseThrow(() -> new RuntimeException("Vehicle not found with Plate: " + plateNumber));

            java.math.BigDecimal fineAmount = new java.math.BigDecimal(fineAmountStr);

            Case newCase = Case.builder()
                    .status(CaseStatus.REGISTERED)
                    .violationDate(java.time.LocalDate.parse(violationDateStr))
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
                    savedCase.getFineAmount()
            );

            if (photo != null && !photo.isEmpty()) {
                java.io.File dir = new java.io.File("uploads/photos/");
                if (!dir.exists()) {
                    dir.mkdirs();
                }

                String originalFilename = photo.getOriginalFilename();
                String extension = originalFilename != null && originalFilename.contains(".")
                        ? originalFilename.substring(originalFilename.lastIndexOf(".")) : ".jpg";

                String newFileName = "photo_" + savedCase.getNumberCase() + extension;

                Path path = Paths.get("uploads/photos/" + newFileName);
                Files.write(path, photo.getBytes());

                String savedFilePath = "/uploads/photos/" + newFileName;

                Authentication authentication = SecurityContextHolder.getContext().getAuthentication();

                String adminEmail = authentication.getName();

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

            return ResponseEntity.ok("Case saved with ID: " + savedCase.getNumberCase());

        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.badRequest().body("Error saving case: " + e.getMessage());
        }
    }

    @PostMapping("/admin/cases/import")
    @Transactional
    public ResponseEntity<?> importMegaCases(@RequestBody List<Map<String, Object>> payloadList) {
        try {
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
                                    .birthDate(java.time.LocalDate.parse((String) driverMap.get("birthDate")))
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
                        savedCase.getFineAmount()
                );

                if (item.containsKey("file") && item.get("file") != null) {
                    Map<String, Object> fileMap = (Map<String, Object>) item.get("file");
                    String filePath = (String) fileMap.get("filePath");
                    String fileTypeStr = (String) fileMap.get("fileType");

                    if (filePath != null && !filePath.trim().isEmpty()) {
                        FileType type = fileTypeStr != null ? FileType.valueOf(fileTypeStr) : FileType.PHOTOGRAPH_OF_INCIDENT;

                        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();

                        String adminEmail = authentication.getName();

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

            return ResponseEntity.ok("Successfully imported " + importedCount + " complex cases!");
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.badRequest().body("Mega Import failed: " + e.getMessage());
        }
    }
}



//==========================================ADMIN==========================================



