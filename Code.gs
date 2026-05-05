// === Code.gs ===
/**
 * Bright Aside Self Help Group (SACCO) - Backend API
 * Handles data persistence in Google Sheets and serves as a REST API.
 * DEPLOYMENT: Deploy as Web App, Execute as: Me, Who has access: Anyone.
 */

const SHEET_ID = SpreadsheetApp.getActiveSpreadsheet().getId();
const DB_NAME = "BrightAside DB";

/**
 * Handle GET requests (READ operations)
 */
function doGet(e) {
  const action = e.parameter.action;
  try {
    let data;
    switch (action) {
      case 'initSheet':
        data = initSheet();
        break;
      case 'getMembers':
        data = getMembers();
        break;
      case 'getMemberSummary':
        data = getMemberSummary(e.parameter.memberId);
        break;
      case 'getSavings':
        data = getSavings(e.parameter.memberId, e.parameter.weekStart);
        break;
      case 'getLoans':
        data = getLoans(e.parameter.memberId, e.parameter.status);
        break;
      case 'getLoanPayments':
        data = getLoanPayments(e.parameter.loanId);
        break;
      case 'getWelfare':
        data = getWelfare(e.parameter.memberId, e.parameter.month, e.parameter.year);
        break;
      case 'getFines':
        data = getFines(e.parameter.memberId, e.parameter.status, e.parameter.fineType);
        break;
      case 'getChangeLog':
        data = getChangeLog(e.parameter.limit || 200);
        break;
      case 'getSettings':
        data = getSettings();
        break;
      case 'getDashboard':
        data = getDashboardStats();
        break;
      case 'authenticate':
        data = authenticate(e.parameter);
        break;
      default:
        throw new Error("Invalid action: " + action);
    }
    return successRes(data);
  } catch (err) {
    return errorRes(err.message);
  }
}

/**
 * Handle POST requests (WRITE operations)
 */
function doPost(e) {
  try {
    const postData = JSON.parse(e.postData.contents);
    const action = postData.action;
    const payload = postData.payload;
    let result;

    switch (action) {
      case 'recordSavings':
        result = recordSavings(payload);
        break;
      case 'recordBulkSavings':
        result = recordBulkSavings(payload);
        break;
      case 'issueLoan':
        result = issueLoan(payload);
        break;
      case 'recordLoanPayment':
        result = recordLoanPayment(payload);
        break;
      case 'recordWelfare':
        result = recordWelfare(payload);
        break;
      case 'recordBulkWelfare':
        result = recordBulkWelfare(payload);
        break;
      case 'updateFine':
        result = updateFine(payload);
        break;
      case 'undoLastAction':
        result = undoLastAction(payload.adminUser);
        break;
      case 'redoLastUndo':
        result = redoLastUndo(payload.adminUser);
        break;
      case 'updateSettings':
        result = updateSettings(payload);
        break;
      case 'updateMember':
        result = updateMember(payload);
        break;
      default:
        throw new Error("Invalid POST action: " + action);
    }
    return successRes(result);
  } catch (err) {
    return errorRes(err.message);
  }
}

// --- CORE OPERATIONS ---

function getMembers() {
  const sheet = getSheet("Members");
  return sheetToObjects(sheet).filter(m => m.active === "TRUE" || m.active === true);
}

function getSettings() {
  const sheet = getSheet("Settings");
  const rows = sheetToObjects(sheet);
  const settings = {};
  rows.forEach(r => settings[r.key] = r.value);
  return settings;
}

function getMemberSummary(memberId) {
  const members = getMembers();
  const member = members.find(m => String(m.id) === String(memberId));
  if (!member) throw new Error("Member not found");

  const savingsSheet = getSheet("Savings");
  const savings = sheetToObjects(savingsSheet).filter(s => String(s.memberId) === String(memberId));
  const totalSavings = savings.reduce((sum, s) => sum + (Number(s.amountPaid) || 0), 0);

  const loans = getLoans(memberId, "active");
  const activeLoan = loans.length > 0 ? loans[0] : null;

  const fines = getFines(memberId, "unpaid");
  const totalUnpaidFines = fines.reduce((sum, f) => sum + (Number(f.amount) || 0), 0);

  return {
    member,
    totalSavings,
    activeLoan,
    totalUnpaidFines,
    savingsHistory: savings.slice(-10)
  };
}

