package com.kancelaria.officesystem.controller;

import com.kancelaria.officesystem.model.entity.Case;
import com.kancelaria.officesystem.model.entity.File;
import com.kancelaria.officesystem.model.entity.User;
import com.kancelaria.officesystem.model.enums.CaseStatus;
import com.kancelaria.officesystem.repository.CaseRepository;
import com.kancelaria.officesystem.repository.FileRepository;
import com.kancelaria.officesystem.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDate;
import java.util.*;
import java.util.stream.Collectors;

@RestController
@RequiredArgsConstructor
@RequestMapping("office/reports")
public class ReportController {

    private final CaseRepository caseRepository;
    private final FileRepository fileRepository;
    private final UserRepository userRepository;

//    ==================================DASHBOARD==================================
    @GetMapping("/dashboard")
    @Transactional(readOnly = true)
    public ResponseEntity<?> getDashboardStats() {
        List<Case> allCases = caseRepository.findAll();
        long paidCount = allCases.stream().filter(c -> c.getStatus() == CaseStatus.CLOSED).count();
        long unpaidCount = allCases.stream().filter(c -> c.getStatus() != CaseStatus.CLOSED).count();

        double totalRevenue = allCases.stream()
                .filter(c -> c.getStatus() == CaseStatus.CLOSED)
                .mapToDouble(c -> c.getFineAmount() != null ? c.getFineAmount().doubleValue() : 0.0).sum();

        List<Map<String, Object>> weekData = List.of(
                Map.of("label", "Mon", "revenue", totalRevenue * 0.1),
                Map.of("label", "Tue", "revenue", totalRevenue * 0.15),
                Map.of("label", "Wed", "revenue", totalRevenue * 0.2),
                Map.of("label", "Thu", "revenue", totalRevenue * 0.12),
                Map.of("label", "Fri", "revenue", totalRevenue * 0.3)
        );

        List<Map<String, Object>> monthData = List.of(
                Map.of("label", "Jan", "revenue", totalRevenue * 0.15),
                Map.of("label", "Feb", "revenue", totalRevenue * 0.12),
                Map.of("label", "Mar", "revenue", totalRevenue * 0.20),
                Map.of("label", "Apr", "revenue", totalRevenue * 0.18),
                Map.of("label", "May", "revenue", totalRevenue * 0.25),
                Map.of("label", "Jun", "revenue", totalRevenue * 0.10)
        );

        List<Map<String, Object>> yearData = List.of(
                Map.of("label", "2023", "revenue", totalRevenue * 0.8),
                Map.of("label", "2024", "revenue", totalRevenue * 0.95),
                Map.of("label", "2025", "revenue", totalRevenue * 1.1),
                Map.of("label", "2026", "revenue", totalRevenue)
        );

        Map<String, Object> stats = new HashMap<>();
        stats.put("paidCount", paidCount);
        stats.put("unpaidCount", unpaidCount);
        stats.put("totalRevenue", totalRevenue);

        Map<String, Object> charts = new HashMap<>();
        charts.put("week", weekData);
        charts.put("month", monthData);
        charts.put("year", yearData);
        stats.put("charts", charts);

        return ResponseEntity.ok(stats);
    }

    /**
     * 1. FINANCIAL_REPORT
\     */
    @Transactional(readOnly = true)
    @GetMapping("/financial")
    public ResponseEntity<?> getFinancialReport(
            @RequestParam("startDate") @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam("endDate") @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate) {

        List<Case> cases = caseRepository.findAll().stream()
                .filter(c -> c.getViolationDate() != null &&
                        !c.getViolationDate().isBefore(startDate) && !c.getViolationDate().isAfter(endDate))
                .toList();

        List<Map<String, Object>> tableData = cases.stream().map(c -> {
            Map<String, Object> row = new HashMap<>();
            row.put("caseId", c.getNumberCase());
            row.put("driverName", c.getDriver() != null ? c.getDriver().getName() + " " + c.getDriver().getSurname() : "—");
            row.put("fineAmount", c.getFineAmount());
            row.put("isPaid", c.getStatus() == CaseStatus.CLOSED); // CLOSED расцениваем как оплачено
            return row;
        }).toList();

        double totalPaid = cases.stream()
                .filter(c -> c.getStatus() == CaseStatus.CLOSED)
                .mapToDouble(c -> c.getFineAmount() != null ? c.getFineAmount().doubleValue() : 0.0)
                .sum();

        double totalUnpaid = cases.stream()
                .filter(c -> c.getStatus() != CaseStatus.CLOSED)
                .mapToDouble(c -> c.getFineAmount() != null ? c.getFineAmount().doubleValue() : 0.0)
                .sum();

        Map<String, Object> response = new HashMap<>();
        response.put("tableData", tableData);
        response.put("totalPaid", totalPaid);
        response.put("totalUnpaid", totalUnpaid);

        return ResponseEntity.ok(response);
    }

