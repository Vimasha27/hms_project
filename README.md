# CareSync Hospital Management System (HMS)

CareSync is a full-stack, enterprise-grade Hospital Management System designed to digitize and manage patient registrations, doctor consultations, electronic medical records (EMR), pharmacy inventory, laboratory test pipelines, inpatient bed allocations, and billing.

---

## 🏗️ Architecture & Technology Stack

- **Backend**: Node.js, Express.js, TypeScript, Prisma ORM, JWT, Bcrypt, Zod
- **Frontend**: React.js, TypeScript, Vite, Tailwind CSS, Lucide Icons, React Router
- **Database**: PostgreSQL (Cloud or Local) with relational schema and ACID transactions
- **Data Safety & Integrity**: Role-Based Access Control (RBAC), Audit Trails, FIFO Pharmacy Dispensation

---

## 🚀 Live Services

- **Frontend Application**: [http://localhost:5173](http://localhost:5173)
- **Backend REST API**: [http://localhost:5000](http://localhost:5000)
- **API Health Check**: [http://localhost:5000/api/health](http://localhost:5000/api/health)
- **Database Connection**: Configured in `server/.env` (supports Cloud PostgreSQL or Local)

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
│       ├── check-db.ts         # Database connection diagnostic tool
│       ├── backup-db.ts        # Database JSON backup utility
│       └── restore-db.ts       # Database JSON restore utility
├── docker-compose.yml          # Optional local PostgreSQL container setup
└── docs/
    ├── project_specification.md
    └── implementation_plan.md
```

---

## 🛠️ Database Setup (Cloud or Local)

CareSync HMS connects to any standard PostgreSQL database. You can use a managed **Cloud Database** or a **Local Database**.

### Option A: Cloud Database (Recommended)
1. Create a PostgreSQL database on any provider:
   - **Supabase**: [supabase.com](https://supabase.com)
   - **Neon**: [neon.tech](https://neon.tech)
   - **Render**: [render.com](https://render.com)
   - **Railway**: [railway.app](https://railway.app)
   - **AWS RDS / GCP Cloud SQL / Azure Database**
2. Copy your connection URI and update `server/.env`:
   ```env
   DATABASE_URL="postgresql://[USER]:[PASSWORD]@[HOST]:[PORT]/[DATABASE]?sslmode=require"
   ```
3. Test your connection:
   ```bash
   cd server
   npm run db:check
   ```
4. Push the schema and seed initial demo data:
   ```bash
   npm run db:push
   npm run prisma:seed
   ```

### Option B: Local Database
If you prefer running PostgreSQL locally, you have two options:

- **Via Docker (Quickest)**:
  ```bash
  docker compose up -d
  ```
  *(Spins up a lightweight PostgreSQL 16 container at `localhost:5432`)*

- **Via Installed PostgreSQL (Windows / Linux / macOS)**:
  Ensure PostgreSQL is running locally and set `DATABASE_URL` in `server/.env`:
  ```env
  DATABASE_URL="postgresql://postgres:password@localhost:5432/hms_db"
  ```

Then apply schema and seed data:
```bash
cd server
npm run db:push
npm run prisma:seed
```

---

## 🛠️ Running the Application

### 1. Start All Services (Windows batch)
Double-click `start_all.bat` or run:
```cmd
start_all.bat
```

### 2. Manual Startup

**Backend API**:
```bash
cd server
npm run dev
```

**Frontend App**:
```bash
cd client
npm run dev
```
