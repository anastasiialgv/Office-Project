package com.kancelaria.officesystem.controller;

import com.kancelaria.officesystem.model.entity.Case;
import com.kancelaria.officesystem.model.entity.Contact;
import com.kancelaria.officesystem.model.entity.File;
import com.kancelaria.officesystem.model.enums.CaseStatus;
import com.kancelaria.officesystem.model.enums.ContactType;
import com.kancelaria.officesystem.model.enums.FileType;
import com.kancelaria.officesystem.repository.CaseRepository;
import com.kancelaria.officesystem.repository.ContactRepository;
import com.kancelaria.officesystem.repository.FileRepository;
import com.kancelaria.officesystem.service.PayUService;
import com.kancelaria.officesystem.service.CaseService;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import jakarta.servlet.http.HttpServletRequest;

import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.Map;

@RestController
@RequestMapping("/office/payments")
@RequiredArgsConstructor
public class PaymentController {

    private final PayUService payUService;
    private final CaseRepository caseRepository;
    private final FileRepository fileRepository;

    @PostMapping("/init/{caseId}")
    public ResponseEntity<?> initPayment(@PathVariable Integer caseId, HttpServletRequest request) {
        try {
            Case foundCase = caseRepository.findById(caseId)
                    .orElseThrow(() -> new RuntimeException("Case not found"));

            if (foundCase.getStatus() == CaseStatus.CLOSED || foundCase.getStatus() == CaseStatus.ARCHIVED) {
                return ResponseEntity.badRequest().body(Map.of("error", "Case is already closed"));
            }

            String redirectUrl = payUService.createOrder(
                    String.valueOf(foundCase.getNumberCase()),
                    foundCase.getFineAmount(),
                    request.getRemoteAddr()
            );
            return ResponseEntity.ok(Map.of("redirectUri", redirectUrl));

        }catch (Exception e) {
        e.printStackTrace();
            return ResponseEntity.status(500).body(Map.of("error", e.getMessage()));
        }
    }

    // Вызывается сервером PayU (Асинхронный Вебхук)
    @PostMapping("/notify")
    @Transactional
    public ResponseEntity<?> handlePayUNotification(@RequestBody Map<String, Object> payload) {
        try {
            Map<String, Object> order = (Map<String, Object>) payload.get("order");
            String status = (String) order.get("status");

            if ("COMPLETED".equals(status)) {
                String description = (String) order.get("description");

                String caseIdStr = description.substring(description.lastIndexOf("-") + 1);
                Integer caseId = Integer.parseInt(caseIdStr);

                Case paidCase = caseRepository.findById(caseId)
                        .orElseThrow(() -> new RuntimeException("Case not found for webhook processing"));

                paidCase.setStatus(CaseStatus.CLOSED);
                paidCase.setClosedDate(LocalDate.now());
                caseRepository.save(paidCase);

                Path uploadPath = Paths.get("uploads/payments");
                if (!Files.exists(uploadPath)) {
                    Files.createDirectories(uploadPath);
                }

                // 2. Генерируем текстовый файл-чек на сервере
                String fileName = "payu_receipt_" + caseId + "_" + System.currentTimeMillis() + ".txt";
                Path filePath = uploadPath.resolve(fileName);

                String receiptContent = "PAYMENT CONFIRMATION ONLINE (PayU)\n" +
                        "Case nr: CD-" + caseId + "\n" +
                        "ID: " + order.get("orderId") + "\n" +
                        "Date: " + LocalDate.now();

                Files.writeString(filePath, receiptContent);

                File paymentFile = new File();
                paymentFile.setLawCase(paidCase);
                paymentFile.setFileType(FileType.PAYMENT_CONFIRMATION);
                paymentFile.setUploadedAt(LocalDate.now());
                paymentFile.setFilePath("/uploads/payments/" + fileName);
                paymentFile.setGeneratedBy(null);

                fileRepository.save(paymentFile);

            }
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.internalServerError().build();
        }

        return ResponseEntity.ok().build();
    }
}