    /**
     * 2. CASE_STATUS_REPORT
     * Группирует дела по статусам за определенный период.
     */
    @GetMapping("/status-summary")
    public ResponseEntity<?> getCaseStatusReport(
            @RequestParam("startDate") @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam("endDate") @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate) {

        List<Case> cases = caseRepository.findAll().stream()
                .filter(c -> c.getViolationDate() != null &&
                        !c.getViolationDate().isBefore(startDate) && !c.getViolationDate().isAfter(endDate))
                .toList();

        // Группируем
        Map<CaseStatus, List<Case>> grouped = cases.stream()
                .collect(Collectors.groupingBy(Case::getStatus));

        List<Map<String, Object>> reportRows = Arrays.stream(CaseStatus.values()).map(status -> {
            List<Case> list = grouped.getOrDefault(status, Collections.emptyList());
            double sum = list.stream()
                    .mapToDouble(c -> c.getFineAmount() != null ? c.getFineAmount().doubleValue() : 0.0)
                    .sum();

            Map<String, Object> row = new HashMap<>();
            row.put("status", status.name());
            row.put("count", list.size());
            row.put("totalAmount", sum);
            return row;
        }).toList();

        return ResponseEntity.ok(reportRows);
    }

    /**
     * 3. EMPLOYEE_PERFORMANCE_REPORT
     * KPI менеджеров: сгенерированные файлы, активные и закрытые дела.
     */
    @GetMapping("/employee-performance")
    public ResponseEntity<?> getEmployeePerformanceReport() {
        List<User> employees = userRepository.findAll();
        List<Case> allCases = caseRepository.findAll();
        List<File> allFiles = fileRepository.findAll();

        List<Map<String, Object>> performanceData = employees.stream().map(emp -> {
            // Сколько файлов сгенерировал (связь по user_id)
            long filesCount = allFiles.stream()
                    .filter(f -> f.getGeneratedBy() != null && f.getGeneratedBy().getUserId().equals(emp.getUserId()))
                    .count();

            // Сколько дел ведет данный сотрудник
            List<Case> empCases = allCases.stream()
                    .filter(c -> c.getEmployee() != null && c.getEmployee().getUserId().equals(emp.getUserId()))
                    .toList();

            long closedCount = empCases.stream().filter(c -> c.getStatus() == CaseStatus.CLOSED).count();
            long inProgressCount = empCases.stream().filter(c -> c.getStatus() == CaseStatus.IN_PROGRESS).count();

            Map<String, Object> row = new HashMap<>();
            row.put("employeeName", emp.getName() + " " + emp.getSurname());
            row.put("filesGenerated", filesCount);
            row.put("totalCasesOwned", empCases.size());
            row.put("casesClosed", closedCount);
            row.put("casesInProgress", inProgressCount);
            return row;
        }).toList();

        return ResponseEntity.ok(performanceData);
    }

    /**
     * 4. MONTHLY_SUMMARY
     * Агрегированные показатели за конкретный месяц и год.
     */
    @GetMapping("/monthly-summary")
    public ResponseEntity<?> getMonthlySummary(
            @RequestParam("year") int year,
            @RequestParam("month") int month) {

        List<Case> allCases = caseRepository.findAll();

        // Фильтруем дела, созданные в указанный месяц/год (по дате нарушения или регистрации)
        List<Case> monthlyCases = allCases.stream()
                .filter(c -> c.getViolationDate() != null
                        && c.getViolationDate().getYear() == year
                        && c.getViolationDate().getMonthValue() == month)
                .toList();

        long newCasesCount = monthlyCases.size();
        long closedCasesCount = monthlyCases.stream().filter(c -> c.getStatus() == CaseStatus.CLOSED).count();

        double totalFinesCharged = monthlyCases.stream()
                .mapToDouble(c -> c.getFineAmount() != null ? c.getFineAmount().doubleValue() : 0.0)
                .sum();

        double totalFinesPaid = monthlyCases.stream()
                .filter(c -> c.getStatus() == CaseStatus.CLOSED)
                .mapToDouble(c -> c.getFineAmount() != null ? c.getFineAmount().doubleValue() : 0.0)
                .sum();

        // Считаем сколько всего сейчас вообще в архиве (CLOSED) глобально
        long totalInArchive = allCases.stream().filter(c -> c.getStatus() == CaseStatus.CLOSED).count();
        long totalRegisteredAllTime = allCases.size();

        Map<String, Object> summary = new HashMap<>();
        summary.put("newCases", newCasesCount);
        summary.put("closedCases", closedCasesCount);
        summary.put("finesCharged", totalFinesCharged);
        summary.put("finesPaid", totalFinesPaid);
        summary.put("totalRegistered", totalRegisteredAllTime);
        summary.put("totalInArchive", totalInArchive);

        return ResponseEntity.ok(summary);
    }

    /**
     * 5. COURT_REPORT
     * Список всех дел, дошедших до стадии IN_COURT.
     */
    @GetMapping("/court-cases")
    public ResponseEntity<?> getCourtReport() {
        List<Case> courtCases = caseRepository.findAll().stream()
                .filter(c -> c.getStatus() == CaseStatus.IN_COURT)
                .toList();

        List<Map<String, Object>> reportData = courtCases.stream().map(c -> {
            Map<String, Object> row = new HashMap<>();
            row.put("caseId", c.getNumberCase());
            row.put("driverName", c.getDriver() != null ? c.getDriver().getName() + " " + c.getDriver().getSurname() : "—");

            String vehicleInfo = "—";
            if (c.getVehicle() != null) {
                vehicleInfo = String.format("%s %s (%s)",
                        c.getVehicle().getBrand(),
                        c.getVehicle().getModel(),
                        c.getVehicle().getPlateNumber());
            }
            row.put("vehicleInfo", vehicleInfo);
            row.put("claimAmount", c.getFineAmount()); // Сумма иска равна сумме штрафа
            return row;
        }).toList();

        return ResponseEntity.ok(reportData);
    }
}