# CareSync Hospital Management System (HMS)

CareSync is a full-stack, enterprise-grade Hospital Management System designed to digitize and manage patient registrations, doctor consultations, electronic medical records (EMR), pharmacy inventory, laboratory test pipelines, inpatient bed allocations, and billing.

---

## 🏗️ Architecture & Technology Stack

- **Backend**: Node.js, Express.js, TypeScript, Prisma ORM, JWT, Bcrypt, Zod
- **Frontend**: React.js, TypeScript, Vite, Tailwind CSS, Lucide Icons, React Router
- **Database**: PostgreSQL (port 5432) with relational schema and ACID transactions
- **Data Safety & Integrity**: Role-Based Access Control (RBAC), Audit Trails, FIFO Pharmacy Dispensation

---

## 🚀 Live Services

- **Frontend Application**: [http://localhost:5173](http://localhost:5173)
- **Backend REST API**: [http://localhost:5000](http://localhost:5000)
- **API Health Check**: [http://localhost:5000/api/health](http://localhost:5000/api/health)
- **Database Connection**: `postgresql://postgres:password@localhost:5432/hms_db`

---

## 🔑 Demo Login Credentials

| Role | Username | Password | Key Responsibilities |
| :--- | :--- | :--- | :--- |
| **System Admin** | `admin` | `Admin@123` | Hospital KPIs, user roles, department config |
| **Doctor** | `dr_smith` | `Admin@123` | Consultation, EMR, prescription pad, lab test orders |
| **Receptionist** | `reception` | `Admin@123` | Patient registrations, appointment scheduling |
| **Pharmacist** | `pharmacist` | `Admin@123` | Rx fulfillment, stock monitoring, expiry tracking |
| **Lab Tech** | `labtech` | `Admin@123` | Specimen collection, result recording, reports |

*(You can also use the **Quick Role Switch** buttons directly on the Login screen).*

---

## 📁 Project Structure

```
hms_project/
├── client/                     # React.js Frontend
│   ├── src/
│   │   ├── components/layout/  # Sidebar, Header, Protected AppLayout
│   │   ├── context/            # AuthContext (JWT session management)
│   │   ├── pages/
│   │   │   ├── auth/           # Login screen
│   │   │   ├── dashboard/      # Operational KPI Dashboard
│   │   │   ├── patients/       # Directory & 360° Patient Dossier
│   │   │   ├── appointments/   # Appointment scheduler & calendar
│   │   │   ├── emr/            # Clinical consultation & Rx Pad
│   │   │   ├── pharmacy/       # Inventory catalog & Rx dispensation
│   │   │   ├── laboratory/     # Diagnostic test requests & result entry
│   │   │   ├── inpatient/      # Ward bed occupancy visualizer
│   │   │   └── billing/        # Invoice generator & payment reconciliation
│   │   └── services/           # Axios client with auth interceptors
├── server/                     # Node.js Express Backend
│   ├── prisma/
│   │   ├── schema.prisma       # Complete PostgreSQL relational schema
│   │   └── seed.ts             # Hospital baseline seed script
│   ├── src/
│   │   ├── config/             # Environment configuration
│   │   ├── controllers/        # REST Controllers (Auth, Patients, EMR, etc.)
│   │   ├── middlewares/        # JWT Authentication, RBAC, Zod validation
│   │   ├── routes/             # Express API router declarations
│   │   └── utils/              # Prisma client singleton
│   └── scripts/
│       └── run-db.ts           # PostgreSQL daemon starter
└── docs/
    ├── project_specification.md
    └── implementation_plan.md
```

---

## 🛠️ Running the Application

### 1. Database
```bash
cd server
npm run prisma:seed
```

### 2. Backend API
```bash
cd server
npm start        # Production compiled build
# or
npm run dev      # Development with watch mode
```

### 3. Frontend App
```bash
cd client
npm run dev
```
