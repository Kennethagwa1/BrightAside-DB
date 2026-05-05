export interface Member {
  id: string | number;
  name: string;
  designation: string;
  pin: string;
  joinDate: string;
  active: boolean | string;
}

export interface SavingsRow {
  id: string;
  memberId: string | number;
  weekStart: string;
  weekEnd: string;
  amountPaid: number;
  status: 'paid' | 'partial' | 'unpaid';
  recordedBy: string;
  recordedAt: string;
  notes: string;
}

export interface Loan {
  id: string;
  memberId: string | number;
  principal: number;
  interestRate: number;
  interest: number;
  insurance: number;
  totalDue: number;
  termYears: number;
  startDate: string;
  approvedDate: string;
  status: 'active' | 'closed' | 'defaulted';
  approvedBy: string;
  paidAmount?: number;
  balance?: number;
}

export interface LoanPayment {
  id: string;
  loanId: string;
  memberId: string | number;
  paymentDate: string;
  amountPaid: number;
  recordedBy: string;
  notes: string;
}

export interface WelfareEntry {
  id: string;
  memberId: string | number;
  month: string;
  year: number | string;
  amountPaid: number;
  status: 'paid' | 'unpaid';
  datePaid: string;
  recordedBy: string;
}

export interface Fine {
  id: string;
  memberId: string | number;
  fineType: 'savings' | 'loan' | 'welfare';
  referenceWeekOrMonth: string;
  amount: number;
  status: 'unpaid' | 'paid' | 'waived';
  reason: string;
  createdAt: string;
  resolvedAt: string;
  resolvedBy: string;
}

export interface ChangeLogEntry {
  id: string;
  timestamp: string;
  adminUser: string;
  action: string;
  entity: string;
  entityId: string;
  memberId: string;
  oldValue: string;
  newValue: string;
  undone: boolean | string;
}

export interface Settings {
  weeklyMinSavings: number;
  welfareMontlyAmount: number;
  savingsFine: number;
  loanRepaymentFine: number;
  welfareFine: number;
  loanRate1yr: number;
  loanRate2yr: number;
  insuranceRate: number;
  loanMaxPct: number;
  adminUsername: string;
  adminPasswordHash: string;
}

export interface LoanRequest {
  id: string;
  memberId: string | number;
  memberName?: string;
  principal: number;
  termYears: number;
  interestRate: number;
  interest: number;
  insurance: number;
  totalDue: number;
  requestDate: string;
  status: 'pending' | 'approved' | 'rejected';
  notes: string;
}

export interface DashboardStats {
  memberCount: number;
  activeLoansCount: number;
  totalSavings: number;
  totalArrears: number;
  totalPendingFines: number;
}