function getSavings(memberId, weekStart) {
  const sheet = getSheet("Savings");
  let rows = sheetToObjects(sheet);
  if (memberId) rows = rows.filter(r => String(r.memberId) === String(memberId));
  if (weekStart) rows = rows.filter(r => r.weekStart === weekStart);
  return rows;
}

function getLoans(memberId, status) {
  const sheet = getSheet("Loans");
  let rows = sheetToObjects(sheet);
  if (memberId) rows = rows.filter(r => String(r.memberId) === String(memberId));
  if (status) rows = rows.filter(r => r.status === status);

  const paymentSheet = getSheet("LoanPayments");
  const allPayments = sheetToObjects(paymentSheet);

  return rows.map(loan => {
    const loanPayments = allPayments.filter(p => String(p.loanId) === String(loan.id));
    const paidAmount = loanPayments.reduce((sum, p) => sum + (Number(p.amountPaid) || 0), 0);
    return {
      ...loan,
      paidAmount,
      balance: Number(loan.totalDue) - paidAmount
    };
  });
}

function getLoanPayments(loanId) {
  const sheet = getSheet("LoanPayments");
  let rows = sheetToObjects(sheet);
  if (loanId) rows = rows.filter(r => String(r.loanId) === String(loanId));
  return rows;
}

function getWelfare(memberId, month, year) {
  const sheet = getSheet("Welfare");
  let rows = sheetToObjects(sheet);
  if (memberId) rows = rows.filter(r => String(r.memberId) === String(memberId));
  if (month) rows = rows.filter(r => String(r.month) === String(month));
  if (year) rows = rows.filter(r => String(r.year) === String(year));
  return rows;
}

function getFines(memberId, status, fineType) {
  const sheet = getSheet("Fines");
  let rows = sheetToObjects(sheet);
  if (memberId) rows = rows.filter(r => String(r.memberId) === String(memberId));
  if (status) rows = rows.filter(r => r.status === status);
  if (fineType) rows = rows.filter(r => r.fineType === fineType);
  return rows;
}

function getChangeLog(limit) {
  const sheet = getSheet("ChangeLog");
  return sheetToObjects(sheet).slice(-(limit || 200)).reverse();
}

function getDashboardStats() {
  const members = getMembers();
  const loans = getLoans(null, "active");
  const fines = getFines(null, "unpaid");
  
  const savingsSheet = getSheet("Savings");
  const totalSavings = sheetToObjects(savingsSheet).reduce((sum, s) => sum + (Number(s.amountPaid) || 0), 0);
  
  const totalArrears = loans.reduce((sum, l) => sum + l.balance, 0);
  const totalPendingFines = fines.reduce((sum, f) => sum + (Number(f.amount) || 0), 0);

  return {
    memberCount: members.length,
    activeLoansCount: loans.length,
    totalSavings,
    totalArrears,
    totalPendingFines
  };
}

function authenticate(params) {
  const { role, username, password, memberId, pin } = params;
  const settings = getSettings();

  if (role === 'admin') {
    if (username === settings.adminUsername && password === settings.adminPasswordHash) {
      return { success: true, user: { role: 'admin', name: 'Administrator' } };
    }
  } else if (role === 'member') {
    const members = getMembers();
    const member = members.find(m => String(m.id) === String(memberId));
    if (member && String(member.pin) === String(pin)) {
      return { success: true, user: { role: 'member', member } };
    }
  }
  return { success: false, error: "Invalid credentials" };
}

// --- WRITE OPERATIONS ---

function recordSavings(data) {
  const sheet = getSheet("Savings");
  const id = data.id || generateId();
  const rowObj = {
    id,
    memberId: data.memberId,
    weekStart: data.weekStart,
    weekEnd: data.weekEnd,
    amountPaid: data.amountPaid,
    status: data.status,
    recordedBy: data.recordedBy,
    recordedAt: new Date().toISOString(),
    notes: data.notes || ""
  };
  
  upsertRow(sheet, "id", id, rowObj);
  
  // Logic: auto-create fine if unpaid or partial < weeklyMinSavings
  const settings = getSettings();
  if (data.status === 'unpaid' || (data.status === 'partial' && Number(data.amountPaid) < Number(settings.weeklyMinSavings))) {
    autoCreateFine(data.memberId, 'savings', data.weekStart, "Missed/Partial weekly savings contribution");
  }

  logChange("recordSavings", "Savings", id, data.memberId, null, JSON.stringify(rowObj), data.recordedBy);
  return { success: true, id };
}

