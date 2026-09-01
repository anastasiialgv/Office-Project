package com.kancelaria.officesystem.controller;

import com.kancelaria.officesystem.model.dto.UserDTO;
import com.kancelaria.officesystem.model.entity.User;
import com.kancelaria.officesystem.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.Map;

@RestController
@RequiredArgsConstructor
@RequestMapping("/office")
public class UserController {
    private final UserService userService;

    @GetMapping("/profile")
    public ResponseEntity<UserDTO> getUserDetails() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String email = authentication.getName();
        return ResponseEntity.ok(userService.getUserByEmail(email));
    }

    //===================================EMPLOYEE======================================
    @PutMapping("/{employeeId}")
    public ResponseEntity<User> updateUser(@PathVariable("employeeId") Integer id, @RequestBody UserDTO userDTO) {
        return ResponseEntity.ok(userService.updateUser(id, userDTO));
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
        userService.updateUserAdmin(id, userDTO);
        return ResponseEntity.ok("User updated successfully");
    }

    @PutMapping("/admin/user/{id}/reset-password")
    public ResponseEntity<?> resetPassword(@PathVariable Integer id, @RequestBody Map<String, String> payload) {
        userService.resetPassword(id, payload.get("password"));
        return ResponseEntity.ok("Password reset successfully");
    }

}

