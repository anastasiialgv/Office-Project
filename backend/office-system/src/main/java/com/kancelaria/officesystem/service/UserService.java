package com.kancelaria.officesystem.service;

import com.kancelaria.officesystem.DTOMapper;
import com.kancelaria.officesystem.model.dto.UserDTO;
import com.kancelaria.officesystem.model.entity.User;
import com.kancelaria.officesystem.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class UserService {
    private final UserRepository userRepository;
    private final DTOMapper dtoMapper;
    private final PasswordEncoder passwordEncoder;

    //#########-------------2-------------#########//
    public UserDTO getUserById(Integer id) {
        return userRepository.findById(id).map(dtoMapper::mapToUserDTO)
                .orElseThrow(() -> new RuntimeException("User not found"));

    }

    public List<UserDTO> getAllUsers() {
        return  userRepository.findAll().stream().map(dtoMapper::mapToUserDTO)
                .toList();
    }

    public UserDTO createUser(User user) {
        // Хешируем пароль, который пришел с фронта (например "12345")
        user.setPassword(passwordEncoder.encode(user.getPassword()));
        user.setActive(true);

        User savedUser = userRepository.save(user);
        return dtoMapper.mapToUserDTO(savedUser);
    }
}
