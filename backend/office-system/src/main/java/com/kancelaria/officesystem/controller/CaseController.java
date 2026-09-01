package com.kancelaria.officesystem.controller;

import com.kancelaria.officesystem.model.dto.Case.EmployeeCaseDetailDTO;
import com.kancelaria.officesystem.model.dto.Case.EmployeeListCaseDTO;
import com.kancelaria.officesystem.model.dto.Case.PublicCaseDTO;
import com.kancelaria.officesystem.model.entity.*;
import com.kancelaria.officesystem.service.CaseService;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import java.math.BigDecimal;
import java.security.Principal;
import java.util.List;
import java.util.Map;


@RestController
@RequiredArgsConstructor
@RequestMapping("/office")
public class CaseController {
    private final CaseService caseService;

    //==========================================EMPLOYEE==========================================
    @GetMapping("/cases")
    public ResponseEntity<List<EmployeeListCaseDTO>> getCasesByEmployee(
            @org.springframework.security.core.annotation.AuthenticationPrincipal String email) {
        try {
            return ResponseEntity.ok(caseService.getCasesByEmployee(email));
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
                                        @RequestParam String reason) {
        caseService.addPenalty(caseId, amount, reason);
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
            caseService.uploadPaymentProof(caseId, file, principal.getName());
            return ResponseEntity.ok("Payment proof successfully uploaded and linked to case.");
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(500).build();
        }
    }
    //==========================================EMPLOYEE==========================================

    //==========================================ADMIN==========================================
    @GetMapping("/admin/cases")
    public ResponseEntity<?> getAllCases() {
        try {
            return ResponseEntity.ok(caseService.getAllCases());
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(500).body("Error: " + e.getMessage());
        }
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
            String adminEmail = currentUserEmail();
            Case savedCase = caseService.createCase(idDriver, plateNumber, address, violationDateStr,
                    fineAmountStr, photo, adminEmail);
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
            String adminEmail = currentUserEmail();
            int importedCount = caseService.importCases(payloadList, adminEmail);
            return ResponseEntity.ok("Successfully imported " + importedCount + " complex cases!");
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.badRequest().body("Mega Import failed: " + e.getMessage());
        }
    }
    //==========================================ADMIN==========================================

    // ==========================================DRIVER==========================================
    @GetMapping("/public/cases/{caseId}")
    public ResponseEntity<PublicCaseDTO> getPublicCaseInfo(@PathVariable("caseId") int caseId) {
        return ResponseEntity.ok(caseService.getPublicCaseInfo(caseId));
    }

    private String currentUserEmail() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        return authentication.getName();
    }

}






