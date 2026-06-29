package com.kancelaria.officesystem.model.dto;

import com.kancelaria.officesystem.model.enums.UserRole;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class UserDTO {
    private Integer userId;
    private String name;
    private String surname;
    private String email;
    private String phone;
    private UserRole role;
    private boolean isActive;
}
