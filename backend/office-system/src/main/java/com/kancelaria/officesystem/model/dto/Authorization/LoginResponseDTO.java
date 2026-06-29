package com.kancelaria.officesystem.model.dto.Authorization;

import com.fasterxml.jackson.annotation.JsonProperty;
import com.kancelaria.officesystem.model.enums.UserRole;
import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class LoginResponseDTO {
    @JsonProperty("success") // Гарантирует имя "success" без искажений
    private boolean success;
    private String message;       // User not found, Wrong password, Success
    private Integer userId;
    private UserRole role;
    private String token;

    public boolean isSuccess() {
        return this.success;
    }
}
