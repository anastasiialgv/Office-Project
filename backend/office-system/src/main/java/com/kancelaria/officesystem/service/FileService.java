package com.kancelaria.officesystem.service;

import com.kancelaria.officesystem.DTOMapper;
import com.kancelaria.officesystem.model.dto.File.FileDTO;
import com.kancelaria.officesystem.model.entity.Case;
import com.kancelaria.officesystem.model.entity.File;
import com.kancelaria.officesystem.model.entity.User;
import com.kancelaria.officesystem.model.enums.FileType;
import com.kancelaria.officesystem.repository.CaseRepository;
import com.kancelaria.officesystem.repository.FileRepository;
import com.kancelaria.officesystem.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.time.LocalDate;
import java.util.List;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;


import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;


@Service
@RequiredArgsConstructor
public class FileService {
    @Value("${app.upload-dir}")
    private String uploadDir;
    private final FileRepository fileRepository;
    private final CaseRepository caseRepository;
    private final UserRepository userRepository;
    private final DTOMapper dtoMapper;


    public record FileDownloadResult(Resource resource, String contentType, String filename) {
    }

    @Transactional(readOnly = true)
    public FileDownloadResult prepareDownload(int fileId) throws IOException {
        File dbFile = fileRepository.findById(fileId)
                .orElseThrow(() -> new RuntimeException("File record not found in database"));

        String webPath = dbFile.getFilePath();
        String relativeTail = webPath.startsWith("/uploads/")
                ? webPath.substring("/uploads/".length())
                : webPath;

        Path filePath = Paths.get(uploadDir).resolve(relativeTail).toAbsolutePath().normalize();
        Resource resource = new UrlResource(filePath.toUri());

        if (!resource.exists()) {
            return null;
        }

        String contentType = Files.probeContentType(filePath);
        String downloadFileName = resource.getFilename();

        return new FileDownloadResult(resource, contentType, downloadFileName);
    }

    @Transactional(readOnly = true)
    public List<FileDTO> getMyFiles(String username) {
        return fileRepository.findAll().stream()
                .filter(f -> f.getGeneratedBy() != null
                        && username.equals(f.getGeneratedBy().getEmail()))
                .map(dtoMapper::mapToFileDTO)
                .toList();
    }

    @Transactional
    public void uploadGeneratedDocument(Integer caseId, MultipartFile file, String fileTypeStr, String username) throws IOException {
        User employee = userRepository.findByEmail(username)
                .orElseThrow(() -> new RuntimeException("Logged in user not found in database"));

        Case lawCase = null;
        if (caseId != null) {
            lawCase = caseRepository.findById(caseId).orElse(null);
        }
        String relativeDir = uploadDir + "/generated/";
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
    }
}
