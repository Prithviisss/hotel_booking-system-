# The Grand Heritage Hotel & Suites
## Full-Stack Hotel Reservation System (Team-6 Capstone Project)

A complete, production-grade, MERN-stack luxury hotel reservation platform engineered with **React.js, Vite, Tailwind CSS, Node.js, Express.js, MongoDB Atlas (with Mongoose), and Razorpay Payment Gateway integration**.

---

## 🌟 Executive Summary & Key Highlights

- **Strictly Light Theme Luxury Aesthetic**: Designed with warm ivory (`#FAF9F6`), secondary white (`#FFFFFF`), champagne gold accents (`#C5A46D`), soft beige (`#EDE5D8`), charcoal typography (`#333333`), and light beige borders (`#EAE5DC`). No dark mode or dark navy backgrounds.
- **Robust Date-Based Availability Engine**: Accurately prevents double-booking using the overlap condition:  
  `existingCheckIn < requestedCheckOut AND existingCheckOut > requestedCheckIn`
- **Atomic 15-Minute Reservation Locking**: Prevents simultaneous booking attempts for the same room; automatic background cleaner expires abandoned pending checkouts.
- **Three Dedicated Portals**:
  1. **Customer Web Portal**: Room search, filters, capacity validation, instant price/GST calculation, Razorpay Checkout / Mock Mode, booking confirmation with unique `BK-XXXXXX` references, printable tax invoices, and self-service cancellation with policy refund calculation.
  2. **Receptionist Console**: Search reservations by booking ID or guest details, verify payments, assign/reassign physical rooms, execute guest check-in (marking physical room `OCCUPIED`), and execute guest check-out (releasing physical room to `AVAILABLE`).
  3. **Admin Dashboard**: Live KPIs (Total Rooms, Available, Occupied, Bookings, Customers, Gross Revenue), interactive Recharts (Monthly Revenue Area Chart, Suite Occupancy Bar Chart), physical room inventory CRUD with active-booking safety checks, category management, guest directories, and financial audit logs.
- **Full Razorpay Integration with Mock Mode Fallback**: Works with real Razorpay Test credentials or automatically falls back to a full local simulation harness (`Simulate Success`, `Simulate Failed`, `Cancel Payment`).
- **Zero-Config Database Engine**: Automatically runs built-in in-memory MongoDB with auto-seeding if external MongoDB Atlas credentials are not supplied, ensuring 100% out-of-the-box evaluation without manual database installs.

---

## 🛠️ Technology Stack

| Layer | Technologies |
| :--- | :--- |
| **Frontend** | React 18, Vite, JavaScript, Tailwind CSS, React Router DOM v6, Axios, Lucide React, Recharts, Canvas-Confetti |
| **Backend** | Node.js, Express.js, JWT Authentication, bcryptjs, CORS, Morgan, dotenv |
| **Database** | MongoDB Atlas, Mongoose ODM, Embedded & Referenced ObjectIds, Compound Indexes, Transactions / Atomic Locks |
| **Payment** | Razorpay SDK (Test Mode) + SHA256 Signature Verification + Local Mock Simulator |

---

## 🔑 Demo Credentials

The database automatically seeds 5 room categories, 25 physical rooms, 1 admin, 1 receptionist, 10 sample customers, and realistic historical/active bookings.

| Portal Role | Email Address | Password | Permissions & Purpose |
| :--- | :--- | :--- | :--- |
| **Admin** | `admin@grandheritage.com` | `Admin@123` | Full control: room CRUD, categories, financial reports, all bookings, guest accounts |
| **Receptionist** | `receptionist@grandheritage.com` | `Reception@123` | Front desk: lookup, verify payment, room allocation, check-in, check-out, live room matrix |
| **Customer 1** | `rahul.sharma@example.com` | `Customer@123` | Active in-house guest (Room 103, checked in) |
| **Customer 2** | `priya.patel@example.com` | `Customer@123` | Active in-house guest (Room 201, checked in) |
| **Customer 3** | `amit.verma@example.com` | `Customer@123` | Upcoming confirmed guest (Room 301) |
| **Customer 4** | `sneha.reddy@example.com` | `Customer@123` | Upcoming confirmed guest (Executive Suite 401) |

*Note: You can also register a brand-new customer account directly from the frontend registration page.*

---

## 📂 Project Folder Structure

