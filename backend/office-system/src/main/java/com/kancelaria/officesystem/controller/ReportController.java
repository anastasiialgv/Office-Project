package com.kancelaria.officesystem.controller;

import com.kancelaria.officesystem.service.ReportService;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDate;

@RestController
@RequiredArgsConstructor
@RequestMapping("office/reports")
public class ReportController {
    private final ReportService reportService;

    //    ==================================DASHBOARD==================================
    @GetMapping("/dashboard")
    public ResponseEntity<?> getDashboardStats() {
        return ResponseEntity.ok(reportService.getDashboardStats());
    }

    // FINANCIAL REPORT

    @GetMapping("/financial")
    public ResponseEntity<?> getFinancialReport(
            @RequestParam("startDate") @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam("endDate") @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate) {
        return ResponseEntity.ok(reportService.getFinancialReport(startDate, endDate));
    }

    // CASE STATUS REPORT

    @GetMapping("/status-summary")
    public ResponseEntity<?> getCaseStatusReport(
            @RequestParam("startDate") @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam("endDate") @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate) {
        return ResponseEntity.ok(reportService.getCaseStatusReport(startDate, endDate));
    }

    // EMPLOYEE PERFORMANCE REPORT

    @GetMapping("/employee-performance")
    public ResponseEntity<?> getEmployeePerformanceReport() {
        return ResponseEntity.ok(reportService.getEmployeePerformanceReport());
    }

    // MONTHLY SUMMARY

    @GetMapping("/monthly-summary")
    public ResponseEntity<?> getMonthlySummary(
            @RequestParam("year") int year,
            @RequestParam("month") int month) {
        return ResponseEntity.ok(reportService.getMonthlySummary(year, month));
    }

    // COURT REPORT

    @GetMapping("/court-cases")
    public ResponseEntity<?> getCourtReport() {
        return ResponseEntity.ok(reportService.getCourtReport());
    }
}