package com.kancelaria.officesystem.model.dto.Authorization;

import lombok.Data;

@Data
public class LoginRequestDTO {
    private String email;
    private String password;
}
