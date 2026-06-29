package com.kancelaria.officesystem.controller;

import com.kancelaria.officesystem.model.dto.UserDTO;
import com.kancelaria.officesystem.model.entity.User;
import com.kancelaria.officesystem.repository.UserRepository;
import com.kancelaria.officesystem.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.Map;
@RestController
@RequiredArgsConstructor
@RequestMapping("/office")
public class UserController {
    private final UserService userService;
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @GetMapping("/profile")
    public ResponseEntity<UserDTO> getUserDetails() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String email = authentication.getName();
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));
        return ResponseEntity.ok(userService.getUserById(user.getUserId()));
    }
//===================================EMPLOYEE======================================
    @PutMapping("/{employeeId}")
    public ResponseEntity<User> updateUser(@PathVariable("employeeId") Integer id, @RequestBody UserDTO userDTO) {
        User user = userRepository.findById(id).orElseThrow(() -> new RuntimeException("User not found"));
        user.setName(userDTO.getName());
        user.setSurname(userDTO.getSurname());
        user.setEmail(userDTO.getEmail());
        user.setPhone(userDTO.getPhone());

        return ResponseEntity.ok(userRepository.save(user));
    }
//===================================ADMIN======================================
    @GetMapping("/admin/users")
    public ResponseEntity<List<UserDTO>> getUsers() {

        return ResponseEntity.ok(userService.getAllUsers());
    }

    @PostMapping("/admin/user")
    public ResponseEntity<?> createUser(@RequestBody User newUser) {
        UserDTO createdUser = userService.createUser(newUser);
        return ResponseEntity.ok(createdUser);
    }

    @PutMapping("/admin/user/{id}")
    public ResponseEntity<?> updateUserAdmin(@PathVariable Integer id, @RequestBody UserDTO userDTO) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found"));

        user.setRole(userDTO.getRole());
        user.setActive(userDTO.isActive());

        userRepository.save(user);
        return ResponseEntity.ok("User updated successfully");
    }

    @PutMapping("/admin/user/{id}/reset-password")
    public ResponseEntity<?> resetPassword(@PathVariable Integer id, @RequestBody Map<String, String> payload) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found"));

        String newPassword = payload.get("password");
        user.setPassword(passwordEncoder.encode(newPassword));

        userRepository.save(user);
        return ResponseEntity.ok("Password reset successfully");
    }
}

