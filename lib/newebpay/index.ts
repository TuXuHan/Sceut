// Main export file for manual NeWebPay implementation
// Based on NeWebPay documentation

// Configuration and utilities
export * from './config';
export * from './types';

// Create periodic payment
export * from './create-periodic';

// Alter periodic payment status
export * from './alter-status';

// Alter periodic payment amount
export * from './alter-amount';

// Convenience functions for common operations
export {
  createPeriodicPaymentForm,
  createPeriodicPayment,
  parsePeriodicPaymentResponse,
  generateSamplePeriodicPaymentRequest
} from './create-periodic';

export {
  alterPeriodicPaymentStatus,
  suspendPeriodicPayment,
  terminatePeriodicPayment,
  restartPeriodicPayment,
  generateSampleAlterStatusRequest
} from './alter-status';

export {
  alterPeriodicPaymentAmount,
  changePeriodicPaymentAmount,
  changePeriodicPaymentPeriod,
  changePeriodicPaymentTimes,
  changeCreditCardExpiry,
  changeNotificationURL,
  generateSampleAlterAmountRequest
} from './alter-amount';
