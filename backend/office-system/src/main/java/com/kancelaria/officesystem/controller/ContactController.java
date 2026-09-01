package com.kancelaria.officesystem.controller;

import com.kancelaria.officesystem.model.dto.Contact.ContactDTO;
import com.kancelaria.officesystem.service.ContactService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping("/office/")
public class ContactController {
    private final ContactService contactService;

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
    @Transactional(readOnly = true)
    public ResponseEntity<List<ContactDTO>> getMyContacts(Principal principal) {
        try {
            List<ContactDTO> myContacts = contactService.getMyContacts(principal.getName());
            return ResponseEntity.ok(myContacts);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(500).build();
        }
    }

}
