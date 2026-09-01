package com.kancelaria.officesystem.service;

import com.kancelaria.officesystem.DTOMapper;
import com.kancelaria.officesystem.model.dto.UserDTO;
import com.kancelaria.officesystem.model.entity.User;
import com.kancelaria.officesystem.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class UserService {
    private final UserRepository userRepository;
    private final DTOMapper dtoMapper;
    private final PasswordEncoder passwordEncoder;

    public UserDTO getUserByEmail(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));
        return dtoMapper.mapToUserDTO(user);
    }

    public List<UserDTO> getAllUsers() {
        return  userRepository.findAll().stream().map(dtoMapper::mapToUserDTO)
                .toList();
    }

    public UserDTO createUser(User user) {
        user.setPassword(passwordEncoder.encode(user.getPassword()));
        user.setActive(true);

        User savedUser = userRepository.save(user);
        return dtoMapper.mapToUserDTO(savedUser);
    }

    @Transactional
    public User updateUser(Integer id, UserDTO userDTO) {
        User user = userRepository.findById(id).orElseThrow(() -> new RuntimeException("User not found"));
        user.setName(userDTO.getName());
        user.setSurname(userDTO.getSurname());
        user.setEmail(userDTO.getEmail());
        user.setPhone(userDTO.getPhone());

        return userRepository.save(user);
    }

    @Transactional
    public void updateUserAdmin(Integer id, UserDTO userDTO) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found"));

        user.setRole(userDTO.getRole());
        user.setActive(userDTO.isActive());

        userRepository.save(user);
    }

    @Transactional
    public void resetPassword(Integer id, String newPassword) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found"));

        user.setPassword(passwordEncoder.encode(newPassword));

        userRepository.save(user);
    }
}
