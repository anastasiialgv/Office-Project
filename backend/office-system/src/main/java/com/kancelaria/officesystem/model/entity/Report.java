package com.kancelaria.officesystem.model.entity;


import com.kancelaria.officesystem.model.enums.ReportType;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.*;
import java.time.LocalDate;

@Entity
@Table(name = "\"Report\"")
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Setter
@Getter
public class Report {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "report_id")
    private Integer reportId;

    @NotNull
    @Column(nullable = false, name = "generated_at")
    private LocalDate generatedAt;

    @NotNull
    @Column(name = "report_type", nullable = false, columnDefinition = "varchar(255)")
    @Enumerated(EnumType.STRING)
    private ReportType reportType;

    @NotBlank
    @Size(max = 500)
    @Column(name = "file_path", nullable = false, length = 500)
    private String filePath;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "generated_by", nullable = false)
    private User accountant;
}
