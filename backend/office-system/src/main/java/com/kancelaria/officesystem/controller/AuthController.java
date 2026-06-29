package com.kancelaria.officesystem.controller;

import com.kancelaria.officesystem.model.dto.Authorization.LoginRequestDTO;
import com.kancelaria.officesystem.model.dto.Authorization.LoginResponseDTO;
import com.kancelaria.officesystem.service.AuthService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequiredArgsConstructor
@RequestMapping("/office/")
public class AuthController {
    private final AuthService authService;

    @PostMapping("/login")
    public ResponseEntity<LoginResponseDTO> login(@RequestBody LoginRequestDTO loginRequestDTO){
        LoginResponseDTO response = authService.authorization(loginRequestDTO);
        if (response.isSuccess())
            return ResponseEntity.ok(response);
        else
            return ResponseEntity.status(401).body(response);
    }
}