function recordBulkSavings(payload) {
  const { weeks, recordedBy } = payload;
  weeks.forEach(w => recordSavings({ ...w, recordedBy }));
  return { success: true, count: weeks.length };
}

function issueLoan(data) {
  const { memberId, principal, termYears, approvedBy } = data;
  const settings = getSettings();
  
  // Validate 80% rule
  const summary = getMemberSummary(memberId);
  const maxEligible = summary.totalSavings * (Number(settings.loanMaxPct) / 100);
  if (principal > maxEligible) throw new Error(`Principal ${principal} exceeds 80% of savings (${maxEligible})`);
  if (summary.activeLoan) throw new Error("Member already has an active loan");

  const rate = termYears === 1 ? Number(settings.loanRate1yr) : Number(settings.loanRate2yr);
  const interest = principal * (rate / 100);
  const insurance = principal * (Number(settings.insuranceRate) / 100);
  const totalDue = principal + interest + insurance;

  const id = generateId();
  const rowObj = {
    id,
    memberId,
    principal,
    interestRate: rate,
    interest,
    insurance,
    totalDue,
    termYears,
    startDate: new Date().toISOString().split('T')[0],
    approvedDate: new Date().toISOString().split('T')[0],
    status: "active",
    approvedBy
  };

  appendRow(getSheet("Loans"), rowObj);
  logChange("issueLoan", "Loans", id, memberId, null, JSON.stringify(rowObj), approvedBy);
  return { success: true, id };
}

function recordLoanPayment(data) {
  const { loanId, memberId, paymentDate, amountPaid, recordedBy, notes } = data;
  const id = generateId();
  
  const paymentRow = {
    id,
    loanId,
    memberId,
    paymentDate,
    amountPaid,
    recordedBy,
    notes: notes || ""
  };
  
  appendRow(getSheet("LoanPayments"), paymentRow);
  
  // Check if closed
  const loans = getLoans(null, "active").filter(l => String(l.id) === String(loanId));
  if (loans.length > 0) {
    const loan = loans[0];
    if (loan.balance <= 0) {
      const loanSheet = getSheet("Loans");
      const loanRows = sheetToObjects(loanSheet);
      const idx = loanRows.findIndex(r => String(r.id) === String(loanId));
      if (idx !== -1) {
        loanSheet.getRange(idx + 2, 11).setValue("closed"); // status col is 11
      }
    }
  }

  logChange("recordLoanPayment", "LoanPayments", id, memberId, null, JSON.stringify(paymentRow), recordedBy);
  return { success: true, id };
}

function recordWelfare(data) {
  const sheet = getSheet("Welfare");
  const id = data.id || generateId();
  const rowObj = {
    id,
    memberId: data.memberId,
    month: data.month,
    year: data.year,
    amountPaid: data.amountPaid,
    status: data.status,
    datePaid: data.status === 'paid' ? new Date().toISOString().split('T')[0] : "",
    recordedBy: data.recordedBy
  };
  
  upsertRow(sheet, "id", id, rowObj);
  
  if (data.status === 'unpaid') {
    autoCreateFine(data.memberId, 'welfare', `${data.month}/${data.year}`, "Missed monthly welfare contribution");
  }

  logChange("recordWelfare", "Welfare", id, data.memberId, null, JSON.stringify(rowObj), data.recordedBy);
  return { success: true, id };
}

function recordBulkWelfare(payload) {
  const { entries, recordedBy } = payload;
  entries.forEach(e => recordWelfare({ ...e, recordedBy }));
  return { success: true, count: entries.length };
}

