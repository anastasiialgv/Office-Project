package com.kancelaria.officesystem.repository;

import com.kancelaria.officesystem.model.dto.Case.EmployeeListCaseDTO;
import com.kancelaria.officesystem.model.entity.Case;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface CaseRepository extends JpaRepository<Case, Integer> {
    @Query("""
        SELECT new com.kancelaria.officesystem.model.dto.Case.EmployeeListCaseDTO(
            c.numberCase, c.status, c.violationDate, d.name, d.surname
        )
        FROM Case c
        JOIN c.driver d
        WHERE c.employee.userId = :userId AND c.status != 'ARCHIVED'
    """)
    List<EmployeeListCaseDTO> findCasesByEmployeeId(@Param("userId") Integer userId);
}





//SELECT
//    case0_.number_case as col_0_0_,
//    case0_.status as col_1_0_,
//    case0_.violation_date as col_2_0_,
//    driver1_.name as col_3_0_,
//    driver1_.surname as col_4_0_
//FROM
//    cases case0_
//INNER JOIN
//    drivers driver1_
//        ON case0_.driver_id = driver1_.id_driver
//WHERE
//    case0_.employee_id = ?             -