package com.kancelaria.officesystem.model.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.*;
import lombok.*;

import java.time.LocalDate;

@Entity
@Table(name = "\"Driver\"")
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Setter
@Getter
public class Driver {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_driver")
    private Integer idDriver;

    @NotBlank
    @Size(max = 100)
    @Column(name = "name", nullable = false, length = 100)
    private String name;

    @NotBlank
    @Size(max = 100)
    @Column(name = "surname", nullable = false, length = 100)
    private String surname;

    @NotNull
    @Past  //check date is past
    @Column(name = "birth_date", nullable = false)
    private LocalDate birthDate;

    @Size(max = 11)
    @Column(name = "pesel", unique = true, length = 11)
    private String pesel;

    @NotBlank
    @Size(max = 14)
    @Column(name = "passport_number", length = 14, nullable = false, unique = true)
    private String passportNumber;

    @Email
    @Size(max = 255)
    @Column(name = "email", unique = true)
    private String email;

    @Size(min = 9, max = 9)
    @Column(name = "phone", length = 9)
    private String phone;

    @Size(max = 255)
    @Column(name = "address")
    private String address;

    @NotBlank
    @Lob //big object text >255
    @Column(name = "notes")
    private String notes;
}
