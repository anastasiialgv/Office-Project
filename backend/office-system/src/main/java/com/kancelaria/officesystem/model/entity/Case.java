package com.kancelaria.officesystem.model.entity;


import com.kancelaria.officesystem.model.enums.CaseStatus;
import jakarta.persistence.*;
import jakarta.validation.constraints.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.HashSet;
import java.util.Set;

@Entity
@Table(name = "\"Case\"")
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Setter
@Getter
public class Case {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "numbercase", nullable = false)
    private Integer numberCase;

    @NotNull
    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false, columnDefinition = "varchar(255)")
    private CaseStatus status;

    @NotNull
    @PastOrPresent
    @Column(name = "violation_date", nullable = false)
    private LocalDate violationDate;

    @NotNull
    @Positive
    @Digits(integer = 5, fraction = 2)
    @Column(name = "fine_amount", nullable = false)
    private BigDecimal fineAmount;

    @Min(0)
    @Max(2)
    @NotNull
    @Column(name = "overdue_count", nullable = false)
    private Integer overdueCount;

    @NotBlank
    @Size(max = 255)
    @Column(name = "address", nullable = false)
    private String address;

    @PastOrPresent
    @Column(name = "closed_at")
    private LocalDate closedDate;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id")
    private User employee;

    @NotNull
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "plate_number", nullable = false)
    private Vehicle vehicle;

    @NotNull
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_driver", nullable = false)
    private Driver driver;

    @OneToMany(mappedBy = "lawCase", cascade = CascadeType.ALL, orphanRemoval = true)
    private Set<File> files = new HashSet<>();

    @OneToMany(mappedBy = "lawCase", cascade = CascadeType.ALL, orphanRemoval = true)
    private Set<Contact> contacts = new HashSet<>();
}
