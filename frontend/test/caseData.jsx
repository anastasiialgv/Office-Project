const caseData = {
    // Системные данные
    id: "2026/05/12-045",            // Референс кейса
    status: "IN PROGRESS",           // Текущий статус

    // Данные о нарушении
    violation: "2026-04-10",         // Дата нарушения
    due: "2026-05-26",               // Срок оплаты (Deadline)
    fine: 150.00,                    // Сумма штрафа
    currency: "PLN",                 // Валюта

    // Данные водителя (Получатель)
    fullname: "John Mille",          // ФИО
    address: "15 Lipowa St., Apt 4", // Улица и дом
    city: "Warsaw",                  // Город
    postcode: "00-001",              // Индекс
    phone: "+48 601 234 567",        // Телефон
    email: "johnmille@gmail.com",    // Email

    // Данные об автомобиле (для Vehicle Evidence)
    vehicle: {
        num: "WWA12345",
        model: "Corolla",
        brand: "Toyota",
        color: "Silver"
    },

    // История контактов (если нужно для отчетов)
    lastContactDate: "2026-05-01",

    // Платежные реквизиты (можно хранить тут или жестко в генераторе)
    bankDetails: {
        name: "Global Union Bank",
        account: "PL 00 1234 5678 9012 3456 7890",
        swift: "GUBPLPW"
    }
};

export default caseData;