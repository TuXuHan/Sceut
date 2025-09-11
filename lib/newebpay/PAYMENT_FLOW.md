# NeWebPay Payment Flow Diagram

## Complete Payment Flow from Frontend to Success

\`\`\`
┌─────────────────────────────────────────────────────────────────────────────────┐
│                                FRONTEND FLOW                                    │
└─────────────────────────────────────────────────────────────────────────────────┘

1. User visits /subscribe page
   ↓
2. User fills out payment form (PeriodicPaymentForm component)
   ↓
3. Form submission triggers API call to /api/newebpay/request
   ↓
4. API returns formHtml with encrypted payment data
   ↓
5. Frontend auto-submits form to NeWebPay payment page
   ↓
6. User completes payment on NeWebPay's secure page
   ↓
7. NeWebPay POST request to /api/newebpay/result
   ↓
8. Result API processes payment response and redirects to /subscribe/success
   ↓
9. Success page creates subscription record in database
   ↓
10. User sees success confirmation with payment details

┌─────────────────────────────────────────────────────────────────────────────────┐
│                                BACKEND FLOW                                     │
└─────────────────────────────────────────────────────────────────────────────────┘

/api/newebpay/request (POST)
├── Validates required fields
├── Generates merchant trade number
├── Prepares payment data
├── Encrypts data using AES-256-CBC
├── Creates HTML form with encrypted PostData_
└── Returns formHtml to frontend

/api/newebpay/result (POST)
├── Receives form data from NeWebPay
├── Decrypts payment response
├── Validates payment status
├── Redirects to success page with payment parameters
└── Handles error cases

/subscribe/success (GET)
├── Extracts payment parameters from URL
├── Creates subscription record via /api/subscriptions/create
├── Updates user's subscription status
├── Clears temporary data
└── Displays success confirmation

┌─────────────────────────────────────────────────────────────────────────────────┐
│                              DATA FLOW                                          │
└─────────────────────────────────────────────────────────────────────────────────┘

Frontend Data:
├── User profile information
├── Selected perfume data
├── Payment preferences
└── Subscription details

NeWebPay Data:
├── MerOrderNo (merchant order number)
├── MerchantOrderNo (merchant order number from response)
├── PeriodNo (period number from NeWebPay)
├── AuthTime (authorization time)
├── PeriodAmt (payment amount)
├── AuthCode (authorization code)
└── TradeNo (transaction number)

Database Records:
├── subscribers table entry
├── user_id reference
├── merchant_order_no field
├── payment_data JSON field
├── subscription_status
└── payment_status

┌─────────────────────────────────────────────────────────────────────────────────┐
│                              ERROR HANDLING                                     │
└─────────────────────────────────────────────────────────────────────────────────┘

Payment Failures:
├── Invalid payment data → Error response
├── NeWebPay API errors → Error logging
├── Database errors → Rollback and retry
└── Network timeouts → Retry mechanism

Success Validation:
├── Payment status verification
├── Data integrity checks
├── User authentication
└── Subscription creation confirmation

┌─────────────────────────────────────────────────────────────────────────────────┐
│                              SECURITY MEASURES                                  │
└─────────────────────────────────────────────────────────────────────────────────┘

Data Protection:
├── AES-256-CBC encryption for all NeWebPay communications
├── CheckMacValue generation for data integrity
├── HTTPS enforcement for all API endpoints
└── User authentication required for all operations

Payment Security:
├── PCI DSS compliant payment processing
├── No sensitive card data stored locally
├── Secure redirect to NeWebPay's payment page
└── Encrypted webhook notifications
\`\`\`

## Step-by-Step Flow Description

### 1. Frontend Initiation
- User navigates to `/subscribe` page
- System validates user profile completeness
- User sees selected perfume and subscription details
- Payment form is displayed with subscription information

### 2. Payment Form Submission
- User clicks "Subscribe" button
- Frontend sends POST request to `/api/newebpay/request`
- Required fields: `ProdDesc`, `PeriodAmt`, `PeriodType`, `PeriodPoint`, `PeriodStartType`, `PeriodTimes`

### 3. Payment Request Processing
- API validates all required fields
- Generates unique `MerOrderNo` using timestamp
- Prepares payment data according to NeWebPay specifications
- Encrypts data using AES-256-CBC with merchant keys
- Creates HTML form with encrypted `PostData_`
- Returns form HTML to frontend

### 4. NeWebPay Payment Page
- Frontend auto-submits form to NeWebPay
- User is redirected to NeWebPay's secure payment page
- User enters credit card information
- NeWebPay processes payment and validates card

### 5. Payment Result Processing
- NeWebPay redirects to `/api/newebpay/result` with encrypted response
- API decrypts payment response data
- Validates payment status and extracts key information
- Redirects to success page with payment parameters

### 6. Success Page Processing
- Success page extracts payment parameters from URL
- Creates subscription record in database via `/api/subscriptions/create`
- Updates user's subscription status to "active"
- Clears temporary data from localStorage
- Displays success confirmation with payment details

### 7. Database Integration
- Subscription record created in `subscribers` table
- Payment data stored in JSON format
- User profile linked to subscription
- Payment status set to "paid"

## Key Data Points

**Payment Parameters:**
- `PeriodNo`: Unique identifier from NeWebPay
- `MerchantOrderNo`: Merchant order number for payment operations
- `AuthTime`: Payment authorization timestamp
- `PeriodAmt`: Payment amount
- `AuthCode`: Authorization code from payment processor

**Subscription Data:**
- User ID and profile information
- Selected perfume details
- Payment schedule and amount
- Subscription status and dates

**Security Elements:**
- Encrypted communication with NeWebPay
- Secure data transmission
- User authentication throughout process
- PCI DSS compliant payment handling
