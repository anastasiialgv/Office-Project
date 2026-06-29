package com.kancelaria.officesystem.model.dto.Contact;

import com.kancelaria.officesystem.model.enums.ContactType;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class ContactCaseDTO {
    private int idMessage;
    private LocalDateTime contactDate;
    private ContactType contactType;
    private String result;
}
