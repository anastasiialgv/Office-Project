import { jsPDF } from "jspdf";
/**
 * Генерирует PDF документ на основе типа и данных кейса.
 * @param {string} type - ID шаблона (pay_demand, official_note и т.д.)
 * @param {object} data - Основные данные кейса (caseData)
 * @param {object} formData - Данные из модального окна (для интерактивных документов)
 */
export const generateCasePDF = (type, data, formData = {}) => {
    const doc = new jsPDF();
    const margin = 20;
    const pageWidth = doc.internal.pageSize.getWidth();

    // Вспомогательная функция для центрирования текста
    const centerText = (text, y, size = 12, style = 'normal') => {
        doc.setFontSize(size);
        doc.setFont('helvetica', style);
        const textWidth = doc.getTextWidth(text);
        doc.text(text, (pageWidth - textWidth) / 2, y);
    };

    // 1. Шапка документа (Верхний колонтитул)
    doc.setFontSize(10);
    doc.setTextColor(100);
    doc.text("LEGAL DESK CRM - AUTOMATED SYSTEM", margin, 15);
    doc.text(`Date: ${new Date().toLocaleDateString()}`, pageWidth - 50, 15);
    doc.setDrawColor(200);
    doc.line(margin, 18, pageWidth - margin, 18);

    // 2. Заголовок документа
    const titles = {
        pay_demand: "PAYMENT DEMAND NOTICE",
        pre_court: "FINAL PRE-LITIGATION SETTLEMENT DEMAND",
        mail_labels: "MAIL ADDRESS LABEL",
        court_notice: "NOTICE OF CASE REFERRAL TO COURT",
        official_note: "OFFICIAL INTERNAL NOTE",
        contact_report: "CLIENT CONTACT REPORT"
    };

    doc.setTextColor(0);
    centerText(titles[type] || "OFFICIAL DOCUMENT", 35, 16, 'bold');

    // 3. Данные получателя / Кейса
    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.text("CASE DETAILS:", margin, 50);
    doc.setFont('helvetica', 'normal');
    doc.text(`Case ID: #${data.id}`, margin, 57);
    doc.text(`Recipient: ${data.fullname}`, margin, 63);
    doc.text(`Address: ${data.address}`, margin, 69);

    doc.line(margin, 75, pageWidth - margin, 75);

    // 4. Основное содержание (Контент зависит от типа)
    let yPos = 85;
    doc.setFontSize(11);

    if (type === 'pay_demand') {
        const text = [
            `Subject: Formal Demand for Payment`,
            `Violation Date: ${data.violation}`,
            "",
            `Our records indicate that the amount of ${data.fine} PLN remains unpaid.`,
            `Please settle this debt by the deadline: ${data.due}.`,
            "",
            "Payment Details:",
            "Bank: Global Union Bank",
            "Account: PL 00 1234 5678 9012 3456 7890",
            `Reference: CASE_${data.id}`
        ];
        text.forEach(line => { doc.text(line, margin, yPos); yPos += 7; });
    }

    else if (type === 'pre_court') {
        doc.setTextColor(200, 0, 0);
        centerText("FINAL NOTICE - LEGAL ACTION PENDING", yPos, 12, 'bold');
        doc.setTextColor(0, 0, 0);
        yPos += 15;
        const text = [
            `Despite previous notices, we have not received payment for Case #${data.id}.`,
            `Total debt: ${data.fine} PLN.`,
            "",
            `If payment is not received within 7 days, we will initiate legal proceedings.`,
            `Court and legal representation fees will be added to your total debt.`
        ];
        text.forEach(line => { doc.text(line, margin, yPos); yPos += 7; });
    }

    else if (type === 'court_notice') {
        doc.text(`This is to inform that the case has been referred to:`, margin, yPos);
        yPos += 8;
        doc.setFont('helvetica', 'bold');
        doc.text(`${formData.court || "[Court Name Not Specified]"}`, margin, yPos);
        doc.setFont('helvetica', 'normal');
        yPos += 15;
        doc.text("Further correspondence will be handled by the court office.", margin, yPos);
    }

    else if (type === 'official_note') {
        doc.setFont('helvetica', 'bold');
        doc.text("NOTE CONTENT:", margin, yPos);
        yPos += 8;
        doc.setFont('helvetica', 'normal');
        // Автоматический перенос длинного текста
        const splitNote = doc.splitTextToSize(formData.note || "No content provided.", pageWidth - margin * 2);
        doc.text(splitNote, margin, yPos);
    }

    else if (type === 'contact_report') {
        doc.text(`Contact Method: ${formData.method || "N/A"}`, margin, yPos);
        yPos += 10;
        doc.setFont('helvetica', 'bold');
        doc.text("Summary of Interaction:", margin, yPos);
        yPos += 8;
        doc.setFont('helvetica', 'normal');
        const splitSummary = doc.splitTextToSize(formData.summary || "No summary provided.", pageWidth - margin * 2);
        doc.text(splitSummary, margin, yPos);
    }

    else if (type === 'mail_labels') {
        yPos = 100;
        doc.rect(margin, yPos, 100, 50); // Рамка для этикетки
        doc.text(`RECIPIENT:`, margin + 5, yPos + 10);
        doc.text(`${data.fullname}`, margin + 5, yPos + 20);
        doc.text(`${data.address}`, margin + 5, yPos + 30);
    }

    // 5. Футер
    doc.setFontSize(9);
    doc.setTextColor(150);
    doc.text("Generated by LegalDesk CRM. System electronic signature verified.", margin, 285);

    // 6. Сохранение
    doc.save(`${type}_${data.id.replace(/\//g, '_')}.pdf`);
};