package com.kancelaria.officesystem.service;


import com.kancelaria.officesystem.DTOMapper;
import com.kancelaria.officesystem.model.entity.*;
import com.kancelaria.officesystem.model.enums.CaseStatus;
import com.kancelaria.officesystem.repository.*;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.junit.jupiter.api.io.TempDir;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.test.util.ReflectionTestUtils;

import java.math.BigDecimal;
import java.nio.file.Path;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class CaseServiceTest {
    @Mock
    private CaseRepository caseRepository;
    @Mock
    private UserRepository userRepository;
    @Mock
    private ContactRepository contactRepository;
    @Mock
    private FileRepository fileRepository;
    @Mock
    private EmailService emailService;

    @InjectMocks
    private CaseService caseService;

    @TempDir
    Path tempDir; // temporary package

    private Case testCase;

    @BeforeEach
    void setUp() {
        ReflectionTestUtils.setField(caseService, "uploadDir", tempDir.toString());

        Driver driver = Driver.builder()
                .name("Anna")
                .surname("Nowak")
                .email("anna.nowak@example.com")
                .build();

        testCase = Case.builder()
                .status(CaseStatus.WAITING_FOR_CONTACT)
                .fineAmount(new BigDecimal("100.00"))
                .driver(driver)
                .build();
    }

    @Test
    void uploadPaymentProof_whenCalled_closesTheCase() throws Exception {
        User employee = User.builder()
                .email("employee@example.com")
                .build();

        when(caseRepository.findById(1)).thenReturn(Optional.of(testCase));
        when(userRepository.findByEmail("employee@example.com")).thenReturn(Optional.of(employee));

        MockMultipartFile fakeFile = new MockMultipartFile(
                "file",
                "confirmation.pdf",
                "application/pdf",
                "fake file".getBytes()
        );

        caseService.uploadPaymentProof(1, fakeFile, "employee@example.com");


        assertThat(testCase.getStatus()).isEqualTo(CaseStatus.CLOSED);
        assertThat(testCase.getClosedDate()).isNotNull();

        verify(fileRepository, times(1)).save(any(File.class));
    }

    @Test
    void addPenalty_whenCaseDoesNotExist_throwsException() {

        when(caseRepository.findById(999)).thenReturn(Optional.empty());

        assertThatThrownBy(() ->
                caseService.addPenalty(999, new BigDecimal("50.00"), "Late payment")
        )
                .isInstanceOf(RuntimeException.class)
                .hasMessage("Case not found");

        // automation
        verify(caseRepository, never()).save(any());
        verify(contactRepository, never()).save(any());
        verify(emailService, never()).sendPenaltyIncreasedNotification(
                anyString(), anyString(), any(), any(), any()
        );
    }
}
