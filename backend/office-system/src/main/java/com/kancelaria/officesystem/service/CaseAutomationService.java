package com.kancelaria.officesystem.service;

import com.kancelaria.officesystem.model.entity.Case;
import com.kancelaria.officesystem.model.enums.CaseStatus;
import com.kancelaria.officesystem.repository.CaseRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.temporal.ChronoUnit;
import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
public class CaseAutomationService {
    private final CaseRepository caseRepository;
    private final EmailService emailService;

    /**
     * Запуск каждую ночь в 01:00.
     * Проверяет просрочки и автоматически начисляет пени / передает дела в суд.
     */
    @Scheduled(cron = "0 0 1 * * ?")
    @Transactional
    public void checkAndEscalateCases() {
        List<Case> activeCases = caseRepository.findAll().stream()
                .filter(c -> c.getStatus() == CaseStatus.IN_PROGRESS || c.getStatus() == CaseStatus.WAITING_FOR_CONTACT)
                .toList();

        LocalDate today = LocalDate.now();

        for (Case c : activeCases) {
            if (c.getViolationDate() == null) continue;

            long daysPassed = ChronoUnit.DAYS.between(c.getViolationDate(), today);
            int currentStage = c.getOverdueCount() != null ? c.getOverdueCount() : 0;

            BigDecimal currentFine = c.getFineAmount() != null ? c.getFineAmount() : BigDecimal.ZERO;

            //                           1 week
            if (daysPassed >= 7 && daysPassed < 14 && currentStage == 0) {
                c.setFineAmount(currentFine.add(new BigDecimal("100.00")));
                c.setOverdueCount(1);
                log.info("Case #{}: 1 week passed. Penalty +100 PLN applied. New fine: {}", c.getNumberCase(), c.getFineAmount());
            }

            //                           2 week
            else if (daysPassed >= 14 && daysPassed < 21 && currentStage < 2) {
                c.setFineAmount(currentFine.add(new BigDecimal("300.00")));
                c.setOverdueCount(2);
                log.info("Case #{}: 2 weeks passed. Penalty +300 PLN applied. New fine: {}", c.getNumberCase(), c.getFineAmount());
            }

            //                           3 week
            else if (daysPassed >= 21 && currentStage < 3) {
                c.setOverdueCount(3);
                c.setStatus(CaseStatus.IN_COURT);
                emailService.sendInCourtNotification(
                        c.getDriver().getEmail(),
                        c.getDriver().getName(),
                        c.getNumberCase()
                );
                log.info("Case #{}: 3 weeks passed without payment. Case automatically transferred to COURT.", c.getNumberCase());
            }
        }

        caseRepository.saveAll(activeCases);
        log.info("Nightly case escalation process finished successfully.");
    }
}
