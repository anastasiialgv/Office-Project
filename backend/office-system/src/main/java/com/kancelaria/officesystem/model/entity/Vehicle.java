package com.kancelaria.officesystem.model.entity;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.*;

@Entity
@Table(name = "\"Vehicle\"")
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Setter
@Getter
public class Vehicle {
    @Id
    @NotBlank
    @Size(max = 10)
    @Column(name = "plate_number", length = 10, nullable = false, unique = true)
    private String plateNumber;

    @NotBlank
    @Size(max = 50)
    @Column(name = "brand", nullable = false, length = 50)
    private String brand;

    @NotBlank
    @Size(max = 100)
    @Column(name = "model", nullable = false, length = 100)
    private String model;

    @NotBlank
    @Size(max = 50)
    @Column(name = "color", nullable = false, length = 50)
    private String color;

    @NotNull
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_driver", nullable = false)
    private Driver driver;
}
