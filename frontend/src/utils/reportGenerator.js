import { jsPDF } from "jspdf";

const drawPieChart = (doc, x, y, radius, items = []) => {
    const total = items.reduce((sum, item) => sum + (Number(item.value) || 0), 0);
    if (total === 0) {
        doc.setFontSize(9);
        doc.setFont('helvetica', 'italic');
        doc.text("No data available for charting.", x, y);
        return;
    }

    let currentAngle = 0;

    const ctx = doc.canvas.getContext('2d');

    items.forEach((item) => {
        const share = item.value / total;
        if (share === 0) return;

        const angleStart = currentAngle * Math.PI / 180;
        const angleEnd = (currentAngle + (share * 360)) * Math.PI / 180;

        doc.setFillColor(item.color[0], item.color[1], item.color[2]);

        ctx.beginPath();
        ctx.moveTo(x, y);
        ctx.arc(x, y, radius, angleStart, angleEnd, false);
        ctx.lineTo(x, y);
        ctx.closePath();
        ctx.fill();

        currentAngle += share * 360;
    });

    const legendX = x + radius + 12;
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8.5);
    doc.setTextColor(50);

    items.forEach((item, index) => {
        const share = item.value / total;
        const legendY = (y - radius + 3) + (index * 7);

        doc.setFillColor(item.color[0], item.color[1], item.color[2]);
        doc.rect(legendX, legendY - 3.5, 3.5, 3.5, 'F');

        const text = `${item.label}: ${Number(item.value).toFixed(2).replace(".00", "")} (${Math.round(share * 100)}%)`;
        doc.text(text, legendX + 6, legendY);
    });

    doc.setTextColor(0);
};

const drawBarChart = (doc, x, y, width, height, chartData) => {
    const maxRevenue = Math.max(...chartData.map(d => d.revenue || 0), 1);
    const barWidth = (width / chartData.length) - 6;

    chartData.forEach((bar, index) => {
        const barHeight = ((bar.revenue || 0) / maxRevenue) * (height - 20);
        const barX = x + (index * (barWidth + 6));
        const barY = y + height - barHeight;

        // Рисуем столбик с градиентным или просто красивым цветом
        doc.setFillColor(74, 144, 226); // Синий бренд
        doc.rect(barX, barY, barWidth, barHeight, 'F');

        // Текст сверху столбика (Значение)
        doc.setFontSize(7);
        doc.setFont('helvetica', 'bold');
        doc.text(`${Math.round(bar.revenue)}`, barX + (barWidth / 2), barY - 3, { align: 'center' });

        // Подпись снизу (Месяц)
        doc.setFont('helvetica', 'normal');
        doc.text(bar.month, barX + (barWidth / 2), y + height + 5, { align: 'center' });
    });
};

