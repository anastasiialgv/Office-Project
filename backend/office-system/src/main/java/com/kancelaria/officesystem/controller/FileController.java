package com.kancelaria.officesystem.controller;

import com.kancelaria.officesystem.model.dto.File.FileDTO;
import com.kancelaria.officesystem.service.FileService;
import org.springframework.transaction.annotation.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.security.Principal;
import java.util.List;


@RestController
@RequiredArgsConstructor
@RequestMapping("office/files")
public class FileController {
    private final FileService fileService;

    @GetMapping("/download/{fileId}")
    @Transactional(readOnly = true)
    public ResponseEntity<?> downloadFile(@PathVariable("fileId") int fileId) {
        try {
            FileService.FileDownloadResult result = fileService.prepareDownload(fileId);

            if (result == null) {
                return ResponseEntity.notFound().build();
            }

            return ResponseEntity.ok()
                    .contentType(MediaType.parseMediaType(result.contentType()))
                    .header(HttpHeaders.CONTENT_DISPOSITION, "inline; filename=\"" + result.filename() + "\"")
                    .body(result.resource());

        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(500).build();
        }
    }

    @GetMapping("/my")
    @Transactional(readOnly = true)
    public ResponseEntity<List<FileDTO>> getMyFiles(Principal principal) {
        try {
            List<FileDTO> myFiles = fileService.getMyFiles(principal.getName());
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
            fileService.uploadGeneratedDocument(caseId, file, fileTypeStr, principal.getName());
            return ResponseEntity.ok("Document successfully saved on server. Path linked in DB.");
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(500).body("Error saving document path: " + e.getMessage());
        }
    }

}