function updateFine(payload) {
  const { fineId, status, resolvedBy } = payload;
  const sheet = getSheet("Fines");
  const rows = sheetToObjects(sheet);
  const idx = rows.findIndex(r => String(r.id) === String(fineId));
  if (idx === -1) throw new Error("Fine not found");
  
  const oldVal = JSON.stringify(rows[idx]);
  sheet.getRange(idx + 2, 6).setValue(status); // status col
  sheet.getRange(idx + 2, 9).setValue(new Date().toISOString()); // resolvedAt
  sheet.getRange(idx + 2, 10).setValue(resolvedBy); // resolvedBy
  
  logChange("updateFine", "Fines", fineId, rows[idx].memberId, oldVal, status, resolvedBy);
  return { success: true };
}

function updateSettings(payload) {
  const { settings, updatedBy } = payload;
  const sheet = getSheet("Settings");
  const current = getSettings();
  
  Object.entries(settings).forEach(([key, value]) => {
    upsertRow(sheet, "key", key, { key, value, updatedAt: new Date().toISOString(), updatedBy });
  });
  
  logChange("updateSettings", "Settings", "all", "N/A", JSON.stringify(current), JSON.stringify(settings), updatedBy);
  return { success: true };
}

function updateMember(payload) {
  const { memberId, fields, updatedBy } = payload;
  const sheet = getSheet("Members");
  const rows = sheetToObjects(sheet);
  const idx = rows.findIndex(r => String(r.id) === String(memberId));
  if (idx === -1) throw new Error("Member not found");
  
  const oldVal = JSON.stringify(rows[idx]);
  const headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
  
  Object.entries(fields).forEach(([key, value]) => {
    const colIdx = headers.indexOf(key);
    if (colIdx !== -1) {
      sheet.getRange(idx + 2, colIdx + 1).setValue(value);
    }
  });

  logChange("updateMember", "Members", memberId, memberId, oldVal, JSON.stringify(fields), updatedBy);
  return { success: true };
}

// --- HELPERS ---

function getSheet(name) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName(name);
  if (!sheet) {
    sheet = ss.insertSheet(name);
    let headers;
    switch (name) {
      case "Members": headers = ["id","name","designation","pin","joinDate","active"]; break;
      case "Savings": headers = ["id","memberId","weekStart","weekEnd","amountPaid","status","recordedBy","recordedAt","notes"]; break;
      case "Loans": headers = ["id","memberId","principal","interestRate","interest","insurance","totalDue","termYears","startDate","approvedDate","status","approvedBy"]; break;
      case "LoanPayments": headers = ["id","loanId","memberId","paymentDate","amountPaid","runningBalance","recordedBy","notes"]; break;
      case "Welfare": headers = ["id","memberId","month","year","amountPaid","status","datePaid","recordedBy"]; break;
      case "Fines": headers = ["id","memberId","fineType","referenceWeekOrMonth","amount","status","reason","createdAt","resolvedAt","resolvedBy"]; break;
      case "ChangeLog": headers = ["id","timestamp","adminUser","action","entity","entityId","memberId","oldValue","newValue","undone"]; break;
      case "Settings": headers = ["key","value","updatedAt","updatedBy"]; break;
    }
    sheet.appendRow(headers);
  }
  return sheet;
}

function sheetToObjects(sheet) {
  const rows = sheet.getDataRange().getValues();
  const headers = rows[0];
  const objects = [];
  for (let i = 1; i < rows.length; i++) {
    const obj = {};
    for (let j = 0; j < headers.length; j++) {
      obj[headers[j]] = rows[i][j];
    }
    objects.push(obj);
  }
  return objects;
}

function appendRow(sheet, obj) {
  const headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
  const row = headers.map(h => obj[h] === undefined ? "" : obj[h]);
  sheet.appendRow(row);
}

function upsertRow(sheet, matchCol, matchVal, obj) {
  const data = sheetToObjects(sheet);
  const headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
  const rowIdx = data.findIndex(r => String(r[matchCol]) === String(matchVal));
  const rowValues = headers.map(h => obj[h] === undefined ? "" : obj[h]);
  
  if (rowIdx !== -1) {
    sheet.getRange(rowIdx + 2, 1, 1, headers.length).setValues([rowValues]);
  } else {
    sheet.appendRow(rowValues);
  }
}

function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
}

function logChange(action, entity, entityId, memberId, oldVal, newVal, adminUser) {
  appendRow(getSheet("ChangeLog"), {
    id: generateId(),
    timestamp: new Date().toISOString(),
    adminUser,
    action,
    entity,
    entityId,
    memberId,
    oldValue: oldVal,
    newValue: newVal,
    undone: "FALSE"
  });
}

