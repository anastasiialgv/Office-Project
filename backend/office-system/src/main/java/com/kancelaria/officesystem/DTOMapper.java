package com.kancelaria.officesystem;

import com.kancelaria.officesystem.model.dto.*;
import com.kancelaria.officesystem.model.dto.Case.AdminCaseDTO;
import com.kancelaria.officesystem.model.dto.Case.CaseDTO;
import com.kancelaria.officesystem.model.dto.Case.EmployeeCaseDetailDTO;
import com.kancelaria.officesystem.model.dto.Contact.ContactCaseDTO;
import com.kancelaria.officesystem.model.dto.Contact.ContactDTO;
import com.kancelaria.officesystem.model.dto.Driver.DriverDTO;
import com.kancelaria.officesystem.model.dto.Driver.DriverLegalDTO;
import com.kancelaria.officesystem.model.dto.Driver.DriverShortDTO;
import com.kancelaria.officesystem.model.dto.File.FileCaseDTO;
import com.kancelaria.officesystem.model.dto.File.FileDTO;
import com.kancelaria.officesystem.model.entity.*;
import org.springframework.stereotype.Component;

@Component
public class DTOMapper {
    // --- USER ---
    public UserDTO mapToUserDTO(User user) {
        if (user == null) return null;
        return UserDTO.builder()
                .userId(user.getUserId())
                .name(user.getName())
                .surname(user.getSurname())
                .phone(user.getPhone())
                .email(user.getEmail())
                .role(user.getRole())
                .isActive(user.isActive()).build();
    }

    // --- DRIVER ---
    public DriverDTO mapToDriverDTO(Driver driver) {
        if (driver == null) return null;
        return DriverDTO.builder()
                .idDriver(driver.getIdDriver())
                .name(driver.getName())
                .surname(driver.getSurname())
                .birthDate(driver.getBirthDate())
                .pesel(driver.getPesel())
                .passportNumber(driver.getPassportNumber())
                .email(driver.getEmail())
                .phone(driver.getPhone())
                .address(driver.getAddress())
                .notes(driver.getNotes())
                .build();
    }

    public DriverLegalDTO mapToDriverLegalDTO(Driver driver){
        if (driver == null) return null;
        return DriverLegalDTO.builder()
                .idDriver(driver.getIdDriver())
                .name(driver.getName())
                .surname(driver.getSurname())
                .birthDate(driver.getBirthDate())
                .passportNumber(driver.getPassportNumber())
                .pesel(driver.getPesel())
                .email(driver.getEmail())
                .phone(driver.getPhone())
                .address(driver.getAddress())
                .build();
    }

    public DriverShortDTO mapToDriverShortDTO(Driver driver){
        if (driver == null) return null;
        return DriverShortDTO.builder()
                .idDriver(driver.getIdDriver())
                .name(driver.getName())
                .surname(driver.getSurname())
                .email(driver.getEmail() != null ? driver.getEmail() : "")
                .build();
    }


    // --- VEHICLE ---
    public VehicleDTO mapToVehicleDTO(Vehicle vehicle) {
        if (vehicle == null) return null;
        return VehicleDTO.builder()
                .plateNumber(vehicle.getPlateNumber())
                .brand(vehicle.getBrand())
                .model(vehicle.getModel())
                .color(vehicle.getColor())
                .idDriver(vehicle.getDriver() != null ? vehicle.getDriver().getIdDriver() : null)
                .build();
    }

    // --- ADMIN CASE ---

    public AdminCaseDTO mapToAdminCaseDTO(Case lawCase){
        return AdminCaseDTO.builder()
                .numberCase(lawCase.getNumberCase())
                .fineAmount(lawCase.getFineAmount())
                .status(lawCase.getStatus())
                .violationDate(lawCase.getViolationDate())
                .employeeName(lawCase.getEmployee() != null ? lawCase.getEmployee().getName() : "Unassigned")
                .employeeSurname(lawCase.getEmployee() != null ? lawCase.getEmployee().getSurname() : "Unassigned")
                .employeeId(lawCase.getEmployee() != null ? lawCase.getEmployee().getUserId() : null)
                .build();
    }


    // --- FILE ---
    public FileDTO mapToFileDTO(File file) {
        if (file == null) return null;
        FileDTO dto = new FileDTO();
        dto.setFileId(file.getFileId());
        dto.setFileType(file.getFileType());
        dto.setUploadedAt(file.getUploadedAt());
        if (file.getLawCase() != null) {
            dto.setNumberCase(file.getLawCase().getNumberCase());
        } else {
            dto.setNumberCase(null);
        }
        return dto;
    }

    // --- FILE CASE ---
    public FileCaseDTO mapToFileCaseDTO(File file) {
        if (file == null) return null;
        return FileCaseDTO.builder()
                .fileId(file.getFileId())
                .fileType(file.getFileType())
                .uploadedAt(file.getUploadedAt())
                .build();
    }



    // --- CONTACT ---
    public ContactDTO mapToContactDTO(Contact contact) {
        if (contact == null) return null;
        return ContactDTO.builder()
                .idMessage(contact.getIdMessage())
                .contactDate(contact.getContactDate())
                .contactType(contact.getContactType())
                .result(contact.getResult())
                .caseNumber(contact.getLawCase() != null ? contact.getLawCase().getNumberCase() : null)
                .build();
    }


}
