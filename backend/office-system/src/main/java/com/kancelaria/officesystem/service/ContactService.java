package com.kancelaria.officesystem.service;

import com.kancelaria.officesystem.DTOMapper;
import com.kancelaria.officesystem.model.dto.Contact.ContactDTO;
import com.kancelaria.officesystem.model.entity.Case;
import com.kancelaria.officesystem.model.entity.Contact;
import com.kancelaria.officesystem.model.enums.CaseStatus;
import com.kancelaria.officesystem.model.enums.ContactType;
import com.kancelaria.officesystem.repository.CaseRepository;
import com.kancelaria.officesystem.repository.ContactRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;


@Service
@RequiredArgsConstructor
public class ContactService {
    private final ContactRepository contactRepository;
    private final CaseRepository caseRepository;
    private final DTOMapper dtoMapper;

    @Transactional(readOnly = true)
    public List<ContactDTO> getContactHistoryByCaseId(int caseId) {
        return contactRepository.findByLawCase_NumberCase(caseId).stream()
                .map(dtoMapper::mapToContactDTO)
                .toList();
    }

    @Transactional
    public void saveContactLog(int caseId, ContactType type, String result) {
        Case lawCase = caseRepository.findById(caseId)
                .orElseThrow(() -> new RuntimeException("Case not found"));

        Contact log = new Contact();
        log.setLawCase(lawCase);
        log.setContactType(type);
        log.setResult(result);
        log.setContactDate(LocalDateTime.now());

        contactRepository.save(log);

        if (lawCase.getStatus() == CaseStatus.WAITING_FOR_CONTACT) {
            lawCase.setStatus(CaseStatus.IN_PROGRESS);
            caseRepository.save(lawCase);
        }

    }



}