```
hotel-reservation-system/
├── backend/
│   ├── src/
│   │   ├── config/
│   │   │   ├── db.js                 # MongoDB Atlas / In-Memory fallback connection
│   │   │   └── razorpay.js           # Razorpay Test Mode & Mock Mode setup
│   │   ├── controllers/
│   │   │   ├── adminController.js      # Admin dashboard KPIs & financial reports
│   │   │   ├── authController.js       # Customer/staff register & login
│   │   │   ├── bookingController.js    # Availability, hold lock, create & cancel
│   │   │   ├── paymentController.js    # Razorpay orders & SHA256 verification
│   │   │   ├── receptionController.js  # Front desk, check-in, check-out, room allocation
│   │   │   └── roomController.js       # Room CRUD & public availability query
│   │   ├── middleware/
│   │   │   ├── auth.js                 # JWT verification & role-based authorization
│   │   │   └── errorHandler.js         # Centralized error handler
│   │   ├── models/
│   │   │   ├── Booking.js              # Booking schema with compound indexes
│   │   │   ├── Cancellation.js         # Cancellation policy & refund tracking
│   │   │   ├── CheckIn.js              # CheckIn/CheckOut audit records
│   │   │   ├── Payment.js              # Razorpay transaction records
│   │   │   ├── Room.js                 # Physical rooms (roomNumber, floor, status)
│   │   │   ├── RoomType.js             # Room categories (Standard, Deluxe, Premium, etc.)
│   │   │   └── User.js                 # User accounts with bcrypt password hashing
│   │   ├── routes/
│   │   │   ├── adminRoutes.js
│   │   │   ├── authRoutes.js
│   │   │   ├── bookingRoutes.js
│   │   │   ├── paymentRoutes.js
│   │   │   ├── receptionRoutes.js
│   │   │   └── roomRoutes.js
│   │   ├── utils/
│   │   │   ├── bookingUtils.js         # Pricing, Indian GST slabs, refund policy, ID generator
│   │   │   └── generateToken.js        # JWT token signer
│   │   ├── app.js                      # Express app setup & route mounting
│   │   └── server.js                   # Server bootloader & background cleaners
│   ├── seed/
│   │   └── seed.js                     # 5 categories, 25 rooms, 12 accounts, historical bookings
│   ├── test-workflows.js               # Automated 20-scenario test runner
│   ├── package.json
│   └── .env
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── CancellationModal.jsx   # Cancellation confirmation & refund calculator
│   │   │   ├── Footer.jsx              # Luxury light theme footer
│   │   │   ├── Navbar.jsx              # Responsive navigation & role indicators
│   │   │   ├── PaymentModal.jsx        # Razorpay Checkout + Mock Payment Simulator
│   │   │   ├── ProtectedRoute.jsx      # Role-based route guard
│   │   │   ├── ReceiptView.jsx         # Printable/downloadable official tax invoice
│   │   │   └── RoomCard.jsx            # Luxury room card with amenities
│   │   ├── context/
│   │   │   └── AuthContext.jsx         # Global auth state, session persistence
│   │   ├── pages/
│   │   │   ├── AboutPage.jsx           # Heritage hotel history & credentials
│   │   │   ├── AdminDashboardPage.jsx  # Recharts graphs, room inventory CRUD, audit logs
│   │   │   ├── BookingConfirmationPage.jsx # Success screen, confetti, receipt
│   │   │   ├── BookingPage.jsx         # Guest details, stay calculation, payment trigger
│   │   │   ├── ContactPage.jsx         # Concierge desk contact & inquiries
│   │   │   ├── CustomerDashboardPage.jsx # My Bookings, tabs, view receipt, cancel
│   │   │   ├── HomePage.jsx            # Hero, quick search form, featured rooms, facilities
│   │   │   ├── LoginPage.jsx           # Sign in with quick demo buttons
│   │   │   ├── ReceptionistDashboardPage.jsx # Front desk lookup, assign room, check-in/out
│   │   │   ├── RegisterPage.jsx        # Customer registration
│   │   │   ├── RoomDetailsPage.jsx     # Multiple photos gallery, policies, instant quote
│   │   │   └── RoomsPage.jsx           # Filter by category/price/capacity, sort
│   │   ├── services/
│   │   │   └── api.js                  # Axios client with JWT interceptors
│   │   ├── utils/
│   │   │   └── formatters.js           # INR currency, Indian dates, badge helpers
│   │   ├── App.jsx                     # Router & layout definition
│   │   ├── index.css                   # Custom scrollbars, print styles, luxury theme
│   │   └── main.jsx
│   ├── package.json
│   ├── tailwind.config.js              # Custom ivory, champagne gold, beige palette
│   └── vite.config.js                  # Vite server & proxy configuration
├── .env.example
├── .gitignore
└── README.md
```

