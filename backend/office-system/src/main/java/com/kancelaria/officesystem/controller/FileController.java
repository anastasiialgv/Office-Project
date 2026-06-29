package com.kancelaria.officesystem.controller;

import com.kancelaria.officesystem.DTOMapper;
import com.kancelaria.officesystem.model.dto.File.FileDTO;
import com.kancelaria.officesystem.model.entity.Case;
import com.kancelaria.officesystem.model.entity.File;
import com.kancelaria.officesystem.model.entity.User;
import com.kancelaria.officesystem.model.enums.FileType;
import com.kancelaria.officesystem.repository.CaseRepository;
import com.kancelaria.officesystem.repository.FileRepository;
import com.kancelaria.officesystem.repository.UserRepository;
import org.springframework.transaction.annotation.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.security.Principal;
import java.nio.file.StandardCopyOption;
import java.time.LocalDate;
import java.util.List;


@RestController
@RequiredArgsConstructor
@RequestMapping("office/files")
public class FileController {
    private final FileRepository fileRepository;
    private final CaseRepository caseRepository;
    private final UserRepository userRepository;
    private final DTOMapper dtoMapper;

    @GetMapping("/download/{fileId}")
    @Transactional(readOnly = true)
    public ResponseEntity<Resource> downloadFile(@PathVariable("fileId") int fileId) {
        try {
            File dbFile = fileRepository.findById(fileId)
                    .orElseThrow(() -> new RuntimeException("File record not found in database"));

            String purePath = dbFile.getFilePath().startsWith("/")
                    ? dbFile.getFilePath().substring(1)
                    : dbFile.getFilePath();

            Path filePath = Paths.get(purePath).toAbsolutePath().normalize();
            Resource resource = new UrlResource(filePath.toUri());

            if (!resource.exists()) {
                return ResponseEntity.notFound().build();
            }

            String contentType = java.nio.file.Files.probeContentType(filePath);

            String downloadFileName = resource.getFilename() != null ? resource.getFilename() : "file";

            return ResponseEntity.ok()
                    .contentType(MediaType.parseMediaType(contentType))
                    .header(HttpHeaders.CONTENT_DISPOSITION, "inline; filename=\"" + downloadFileName + "\"")
                    .body(resource);

        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(500).build();
        }
    }

    @GetMapping("/my")
    public ResponseEntity<List<FileDTO>> getMyFiles(Principal principal) {
        try {
            String username = principal.getName();

            List<FileDTO> myFiles =
                    fileRepository.findAll().stream()
                            .filter(f -> f.getGeneratedBy() != null
                                    && username.equals(f.getGeneratedBy().getEmail()))
                            .map(dtoMapper::mapToFileDTO)
                            .toList();

            return ResponseEntity.ok(myFiles);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(500).build();
        }
    }

    @Transactional
    @PostMapping("/generated-document")
    public ResponseEntity<?> uploadGeneratedDocument(@RequestParam(value = "caseId", required = false) Integer caseId,
                                                     @RequestParam("file") MultipartFile file,
                                                     @RequestParam("fileType") String fileTypeStr,
                                                     Principal principal) {
        if (file.isEmpty()) {
            return ResponseEntity.badRequest().body("File is empty");
        }

        try {
            String username = principal.getName();
            User employee = userRepository.findByEmail(username)
                    .orElseThrow(() -> new RuntimeException("Logged in user not found in database"));

            Case lawCase = null;
            if (caseId != null) {
                lawCase = caseRepository.findById(caseId).orElse(null);
            }
            String relativeDir = "uploads/generated/";
            Path uploadPath = Paths.get(relativeDir);
            if (!Files.exists(uploadPath)) {
                Files.createDirectories(uploadPath);
            }

            String fileTypeLower = fileTypeStr.toLowerCase();
            String filePrefix = (caseId != null) ? String.valueOf(caseId) : "user_" + employee.getUserId();
            String uniqueFileName = filePrefix + "_" + fileTypeLower + "_" + System.currentTimeMillis() + ".pdf";
            Path filePath = uploadPath.resolve(uniqueFileName);

            Files.copy(file.getInputStream(), filePath, StandardCopyOption.REPLACE_EXISTING);

            String webUrlPath = "/uploads/generated/" + uniqueFileName;

            File dbFile = new File();
            dbFile.setLawCase(lawCase);
            dbFile.setGeneratedBy(employee);
            dbFile.setFilePath(webUrlPath);
            dbFile.setFileType(FileType.valueOf(fileTypeStr));
            dbFile.setUploadedAt(LocalDate.now());

            fileRepository.save(dbFile);

            return ResponseEntity.ok("Document successfully saved on server. Path linked in DB.");

        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(500).body("Error saving document path: " + e.getMessage());
        }

    }


}
