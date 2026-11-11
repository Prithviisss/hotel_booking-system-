// Currency formatter in Indian Rupees (INR)
export const formatCurrency = (amount) => {
  if (amount === undefined || amount === null || isNaN(amount)) return '₹0';
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0
  }).format(amount);
};

// Date formatter (e.g., 15 Nov 2026)
export const formatDate = (dateString) => {
  if (!dateString) return 'N/A';
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return 'N/A';
  return date.toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  });
};

// Date & Time formatter
export const formatDateTime = (dateString) => {
  if (!dateString) return 'N/A';
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return 'N/A';
  return date.toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

// HTML input date helper (YYYY-MM-DD)
export const toInputDateFormat = (date) => {
  const d = new Date(date);
  const month = `${d.getMonth() + 1}`.padStart(2, '0');
  const day = `${d.getDate()}`.padStart(2, '0');
  return `${d.getFullYear()}-${month}-${day}`;
};

// Badge styling helper with strictly light theme colors
export const getStatusBadge = (status) => {
  switch (status) {
    case 'CONFIRMED':
    case 'SUCCESS':
    case 'AVAILABLE':
      return {
        bg: 'bg-emerald-50 text-emerald-800 border-emerald-200',
        label: status === 'CONFIRMED' ? 'Confirmed' : status === 'SUCCESS' ? 'Paid' : 'Available'
      };
    case 'CHECKED_IN':
    case 'OCCUPIED':
      return {
        bg: 'bg-amber-50 text-amber-800 border-amber-200',
        label: status === 'CHECKED_IN' ? 'Checked In' : 'Occupied'
      };
    case 'CHECKED_OUT':
      return {
        bg: 'bg-blue-50 text-blue-800 border-blue-200',
        label: 'Checked Out'
      };
    case 'PENDING_PAYMENT':
    case 'PENDING':
      return {
        bg: 'bg-orange-50 text-orange-800 border-orange-200',
        label: status === 'PENDING_PAYMENT' ? 'Pending Payment' : 'Pending'
      };
    case 'CANCELLED':
    case 'REFUNDED':
    case 'FAILED':
    case 'EXPIRED':
    case 'MAINTENANCE':
      return {
        bg: 'bg-rose-50 text-rose-800 border-rose-200',
        label: status === 'CANCELLED' ? 'Cancelled' : status === 'REFUNDED' ? 'Refunded' : status === 'MAINTENANCE' ? 'Maintenance' : status
      };
    default:
      return {
        bg: 'bg-stone-50 text-stone-800 border-stone-200',
        label: status
      };
  }
};