---

## ⚡ Installation & Execution Instructions

### Prerequisites
- **Node.js** (v18.x or higher, tested on v24)
- **npm** (v9.x or higher)
- Optional: MongoDB Atlas cluster URI (not required; automatic in-memory MongoDB activates if empty).

---

### 1. Backend Setup & Run

Open a terminal and navigate to the backend folder:

```powershell
cd hotel-reservation-system/backend
npm install
```

Configure environment variables:
Create or edit `hotel-reservation-system/backend/.env`:

```env
PORT=5000
NODE_ENV=development
MONGODB_URI=
JWT_SECRET=grand_heritage_luxury_jwt_secret_team6_2026
JWT_EXPIRE=30d
RAZORPAY_KEY_ID=rzp_test_placeholder
RAZORPAY_KEY_SECRET=secret_placeholder
```

Start the backend server:

```powershell
node src/server.js
```

> **What happens automatically:**  
> The server starts on port `5000`. If `MONGODB_URI` is empty, it launches an internal In-Memory MongoDB database, runs the initial seed script with 5 room types, 25 rooms, and accounts, and starts the 60-second background cleaner for expired reservations.

---

### 2. Frontend Setup & Run

Open a second terminal and navigate to the frontend directory:

```powershell
cd hotel-reservation-system/frontend
npm install
npm run dev
```

Open your browser at:
👉 **`http://localhost:3000`**

---

### 3. Running Automated Test Suite

To verify all 20 end-to-end scenarios specified in the requirements:

```powershell
cd hotel-reservation-system/backend
node test-workflows.js
```

**Expected output:**
```
============================================================
🧪 RUNNING HOTEL RESERVATION SYSTEM VERIFICATION SUITE
============================================================
✅ [PASS] 1. Customer Registration
✅ [PASS] 2. Customer Login
✅ [PASS] 3. Admin Login
✅ [PASS] 4. Receptionist Login
✅ [PASS] 5. Room Search & Category Retrieval
✅ [PASS] 6. Room Availability Checking
✅ [PASS] 7. Booking Creation with atomic 15m hold
✅ [PASS] 8. Overlap Condition Check & Double-Booking Prevention
✅ [PASS] 9. Guest Capacity Validation
✅ [PASS] 10. Failed Payment Simulation
✅ [PASS] 11. Successful Payment Verification
✅ [PASS] 12. Booking Confirmation & Receipt Retrieval
✅ [PASS] 13. Customer Booking History (My Bookings)
✅ [PASS] 14. Receptionist Search & Room Reassignment
✅ [PASS] 15. Receptionist Check-in Operation
✅ [PASS] 16. Receptionist Check-out Operation
✅ [PASS] 17. Booking Cancellation with Policy Calculation
✅ [PASS] 18. Admin Room Inventory Management
✅ [PASS] 19. Unauthorized Access Prevention (RBAC)
✅ [PASS] 20. Admin Dashboard & Receptionist Overview Stats
============================================================
📊 TEST SUITE SUMMARY: 20 PASSED, 0 FAILED
============================================================
```

---

## 🏨 Room Categories & Inventory

| Category Name | Base Price / Night | Max Guests | Bedding | Key Amenities |
| :--- | :--- | :--- | :--- | :--- |
| **Standard Room** | ₹2,499 | 2 Guests | 1 Queen Bed | High-speed Wi-Fi, LED Smart TV, Central AC, Tea/Coffee maker |
| **Deluxe Room** | ₹4,499 | 3 Guests | 1 King Bed | City views, Rainfall marble shower, Stocked mini-bar, Bathrobe |
| **Premium Room** | ₹6,999 | 3 Guests | 1 King Bed + Daybed | Private garden balcony, Deep soaking bathtub, Complimentary breakfast |
| **Executive Suite** | ₹11,999 | 4 Guests | 1 Master King Bed | Private jacuzzi, Separate designer living room, Club Lounge, Butler service |
| **Family Suite** | ₹14,999 | 5 Guests | 2 King Beds + Rollaway | 2 Master bedrooms, 2 En-suite bathrooms, Interconnected living hall, Concierge |

---

## 📋 Hotel Cancellation Policy & GST Rules

### 1. Indian Hotel GST Slabs
- **Base Rate ≤ ₹7,500/night**: 12% GST
- **Base Rate > ₹7,500/night**: 18% GST