function autoCreateFine(memberId, fineType, refPeriod, reason) {
  const settings = getSettings();
  const baseFines = {
    savings: Number(settings.savingsFine),
    loan: Number(settings.loanRepaymentFine),
    welfare: Number(settings.welfareFine)
  };
  
  const baseFine = baseFines[fineType] || 0;
  
  // Logic: n = count existing unpaid/unwaived fines of same type/member
  const fines = getFines(memberId, null, fineType);
  const n = fines.filter(f => f.status === 'unpaid').length + 1;
  const fineAmount = Math.max(baseFine, Math.round(baseFine * Math.pow(1.5, n - 1) / 10) * 10);
  
  appendRow(getSheet("Fines"), {
    id: generateId(),
    memberId,
    fineType,
    referenceWeekOrMonth: refPeriod,
    amount: fineAmount,
    status: 'unpaid',
    reason,
    createdAt: new Date().toISOString(),
    resolvedAt: "",
    resolvedBy: ""
  });
}

function successRes(data) {
  return ContentService.createTextOutput(JSON.stringify({ ok: true, data }))
    .setMimeType(ContentService.MimeType.JSON);
}

function errorRes(msg) {
  return ContentService.createTextOutput(JSON.stringify({ ok: false, error: msg }))
    .setMimeType(ContentService.MimeType.JSON);
}

