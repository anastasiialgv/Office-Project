package com.kancelaria.officesystem.model.dto.User;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class UserUpdateDTO {
    private String name;
    private String surname;
    private String phone;
    private String email;
    private String password;
    private boolean isActive;
}