### 2. Cancellation Policy
- **Cancelled > 48 hours prior to Check-in**: 100% Full Refund (0% cancellation fee).
- **Cancelled between 24 and 48 hours prior**: 70% Refund (30% retention fee).
- **Cancelled < 24 hours prior**: Non-refundable (100% retention fee).

---

## 📡 REST API Reference

### Authentication (`/api/auth`)
| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/auth/register` | Public | Register customer or staff |
| `POST` | `/api/auth/login` | Public | Authenticate user & return JWT token |
| `GET` | `/api/auth/profile` | Private | Retrieve logged-in user profile |

### Rooms & Availability (`/api/rooms`)
| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/rooms` | Public | List all rooms (optional query filters) |
| `GET` | `/api/rooms/:id` | Public | Get single room details |
| `POST` | `/api/rooms` | Admin | Create physical room |
| `PUT` | `/api/rooms/:id` | Admin | Update physical room |
| `DELETE` | `/api/rooms/:id` | Admin | Delete room (checks for active bookings) |
| `GET` | `/api/rooms/types/all` | Public | List all 5 room categories |
| `POST` | `/api/rooms/availability` | Public | Check date-based availability & overlap |

### Bookings (`/api/bookings`)
| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/bookings` | Private | Create reservation with 15m atomic hold |
| `GET` | `/api/bookings/my-bookings` | Customer | Customer's personal booking history |
| `GET` | `/api/bookings/:id` | Private | Lookup booking by ID or reference |
| `GET` | `/api/bookings` | Admin/Recep | List all bookings with search/filters |
| `GET` | `/api/bookings/:id/cancel-preview` | Private | Preview cancellation charges & refund |
| `POST` | `/api/bookings/:id/cancel` | Private | Confirm booking cancellation & release dates |

### Payments (`/api/payments`)
| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/payments/create-order` | Private | Generate Razorpay order ID or Mock order |
| `POST` | `/api/payments/verify` | Private | Verify crypto signature or simulate mock |
| `GET` | `/api/payments/:bookingId` | Private | Fetch payment receipt details |

### Receptionist Operations (`/api/reception`)
| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/reception/overview` | Recep/Admin | Today's check-ins, check-outs, occupied rooms |
| `GET` | `/api/reception/bookings/:bookingId` | Recep/Admin | Lookup guest booking for check-in |
| `PUT` | `/api/reception/assign-room` | Recep/Admin | Allocate or change physical room |
| `POST` | `/api/reception/check-in` | Recep/Admin | Check in guest & mark room `OCCUPIED` |
| `POST` | `/api/reception/check-out` | Recep/Admin | Check out guest & mark room `AVAILABLE` |

### Administration (`/api/admin`)
| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/admin/dashboard` | Admin | Stats KPIs, revenue trend chart, occupancy |
| `GET` | `/api/admin/revenue` | Admin | Gross revenue, refund deductions, net revenue |
| `GET` | `/api/admin/customers` | Admin | Customer directory with total stays & spend |

---

## 🎓 University Demonstration Checklist

When demonstrating this project for academic review:
1. **Homepage Walkthrough**: Showcase the luxury light theme, the search bar, featured rooms, and hotel amenities.
2. **Availability Engine**: Search for dates, demonstrate that rooms already occupied or on hold are filtered out according to the overlap condition.
3. **Booking & Pricing**: Select a room, observe automatic night count calculation, Indian GST calculation, and 15-minute temporary reservation lock.
4. **Razorpay & Mock Simulator**: Use the Payment Modal to demonstrate both real checkout options and the Mock simulation mode (`Simulate Success` / `Simulate Failure`).
5. **Confirmation & Tax Invoice**: View the celebratory confirmation screen, download/print the official receipt with GSTIN and booking reference.
6. **Customer Self-Service Dashboard**: Show upcoming vs. past vs. cancelled bookings; trigger the cancellation preview to see real-time refund policy calculations.
7. **Receptionist Desk**: Log in as `receptionist@grandheritage.com`, look up the reservation by booking ID, reassign room if desired, and perform **Check-in** (watch room change to `OCCUPIED`) and **Check-out** (watch room return to `AVAILABLE`).
8. **Admin Command Center**: Log in as `admin@grandheritage.com`, inspect the Recharts revenue & occupancy graphs, manage room units (try deleting a room with active booking to see the protection error), and audit customer spend.
9. **Automated Test Suite**: Run `node test-workflows.js` in terminal to demonstrate 20/20 test passing.

---

**Developed for Team-6 Capstone Demonstration • The Grand Heritage Hotel Reservation System**

