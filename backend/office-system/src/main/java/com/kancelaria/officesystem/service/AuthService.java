package com.kancelaria.officesystem.service;

import com.kancelaria.officesystem.model.dto.Authorization.LoginRequestDTO;
import com.kancelaria.officesystem.model.dto.Authorization.LoginResponseDTO;
import com.kancelaria.officesystem.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;

import com.kancelaria.officesystem.model.entity.User;
import java.util.Optional;
import com.kancelaria.officesystem.security.JwtService;
@Service
@RequiredArgsConstructor
public class AuthService {
    private final UserRepository userRepository;
    private final BCryptPasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    public LoginResponseDTO authorization(LoginRequestDTO loginRequestDTO) {
            Optional<User> userOptional = userRepository.findByEmail(loginRequestDTO.getEmail());
            if (userOptional.isEmpty())
                return LoginResponseDTO.builder()
                        .success(false)
                        .message("User not found. Please check email and try again")
                        .build();

            User user = userOptional.get();
            if (passwordEncoder.matches(loginRequestDTO.getPassword(), user.getPassword())) {
                String token = jwtService.generateToken(user);
                return LoginResponseDTO.builder()
                        .success(true)
                        .role(user.getRole())
                        .message("Success")
                        .userId(user.getUserId())
                        .token(token)
                        .build();
            } else {
                return LoginResponseDTO.builder()
                        .success(false)
                        .message("Wrong Password")
                        .build();
            }

        }
    }

