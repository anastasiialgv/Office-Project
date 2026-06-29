package com.kancelaria.officesystem.repository;

import com.kancelaria.officesystem.model.dto.File.FileDTO;
import com.kancelaria.officesystem.model.dto.UserDTO;
import com.kancelaria.officesystem.model.entity.User;
import com.kancelaria.officesystem.model.enums.FileType;
import com.kancelaria.officesystem.model.entity.File;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface FileRepository extends JpaRepository<File, Integer> {
    List<File> findByLawCase_NumberCaseAndFileType(Integer caseId, FileType fileType);

    List<File> findByLawCase_NumberCase(Integer numberCase);

    List<File> findByLawCase_Employee_UserId(Integer userId);

}
