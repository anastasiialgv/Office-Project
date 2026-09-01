package com.kancelaria.officesystem.service;

import com.kancelaria.officesystem.model.entity.Case;
import com.kancelaria.officesystem.model.entity.Driver;
import com.kancelaria.officesystem.model.enums.CaseStatus;
import com.kancelaria.officesystem.repository.CaseRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyList;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class CaseAutomationServiceTest {
    @Mock
    private CaseRepository caseRepository;

    @Mock
    private EmailService emailService;

    @InjectMocks
    private CaseAutomationService caseAutomationService;

    private Driver testDriver;

    @BeforeEach
    void setUp() {
        testDriver = Driver.builder()
                .name("Jan")
                .surname("Kowalski")
                .email("jan.kowalski@example.com")
                .build();
    }

    @Test
    void checkAndEscalateCases_whenSevenToThirteenDaysPassed_appliesFirstPenalty() {
        Case testCase = Case.builder()
                .numberCase(1)
                .status(CaseStatus.IN_PROGRESS)
                .violationDate(LocalDate.now().minusDays(10))
                .fineAmount(BigDecimal.ZERO)
                .overdueCount(0)
                .driver(testDriver)
                .build();

        when(caseRepository.findAll()).thenReturn(List.of(testCase));

        caseAutomationService.checkAndEscalateCases();


        assertThat(testCase.getFineAmount()).isEqualByComparingTo("100.00");
        assertThat(testCase.getOverdueCount()).isEqualTo(1);
        assertThat(testCase.getStatus()).isEqualTo(CaseStatus.IN_PROGRESS);

        verify(caseRepository, times(1)).saveAll(anyList());
    }

    @Test
    void checkAndEscalateCases_whenTwentyOneDaysOrMorePassed_movesCaseToCourt() {
        Case testCase = Case.builder()
                .numberCase(2)
                .status(CaseStatus.IN_PROGRESS)
                .violationDate(LocalDate.now().minusDays(25))
                .fineAmount(new BigDecimal("400.00"))
                .overdueCount(0)
                .driver(testDriver)
                .build();

        when(caseRepository.findAll()).thenReturn(List.of(testCase));

        caseAutomationService.checkAndEscalateCases();


        assertThat(testCase.getStatus()).isEqualTo(CaseStatus.IN_COURT);
        assertThat(testCase.getOverdueCount()).isEqualTo(3);

        verify(emailService, times(1)).sendInCourtNotification(
                eq("jan.kowalski@example.com"),
                eq("Jan"),
                any()
        );

        verify(caseRepository, times(1)).saveAll(anyList());
    }
}
