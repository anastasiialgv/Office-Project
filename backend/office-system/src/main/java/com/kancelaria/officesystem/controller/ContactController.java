package com.kancelaria.officesystem.controller;

import com.kancelaria.officesystem.DTOMapper;
import com.kancelaria.officesystem.model.dto.Contact.ContactDTO;
import com.kancelaria.officesystem.repository.ContactRepository;
import com.kancelaria.officesystem.service.ContactService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping("/office/")
public class ContactController {
    private final ContactService contactService;
    private final ContactRepository contactRepository;
    private final DTOMapper dtoMapper;

    @GetMapping("/cases/{caseId}/contact-history")
    public ResponseEntity<List<ContactDTO>> getContactHistory(@PathVariable("caseId") int caseId) {
        try {
            List<ContactDTO> history = contactService.getContactHistoryByCaseId(caseId);
            return ResponseEntity.ok(history);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(500).build();
        }
    }

    @PostMapping("/cases/{caseId}/contact-history")
    public ResponseEntity<Void> addContactLog(
            @PathVariable("caseId") int caseId,
            @RequestBody ContactDTO dto) {
        try {
            contactService.saveContactLog(caseId, dto.getContactType(), dto.getResult());
            return ResponseEntity.ok().build();
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(500).build();
        }
    }

    @GetMapping("/contacts/my")
    public ResponseEntity<List<ContactDTO>> getMyContacts(java.security.Principal principal) {
        try {
            String username = principal.getName();

            // Достаем контакты, фильтруем по юзеру дела и мапим в чистые DTO
            List<ContactDTO> myContacts =
                    contactRepository.findAll().stream()
                            .filter(c -> c.getLawCase() != null
                                    && c.getLawCase().getEmployee() != null
                                    && username.equals(c.getLawCase().getEmployee().getEmail()))
                            .map(dtoMapper::mapToContactDTO) // Используем твой маппер!
                            .toList();

            return ResponseEntity.ok(myContacts);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(500).build();
        }
    }

}
