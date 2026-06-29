package com.kancelaria.officesystem.model.entity;

import com.kancelaria.officesystem.model.enums.FileType;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.*;

import java.time.LocalDate;

@Entity
@Table(name = "\"File\"")
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Setter
@Getter
public class File {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "file_id")
    private Integer fileId;

    @NotNull
    @Column(name = "file_type", nullable = false, columnDefinition = "varchar(255)")
    @Enumerated(EnumType.STRING)
    private FileType fileType;

    @NotNull
    @Column(name = "uploaded_at", nullable = false)
    private LocalDate uploadedAt;

    @NotBlank
    @Size(max = 500)
    @Column(name = "file_path", nullable = false, length = 500)
    private String filePath;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "numbercase")
    private Case lawCase;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User generatedBy;
}