function initSheet() {
  const membersSheet = getSheet("Members");
  if (membersSheet.getLastRow() === 1) {
    const rawMembers = [
      ["1","Michael A. Bandi","Chairperson","1234","2022-01-01","TRUE"],
      ["2","Rose Macharia","Ass. Chairperson","1234","2022-01-01","TRUE"],
      ["3","Erickson Okumu","Secretary","1234","2022-01-01","TRUE"],
      ["4","Faith Akoth","Ass. Secretary","1234","2022-01-01","TRUE"],
      ["5","Joanes Akumu","Treasurer","1234","2022-01-01","TRUE"],
      ["6","Kenneth Ochuka","Loan Officer","1234","2022-01-01","TRUE"],
      ["7","Banstein Wekhoba","Disciplinary","1234","2022-01-01","TRUE"],
      ["8","Joseph Gitau","Welfare","1234","2022-01-01","TRUE"],
      ["9","Victor Kiprop","Member","1234","2022-01-01","TRUE"],
      ["10","Peter Murimi","Member","1234","2022-01-01","TRUE"],
      ["11","Thomas Shiroko","Member","1234","2022-01-01","TRUE"],
      ["12","Eric Ndungu","Member","1234","2022-01-01","TRUE"],
      ["13","Alfred Moth","Member","1234","2022-01-01","TRUE"],
      ["14","Paul Thiari","Member","1234","2022-01-01","TRUE"],
      ["15","Benson Njenga","Member","1234","2022-01-01","TRUE"],
      ["16","Godwin Ochieng","Member","1234","2022-01-01","TRUE"],
      ["17","Edwin Wanguya","Member","1234","2022-01-01","TRUE"],
      ["18","Benjamin Kisiangani","Member","1234","2022-01-01","TRUE"],
      ["19","Peter Onundo","Member","1234","2022-01-01","TRUE"],
      ["20","Emmanuel Wesonga","Member","1234","2022-01-01","TRUE"],
      ["21","Alpha Chesang","Member","1234","2022-01-01","TRUE"],
      ["22","Edwin Bandi","Member","1234","2022-01-01","TRUE"]
    ];
    rawMembers.forEach(row => membersSheet.appendRow(row));
  }

  const settingsSheet = getSheet("Settings");
  if (settingsSheet.getLastRow() === 1) {
    const defaultSettings = [
      ["weeklyMinSavings", "600"],
      ["welfareMontlyAmount", "300"],
      ["savingsFine", "50"],
      ["loanRepaymentFine", "50"],
      ["welfareFine", "300"],
      ["loanRate1yr", "10"],
      ["loanRate2yr", "20"],
      ["insuranceRate", "1"],
      ["loanMaxPct", "80"],
      ["adminUsername", "admin"],
      ["adminPasswordHash", "brightaside2024"]
    ];
    defaultSettings.forEach(row => settingsSheet.appendRow([row[0], row[1], new Date().toISOString(), "system"]));
  }

  // Seed initial loans if empty
  const loansSheet = getSheet("Loans");
  if (loansSheet.getLastRow() === 1) {
    const initialLoans = [
      { memberId:2,  principal:100000, interestRate:10, interest:10000, insurance:1000, totalDue:111000, termYears:1, startDate:"2025-07-06", status:"active" },
      { memberId:3,  principal:85000,  interestRate:20, interest:17000, insurance:1700, totalDue:103700, termYears:2, startDate:"2025-11-30", status:"active" },
      { memberId:5,  principal:80000,  interestRate:10, interest:8000,  insurance:800,  totalDue:88800,  termYears:1, startDate:"2025-01-13", status:"active" },
      { memberId:7,  principal:36000,  interestRate:10, interest:3600,  insurance:360,  totalDue:39960,  termYears:1, startDate:"2024-09-29", status:"active" },
      { memberId:8,  principal:80000,  interestRate:10, interest:8000,  insurance:800,  totalDue:88800,  termYears:1, startDate:"2024-10-27", status:"active" },
      { memberId:9,  principal:120000, interestRate:10, interest:12000, insurance:1200, totalDue:133200, termYears:1, startDate:"2025-11-17", status:"active" },
      { memberId:10, principal:511000, interestRate:20, interest:102200,insurance:5110, totalDue:618310, termYears:2, startDate:"2026-03-05", status:"active" },
      { memberId:11, principal:30000,  interestRate:10, interest:3000,  insurance:300,  totalDue:33300,  termYears:1, startDate:"2025-09-28", status:"active" },
      { memberId:12, principal:100000, interestRate:10, interest:10000, insurance:1000, totalDue:111000, termYears:1, startDate:"2024-11-17", status:"active" },
      { memberId:13, principal:150000, interestRate:20, interest:30000, insurance:3000, totalDue:183000, termYears:2, startDate:"2025-03-09", status:"active" },
      { memberId:16, principal:32000,  interestRate:10, interest:3200,  insurance:320,  totalDue:35520,  termYears:1, startDate:"2026-01-12", status:"active" },
      { memberId:18, principal:83000,  interestRate:10, interest:8300,  insurance:830,  totalDue:92130,  termYears:1, startDate:"2026-02-05", status:"active" },
      { memberId:19, principal:150000, interestRate:20, interest:30000, insurance:1500, totalDue:181500, termYears:2, startDate:"2026-04-14", status:"active" }
    ];
    initialLoans.forEach(l => {
      const id = generateId();
      appendRow(loansSheet, { ...l, id, approvedDate: l.startDate, approvedBy: "system" });
      
      // Seed initial payments
      const payments = { 2:89000, 3:3000, 5:60400, 7:35700, 8:68800, 9:39150, 10:52000, 11:12600, 12:86000, 13:133000, 16:0, 18:22130, 19:22500 };
      const paid = payments[l.memberId] || 0;
      if (paid > 0) {
        appendRow(getSheet("LoanPayments"), { id: generateId(), loanId: id, memberId: l.memberId, paymentDate: l.startDate, amountPaid: paid, recordedBy: "system" });
      }
    });
  }

  // Seed bulk savings if empty
  const savingsSheet = getSheet("Savings");
  if (savingsSheet.getLastRow() === 1) {
    const savings = { 1:175850, 2:266500, 3:103600, 4:90300, 5:185020, 6:137200, 7:76650, 8:138100, 9:156673, 10:657450, 11:144250, 12:158853, 13:240042, 14:139450, 15:190524, 16:47750, 17:53900, 18:112600, 19:202433, 20:91300, 21:36400, 22:50000 };
    Object.entries(savings).forEach(([mId, amt]) => {
      appendRow(savingsSheet, {
        id: generateId(),
        memberId: mId,
        weekStart: "2022-01-01",
        weekEnd: "2022-01-07",
        amountPaid: amt,
        status: "paid",
        recordedBy: "system",
        recordedAt: new Date().toISOString(),
        notes: "Historical opening balance"
      });
    });
  }

  return { seeded: true };
}
