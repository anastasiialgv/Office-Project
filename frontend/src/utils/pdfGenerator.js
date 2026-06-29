import { jsPDF } from "jspdf";
import stamp from "../assets/legal_desk_stamp.png"
import { COMPANY_CONFIG } from "../config/companyConfig.js";

export const generateCasePDF = (type, data, formData = {}) => {
    if (type === 'mail_labels') {
        const doc = new jsPDF({
            orientation: 'landscape',
            unit: 'mm',
            format: [55, 35]
        });


        const imgHeight = 29;
        const imgWidth = imgHeight * (2816 / 1536);

        const xPos = (55 - imgWidth) / 2;
        const yPos = (35 - imgHeight) / 2;


        doc.addImage(
            stamp,
            'PNG',
            xPos,
            yPos,
            imgWidth,
            imgHeight
        );

        doc.save("legal_desk_stamp.pdf");
        return;
    }

    const doc = new jsPDF();
    const margin = 20;
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();

    const centerText = (text, y, size = 12, style = 'normal') => {
        doc.setFontSize(size);
        doc.setFont('helvetica', style);
        const textWidth = doc.getTextWidth(text);
        doc.text(text, (pageWidth - textWidth) / 2, y);
    };

    const displayCaseId = formData.caseId || data.id;
    // 1. Шапка документа
    doc.setFontSize(10);
    doc.setTextColor(100);
    doc.text("LEGAL DESK CRM - AUTOMATED SYSTEM", margin, 15);
    doc.text(`Date: ${new Date().toLocaleDateString()}`, pageWidth - 50, 15);
    doc.setDrawColor(200);
    doc.line(margin, 18, pageWidth - margin, 18);

    // 2. Заголовок документа
    const titles = {
        payment_demand_notice: "PAYMENT DEMAND NOTICE",
        pre_litigation_payment_demand: "FINAL PRE-LITIGATION SETTLEMENT DEMAND",
        notice_of_case_referral_to_court: "NOTICE OF CASE REFERRAL TO COURT",
        official_note: "OFFICIAL INTERNAL NOTE",
        client_contact_report: "CLIENT CONTACT REPORT"
    };

    doc.setTextColor(0);
    centerText(titles[type] || "OFFICIAL DOCUMENT", 35, 16, 'bold');

    if (type === 'official_note') {
        let yPos = 85;
        doc.setFontSize(11);
        doc.setFont('helvetica', 'bold');
        doc.text("NOTE CONTENT:", margin, yPos);
        yPos += 8;
        doc.setFont('helvetica', 'normal');
        const splitNote = doc.splitTextToSize(formData.note || "No content provided.", pageWidth - margin * 2);
        doc.text(splitNote, margin, yPos);
    }

    else if (type === 'client_contact_report') {
        let yPos = 55;
        doc.setFontSize(11);

        const maxTextWidth = pageWidth - (margin * 2);
        const leftColX = margin;
        const rightColX = (pageWidth / 2) + 5;
        const colWidth = (pageWidth / 2) - margin - 5;
        const pageHeightLimit = pageHeight - 25;
// =================================== PERSONAL DATA ===================================
        doc.setFont('helvetica', 'bold');
        doc.text("PERSONAL DATA:", leftColX, yPos);
        doc.setFont('helvetica', 'normal');

        yPos += 7;
        doc.text(`Driver ID: #${data.idDriver || "—"}`, leftColX, yPos);
        yPos += 6;
        doc.text(`Full Name: ${data.fullname || "—"}`, leftColX, yPos, { maxWidth: colWidth });
        yPos += 6;
        doc.text(`Date of Birth: ${data.birthDate || "—"}`, leftColX, yPos);
        yPos += 6;
        doc.text(`Passport No.: ${data.passportNumber || "—"}`, leftColX, yPos);
        yPos += 6;
        doc.text(`PESEL: ${data.pesel || "—"}`, leftColX, yPos);

        let rightYPos = 55;
        doc.setFont('helvetica', 'bold');
        doc.text("CONTACT DETAILS:", rightColX, rightYPos);
        doc.setFont('helvetica', 'normal');

        rightYPos += 7;
        doc.text(`Email: ${data.email || "—"}`, rightColX, rightYPos, { maxWidth: colWidth });
        rightYPos += 6;
        doc.text(`Phone: ${data.phone || "—"}`, rightColX, rightYPos);
        rightYPos += 6;

        doc.setFont('helvetica', 'bold');
        doc.text("Address:", rightColX, rightYPos + 6);
        doc.setFont('helvetica', 'normal');

        const addressText = data.address || "—";
        doc.text(addressText, rightColX, rightYPos + 12, { maxWidth: colWidth });

        const addressLines = doc.splitTextToSize(addressText, colWidth).length;
        const addressHeight = addressLines * 5;

        const finalYPos = Math.max(yPos, rightYPos + 12 + addressHeight);

        yPos = finalYPos + 10;
        doc.setDrawColor(200);
        doc.line(margin, yPos, pageWidth - margin, yPos);

// =================================== Report ===================================
        yPos += 12;
        doc.setFont('helvetica', 'bold');
        doc.text("COMPREHENSIVE INTERACTION SUMMARY & HISTORY:", margin, yPos);

        yPos += 8;
        doc.setFont('helvetica', 'normal');

        const bodyContent = formData.summary || "No summary or interaction history provided for this client.";
        const splitSummary = doc.splitTextToSize(bodyContent, maxTextWidth);

        const lineHeight = 5.5;
        for (let i = 0; i < splitSummary.length; i++) {
            if (yPos > pageHeightLimit) {
                doc.addPage();
                yPos = 25;
            }

            doc.text(splitSummary[i], margin, yPos);
            yPos += lineHeight;
        }    } else {
        // 3. Данные получателя
        doc.setFontSize(11);
        doc.setFont('helvetica', 'bold');
        doc.text("CASE DETAILS:", margin, 50);
        doc.setFont('helvetica', 'normal');

        doc.text(`Case ID: #${data.id}`, margin, 57);
        doc.text(`Recipient: ${data.fullname}`, margin, 63);
        doc.text(`Birth Date: ${data.birthDate}`, margin, 69);
        doc.text(`Passport No.: ${data.passportNumber}`, margin, 75);
        doc.text(`Address: ${data.address}`, margin, 81);
        doc.text(`Vehicle Plate: ${data.plate}`, margin, 87);
        doc.text(`Overdue Violations Count: ${data.overdueCount}`, margin, 93);

        doc.line(margin, 98, pageWidth - margin, 98);

        // 4. Основное содержание
        let yPos = 108
        doc.setFontSize(11);

        if (type === 'payment_demand_notice'){
            doc.setFont('helvetica', 'bold');
            doc.text(`Subject: Formal Demand for Payment`, margin, yPos);
            yPos += 12;
            doc.setFont('helvetica', 'normal');

            const bodyContent = formData.customText ||
                `Our records indicate that the amount of ${data.fine} PLN remains unpaid regarding the traffic violation on ${data.violation}. Please settle this debt by the deadline: ${data.due}.`;

            const splitBody = doc.splitTextToSize(bodyContent, pageWidth - margin * 2);
            doc.text(splitBody, margin, yPos);

            yPos += (splitBody.length * 7) + 12;

            doc.setFont('helvetica', 'bold');
            doc.text("Payment Details & Bank Account:", margin, yPos);
            doc.setFont('helvetica', 'normal');
            yPos += 7;
            doc.text(`Bank: ${COMPANY_CONFIG.bankDetails.name}`, margin, yPos);
            yPos += 6;
            doc.text(`Account: ${COMPANY_CONFIG.bankDetails.account}`, margin, yPos);
            yPos += 6;
            doc.text(`SWIFT: ${COMPANY_CONFIG.bankDetails.swift}`, margin, yPos);
            yPos += 6;
            doc.text(`Transfer Reference: CASE №${displayCaseId}`, margin, yPos);
        } else if (type === 'pre_litigation_payment_demand') {
            doc.setTextColor(200, 0, 0);
            centerText("FINAL NOTICE - LEGAL ACTION PENDING", yPos, 12, 'bold');
            doc.setTextColor(0, 0, 0);
            yPos += 15;

            const bodyContent = formData.customText ||
                `Despite previous notices, we have not received payment for Case #${displayCaseId}.\n\nTotal debt: ${data.fine} PLN.\n\nIf payment is not received within 7 days, we will initiate legal proceedings immediately. Court and legal representation fees will be added to your total debt.`;

            const splitBody = doc.splitTextToSize(bodyContent, pageWidth - margin * 2);
            doc.text(splitBody, margin, yPos);
            yPos += (splitBody.length * 7) + 12;

            doc.setFont('helvetica', 'bold');
            doc.text("Payment Details & Bank Account:", margin, yPos);
            doc.setFont('helvetica', 'normal');
            yPos += 7;

            doc.text(`Bank: ${COMPANY_CONFIG.bankDetails.name}`, margin, yPos);
            yPos += 6;
            doc.text(`Account: ${COMPANY_CONFIG.bankDetails.account}`, margin, yPos);
            yPos += 6;
            doc.text(`SWIFT: ${COMPANY_CONFIG.bankDetails.swift}`, margin, yPos);
            yPos += 6;
            doc.text(`Transfer Reference: CASE №${displayCaseId}`, margin, yPos);
        } else if (type === 'notice_of_case_referral_to_court') {
            doc.setFont('helvetica', 'bold');
            doc.text(`Subject: Notice of Formal Referral to Judicial Authorities`, margin, yPos);
            yPos += 10;
            doc.setFont('helvetica', 'normal');

            doc.text(`This is to inform that due to lack of cooperation, case #${displayCaseId} has been referred to:`, margin, yPos);
            yPos += 8;
            doc.setFont('helvetica', 'bold');
            doc.text(`${formData.court || "[Court Name Not Specified]"}`, margin, yPos);
            doc.setFont('helvetica', 'normal');
            yPos += 15;
            doc.text("Further official correspondence and executive demands will be handled directly by the court office.", margin, yPos);
        }
    }


    // 5. Футер
    doc.setFontSize(9);
    doc.setTextColor(150);
    doc.text("Generated by LegalDesk CRM. System electronic signature verified.", margin, 285);

    // 6. Сохранение А4
    const fileIdStr = String(data.id || "—").replace(/\//g, '_');
    doc.save(`${type}_${fileIdStr}.pdf`);

    return doc;
};