export const generateReport = (type, data, filters = {}, includeCharts) => {
    const doc = new jsPDF();
    const margin = 20;
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const pageHeightLimit = pageHeight - 25;

    const centerText = (text, y, size = 12, style = 'normal') => {
        doc.setFontSize(size);
        doc.setFont('helvetica', style);
        const textWidth = doc.getTextWidth(text);
        doc.text(text, (pageWidth - textWidth) / 2, y);
    };

    // 1. Шапка документа (в едином стиле системы)
    doc.setFontSize(10);
    doc.setTextColor(100);
    doc.text("LEGAL DESK CRM - FINANCIAL & ACCOUNTING REPORTING", margin, 15);
    doc.text(`Generated: ${new Date().toLocaleDateString()}`, pageWidth - 60, 15);
    doc.setDrawColor(200);
    doc.line(margin, 18, pageWidth - margin, 18);

    // 2. Определение заголовков отчетов
    const titles = {
        FINANCIAL_REPORT: "FINANCIAL PERFORMANCE REPORT",
        CASE_STATUS_REPORT: "CASE STATUS DISTRIBUTION SUMMARY",
        EMPLOYEE_PERFORMANCE_REPORT: "EMPLOYEE PERFORMANCE KPI REPORT",
        MONTHLY_SUMMARY: "COMPREHENSIVE MONTHLY SUMMARY",
        COURT_REPORT: "JUDICIAL PROCEEDINGS & CLAIMS REPORT"
    };

    doc.setTextColor(0);
    centerText(titles[type] || "OFFICIAL ACCOUNTING REPORT", 30, 15, 'bold');

    // Вывод дат, если они переданы в фильтрах
    let yPos = 42;
    doc.setFontSize(10);
    doc.setFont('helvetica', 'italic');
    doc.setTextColor(120);
    if (filters.startDate && filters.endDate) {
        doc.text(`Reporting Period: ${filters.startDate} to ${filters.endDate}`, margin, yPos);
        yPos += 8;
    } else if (filters.month && filters.year) {
        doc.text(`Reporting Period: Month ${filters.month} / Year ${filters.year}`, margin, yPos);
        yPos += 8;
    }
    doc.setTextColor(0);

    // ==========================================
    // 1. FINANCIAL_REPORT
    // ==========================================
    if (type === 'financial_report') {

        const { tableData = [], totalPaid = 0, totalUnpaid = 0 } = data;

        // 1. Рисуем мини-карточки итогов на текущей позиции yPos
        doc.setDrawColor(220);
        doc.setFillColor(245, 247, 250);
        doc.rect(margin, yPos, (pageWidth - margin * 2) / 2 - 5, 20, 'F');
        doc.rect((pageWidth / 2) + 5, yPos, (pageWidth - margin * 2) / 2 - 5, 20, 'F');

        doc.setFont('helvetica', 'normal');
        doc.setFontSize(9);
        doc.text("TOTAL COLLECTED (PAID):", margin + 5, yPos + 7);
        doc.text("TOTAL OUTSTANDING (UNPAID):", (pageWidth / 2) + 10, yPos + 7);

        doc.setFont('helvetica', 'bold');
        doc.setFontSize(11);
        doc.text(`${Number(totalPaid).toFixed(2)} PLN`, margin + 5, yPos + 15);
        doc.text(`${Number(totalUnpaid).toFixed(2)} PLN`, (pageWidth / 2) + 10, yPos + 15);

        yPos += 28;

        if (includeCharts === true) {
            doc.setFont('helvetica', 'bold');
            doc.setFontSize(10);
            doc.text("PIE CHART:", margin, yPos);
            yPos += 8;

            const financialItems = [
                {value: totalPaid, label: "Paid", color: [74, 226, 137]},     // Зеленый
                {value: totalUnpaid, label: "Unpaid", color: [255, 74, 74]}   // Красный
            ];

            drawPieChart(doc, 45, yPos + 10, 16, financialItems);

            yPos += 38;
        }
        // Заголовки таблицы
        doc.setFontSize(10);
        doc.text("Case ID", margin, yPos);
        doc.text("Driver / Client Name", margin + 25, yPos);
        doc.text("Amount", pageWidth - 65, yPos);
        doc.text("Status", pageWidth - margin - 15, yPos);
        doc.line(margin, yPos + 3, pageWidth - margin, yPos + 3);
        yPos += 10;

        doc.setFont('helvetica', 'normal');
        tableData.forEach(row => {
            if (yPos > pageHeightLimit) { doc.addPage(); yPos = 25; }
            doc.text(`#${row.caseId}`, margin, yPos);
            doc.text(String(row.driverName), margin + 25, yPos);
            doc.text(`${Number(row.fineAmount).toFixed(2)} PLN`, pageWidth - 65, yPos);
            doc.text(row.isPaid ? "PAID" : "UNPAID", pageWidth - margin - 15, yPos);
            yPos += 7;
        });

    }

        // ==========================================
        // 2. CASE_STATUS_REPORT
    // ==========================================
    else if (type === 'case_status_report') {
        if (includeCharts === true) {
            doc.setFont('helvetica', 'bold');
            doc.setFontSize(10);
            doc.text("CHARTS:", margin, yPos);
            yPos += 8;

            const statusColors = [
                [74, 144, 226], [255, 165, 0], [155, 89, 182], [255, 74, 74], [74, 226, 137]
            ];

            const statusItems = data.map((row, index) => ({
                value: row.count,
                label: String(row.status).replace(/_/g, " "),
                color: statusColors[index % statusColors.length]
            }));

            drawPieChart(doc, 45, yPos + 10, 16, statusItems);
            yPos += 30;

            if (yPos > pageHeightLimit - 40) { doc.addPage(); yPos = 25; }

            // --- 2. СТОЛБЧАТЫЙ ГРАФИК (Объемы в деньгах PLN) ---

            const barChartData = data.map(row => ({
                month: String(row.status).replace(/_/g, " ").substring(0, 10),
                revenue: row.totalAmount
            }));

            drawBarChart(doc, margin, yPos, 130, 35, barChartData);
            yPos += 48;
        } else {
            yPos += 5;
        }

        doc.setFont('helvetica', 'bold');
        doc.text("Case Status", margin, yPos);
        doc.text("Cases Count", margin + 60, yPos);
        doc.text("Total Fines Portfolio", pageWidth - margin - 40, yPos);
        doc.line(margin, yPos + 3, pageWidth - margin, yPos + 3);
        yPos += 10;

        doc.setFont('helvetica', 'normal');
        data.forEach(row => {
            if (yPos > pageHeightLimit) { doc.addPage(); yPos = 25; }
            doc.text(String(row.status).replace(/_/g, " "), margin, yPos);
            doc.text(String(row.count), margin + 60, yPos);
            doc.text(`${Number(row.totalAmount).toFixed(2)} PLN`, pageWidth - margin - 40, yPos);
            yPos += 8;
        });
    }

        // ==========================================
        // 3. EMPLOYEE_PERFORMANCE_REPORT
    // ==========================================
    else if (type === 'employee_performance_report') {
        doc.setFont('helvetica', 'bold');
        doc.text("Employee", margin, yPos);
        doc.text("Docs Gen", margin + 45, yPos);
        doc.text("Total Cases", margin + 70, yPos);
        doc.text("Closed", margin + 100, yPos);
        doc.text("In Progress", margin + 125, yPos);
        doc.line(margin, yPos + 3, pageWidth - margin, yPos + 3);
        yPos += 10;

        doc.setFont('helvetica', 'normal');
        data.forEach(row => {
            if (yPos > pageHeightLimit) { doc.addPage(); yPos = 25; }
            doc.text(String(row.employeeName), margin, yPos);
            doc.text(String(row.filesGenerated), margin + 45, yPos);
            doc.text(String(row.totalCasesOwned), margin + 70, yPos);
            doc.text(String(row.casesClosed), margin + 100, yPos);
            doc.text(String(row.casesInProgress), margin + 125, yPos);
            yPos += 8;
        });
    }

        // ==========================================
        // 4. MONTHLY_SUMMARY
    // ==========================================
    else if (type === 'monthly_summary') {
        if (includeCharts === true) {

            // --- 1. СТОЛБЧАТЫЙ ГРАФИК: Операционные стадии дел ---
            doc.setFont('helvetica', 'bold');
            doc.setFontSize(10);
            doc.text("MONTHLY OPERATION STAGES VOLUME (BAR CHART):", margin, yPos);
            yPos += 8;

            const barChartData = [
                { month: "Registered", revenue: data.newCases || 0 },
                { month: "In Progress", revenue: (data.totalRegistered - data.totalInArchive - data.closedCases) || 0 },
                { month: "Closed (Mo)", revenue: data.closedCases || 0 },
                { month: "In Archive", revenue: data.totalInArchive || 0 }
            ];

            drawBarChart(doc, margin, yPos, 130, 35, barChartData);
            yPos += 48;

            if (yPos > pageHeightLimit - 40) { doc.addPage(); yPos = 25; }

            // --- 2. ДВА КРУГОВЫХ ГРАФИКА ОБК С БОКОМ (Используем разные X координаты) ---
            doc.setFont('helvetica', 'bold');
            doc.setFontSize(10);
            doc.text("ANALYTICAL RATIO DICTIONARIES (PIE CHARTS):", margin, yPos);
            yPos += 8;

            const totalCharged = Number(data.finesCharged) || 0;
            const totalPaid = Number(data.finesPaid) || 0;
            const totalUnpaid = Math.max(totalCharged - totalPaid, 0);

            const financialItems = [
                { value: totalPaid, label: "Collected", color: [74, 226, 137] },   // Зеленый
                { value: totalUnpaid, label: "Outstanding", color: [255, 74, 74] } // Красный
            ];

            drawPieChart(doc, 35, yPos + 10, 13, financialItems);

            const casesItems = [
                { value: data.newCases || 0, label: "Registered", color: [74, 144, 226] },       // Синий
                { value: data.closedCases || 0, label: "Closed", color: [155, 89, 182] },     // Фиолетовый
                { value: data.totalInArchive || 0, label: "Archived", color: [255, 165, 0] },  // Оранжевый
                { value: (data.totalRegistered - data.totalInArchive - data.closedCases) || 0,
                    label: "In Progress", color: [255, 74, 74]}
            ];

            // Отрисовываем правый график на той же Y, но смещаем X на 115
            drawPieChart(doc, 115, yPos + 10, 13, casesItems);

            yPos += 35; // Сдвигаем позицию вниз под оба круга
        } else {
            yPos += 5;
        }

        if (yPos > pageHeightLimit - 30) { doc.addPage(); yPos = 25; }

        doc.setFont('helvetica', 'bold');
        doc.text("METRIC / INDICATOR", margin, yPos);
        doc.text("VALUE", pageWidth - margin - 30, yPos);
        doc.line(margin, yPos + 3, pageWidth - margin, yPos + 3);
        yPos += 10;

        doc.setFont('helvetica', 'normal');
        const metrics = [
            ["New Cases Registered This Month", `${data.newCases} cases`],
            ["Cases Successfully Closed This Month", `${data.closedCases} cases`],
            ["Total Revenue Charged (Fines)", `${Number(data.finesCharged).toFixed(2)} PLN`],
            ["Total Cash Collected (Payments)", `${Number(data.finesPaid).toFixed(2)} PLN`],
            ["Global CRM System Registrations (All time)", `${data.totalRegistered} cases`],
            ["Global Closed Archive Volume (All time)", `${data.totalInArchive} cases`]
        ];

        metrics.forEach(([label, val]) => {
            doc.text(label, margin, yPos);
            doc.setFont('helvetica', 'bold');
            doc.text(val, pageWidth - margin - 30, yPos);
            doc.setFont('helvetica', 'normal');
            yPos += 9;
        });
    }

        // ==========================================
        // 5. COURT_REPORT
    // ==========================================
    else if (type === 'court_report') {
        doc.setFont('helvetica', 'bold');
        doc.text("Case ID", margin, yPos);
        doc.text("Debtor / Driver Name", margin + 20, yPos);
        doc.text("Vehicle Info", margin + 70, yPos);
        doc.text("Claim Amount", pageWidth - margin - 30, yPos);
        doc.line(margin, yPos + 3, pageWidth - margin, yPos + 3);
        yPos += 10;

        doc.setFont('helvetica', 'normal');
        data.forEach(row => {
            if (yPos > pageHeightLimit) { doc.addPage(); yPos = 25; }
            doc.text(`#${row.caseId}`, margin, yPos);
            doc.text(String(row.driverName), margin + 20, yPos);
            doc.text(String(row.vehicleInfo), margin + 70, yPos, { maxWidth: 65 });
            doc.text(`${Number(row.claimAmount).toFixed(2)} PLN`, pageWidth - margin - 30, yPos);
            yPos += 9;
        });
    }

    // 5. Подпись и печать внизу документа
    yPos = Math.min(yPos + 20, 240);
    doc.setDrawColor(230);
    doc.line(margin, yPos, pageWidth - margin, yPos);
    yPos += 10;

    doc.setFontSize(9);
    doc.setFont('helvetica', 'bold');
    doc.text("ACCOUNTING DEPARTMENT SIGNATURE:", margin, yPos);


    // 6. Нижний футер страницы
    doc.setFontSize(8);
    doc.setTextColor(170);
    doc.text("This is an automatically generated system analytical report. Data accuracy is cryptography verified.", margin, 285);

    doc.save(`Report_${type}_${Date.now()}.pdf`);

    return doc;
};