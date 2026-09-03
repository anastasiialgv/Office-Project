package com.kancelaria.officesystem.service;

import com.kancelaria.officesystem.model.entity.Case;
import com.kancelaria.officesystem.model.entity.File;
import com.kancelaria.officesystem.model.entity.User;
import com.kancelaria.officesystem.model.enums.CaseStatus;
import com.kancelaria.officesystem.repository.CaseRepository;
import com.kancelaria.officesystem.repository.FileRepository;
import com.kancelaria.officesystem.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ReportService {

    private final CaseRepository caseRepository;
    private final FileRepository fileRepository;
    private final UserRepository userRepository;

    @Transactional(readOnly = true)
    public Map<String, Object> getDashboardStats() {
        List<Case> allCases = caseRepository.findAll();

        long paidCount = allCases.stream().filter(c -> c.getStatus() == CaseStatus.CLOSED).count();
        long unpaidCount = allCases.stream().filter(c -> c.getStatus() != CaseStatus.CLOSED).count();

        double totalRevenue = allCases.stream()
                .filter(c -> c.getStatus() == CaseStatus.CLOSED)
                .mapToDouble(c -> c.getFineAmount() != null ? c.getFineAmount().doubleValue() : 0.0).sum();

        // week
        java.time.format.DateTimeFormatter dayFormatter = java.time.format.DateTimeFormatter.ofPattern("EEE", java.util.Locale.ENGLISH);
        Map<String, Double> weeklyMap = allCases.stream()
                .filter(c -> c.getStatus() == CaseStatus.CLOSED && c.getViolationDate() != null)
                .collect(java.util.stream.Collectors.groupingBy(
                        c -> c.getViolationDate().format(dayFormatter),
                        java.util.stream.Collectors.summingDouble(c -> c.getFineAmount() != null ? c.getFineAmount().doubleValue() : 0.0)
                ));

        List<String> daysOrder = List.of("Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun");
        List<Map<String, Object>> weekData = daysOrder.stream().map(day -> {
            Map<String, Object> item = new HashMap<>();
            item.put("label", day);
            item.put("revenue", weeklyMap.getOrDefault(day, 0.0));
            return item;
        }).toList();

        // month
        java.time.format.DateTimeFormatter monthFormatter = java.time.format.DateTimeFormatter.ofPattern("MMM", java.util.Locale.ENGLISH);
        Map<String, Double> monthlyMap = allCases.stream()
                .filter(c -> c.getStatus() == CaseStatus.CLOSED && c.getViolationDate() != null)
                .collect(java.util.stream.Collectors.groupingBy(
                        c -> c.getViolationDate().format(monthFormatter),
                        java.util.stream.Collectors.summingDouble(c -> c.getFineAmount() != null ? c.getFineAmount().doubleValue() : 0.0)
                ));

        List<String> monthsOrder = List.of("Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec");
        List<Map<String, Object>> monthData = monthsOrder.stream().map(month -> {
            Map<String, Object> item = new HashMap<>();
            item.put("label", month);
            item.put("revenue", monthlyMap.getOrDefault(month, 0.0));
            return item;
        }).toList();

        // year
        Map<String, Double> yearlyMap = allCases.stream()
                .filter(c -> c.getStatus() == CaseStatus.CLOSED && c.getViolationDate() != null)
                .collect(java.util.stream.Collectors.groupingBy(
                        c -> String.valueOf(c.getViolationDate().getYear()),
                        java.util.stream.Collectors.summingDouble(c -> c.getFineAmount() != null ? c.getFineAmount().doubleValue() : 0.0)
                ));

        List<Map<String, Object>> yearData = yearlyMap.entrySet().stream()
                .sorted(Map.Entry.comparingByKey())
                .map(entry -> {
                    Map<String, Object> item = new HashMap<>();
                    item.put("label", entry.getKey());
                    item.put("revenue", entry.getValue());
                    return item;
                }).toList();

        Map<String, Object> stats = new HashMap<>();
        stats.put("paidCount", paidCount);
        stats.put("unpaidCount", unpaidCount);
        stats.put("totalRevenue", totalRevenue);

        Map<String, Object> charts = new HashMap<>();
        charts.put("week", weekData);
        charts.put("month", monthData);
        charts.put("year", yearData);
        stats.put("charts", charts);

        return stats;
    }

    @Transactional(readOnly = true)
    public Map<String, Object> getFinancialReport(LocalDate startDate, LocalDate endDate) {
        List<Case> cases = caseRepository.findAll().stream()
                .filter(c -> c.getViolationDate() != null &&
                        !c.getViolationDate().isBefore(startDate) && !c.getViolationDate().isAfter(endDate))
                .toList();

        List<Map<String, Object>> tableData = cases.stream().map(c -> {
            Map<String, Object> row = new HashMap<>();
            row.put("caseId", c.getNumberCase());
            row.put("driverName", c.getDriver() != null ? c.getDriver().getName() + " " + c.getDriver().getSurname() : "—");
            row.put("fineAmount", c.getFineAmount());
            row.put("isPaid", c.getStatus() == CaseStatus.CLOSED);
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

        return response;
    }

    @Transactional(readOnly = true)
    public List<Map<String, Object>> getCaseStatusReport(LocalDate startDate, LocalDate endDate) {
        List<Case> cases = caseRepository.findAll().stream()
                .filter(c -> c.getViolationDate() != null &&
                        !c.getViolationDate().isBefore(startDate) && !c.getViolationDate().isAfter(endDate))
                .toList();

        Map<CaseStatus, List<Case>> grouped = cases.stream()
                .collect(Collectors.groupingBy(Case::getStatus));

        return Arrays.stream(CaseStatus.values()).map(status -> {
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
    }

    @Transactional(readOnly = true)
    public List<Map<String, Object>> getEmployeePerformanceReport() {
        List<User> employees = userRepository.findAll();
        List<Case> allCases = caseRepository.findAll();
        List<File> allFiles = fileRepository.findAll();

        return employees.stream().map(emp -> {
            long filesCount = allFiles.stream()
                    .filter(f -> f.getGeneratedBy() != null && f.getGeneratedBy().getUserId().equals(emp.getUserId()))
                    .count();

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
    }

    @Transactional(readOnly = true)
    public Map<String, Object> getMonthlySummary(int year, int month) {
        List<Case> allCases = caseRepository.findAll();

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

        long totalInArchive = allCases.stream().filter(c -> c.getStatus() == CaseStatus.CLOSED).count();
        long totalRegisteredAllTime = allCases.size();

        Map<String, Object> summary = new HashMap<>();
        summary.put("newCases", newCasesCount);
        summary.put("closedCases", closedCasesCount);
        summary.put("finesCharged", totalFinesCharged);
        summary.put("finesPaid", totalFinesPaid);
        summary.put("totalRegistered", totalRegisteredAllTime);
        summary.put("totalInArchive", totalInArchive);

        return summary;
    }

    @Transactional(readOnly = true)
    public List<Map<String, Object>> getCourtReport() {
        List<Case> courtCases = caseRepository.findAll().stream()
                .filter(c -> c.getStatus() == CaseStatus.IN_COURT)
                .toList();

        return courtCases.stream().map(c -> {
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
            row.put("claimAmount", c.getFineAmount());
            return row;
        }).toList();
    }
}
