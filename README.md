# Department Infrastructure Management System (DIMS)

A web application to track physical laboratory workstations, classroom equipment, maintenance tickets, and asset transfers for an academic department.

## Overview

I built this project to replace manual paper registers and disconnected spreadsheets used to track hardware across computer laboratories and classrooms in the Computer Science and Business Systems (CSBS) department. Faculty, lab technicians, and student representatives can report equipment faults, request machine transfers between labs, and monitor ticket resolutions. Administrators manage inventory records, approve transfer requests, and inspect full change logs with rollback support.

## Screenshots

[SCREENSHOT: Dashboard showing room statistics and active issues]

[SCREENSHOT: Digital Register lab workstation inventory view]

[SCREENSHOT: Admin issue management and equipment transfer approval modal]

## Features

- **Workstation and Classroom Registers**: View inventory by room, including individual machine serials (`sysID`), processor, RAM, HDD, installed software, and classroom desk and projector counts.
- **Two-Phase Action Requests and Rollback**: Non-admin users submit requests to add, update, delete, or transfer machines. The system snapshots the previous entity state before executing. Admins review pending items and can revert approved changes to restore original data.
- **Deleted Item Archival**: Deleted hardware records are copied to an archive collection before removal, preventing accidental loss of historical asset logs.
- **Issue Ticketing Pipeline**: Users file tickets categorized by equipment, electrical, cleanliness, safety, or furniture, complete with urgency flags, location selectors, and status tracking (`pending`, `in_progress`, `resolved`, `closed`).
- **Media Uploads**: Attach failure photos or diagnostic documents to issue tickets via Multer and Cloudinary storage.
- **Location-Scoped Access Control**: Technicians and staff can be restricted to their assigned labs, while administrators and student representatives retain global visibility.
- **Notification Feed**: In-app alert inbox notifies users when action requests are approved, rejected, or ticket statuses update.
- **Report Generation**: Export issue summaries and individual ticket records to Excel (`.xlsx`) or PDF directly from the browser.

## Tech Stack

| Layer | Technology | Version | Purpose |
|---|---|---|---|
| Frontend | React | 18.3.1 | User interface components |
| Language | TypeScript | 5.8.3 | Type checking across frontend codebase |
| Build Tool | Vite | 5.4.19 | Frontend compilation and dev server |
| Styling | Tailwind CSS | 3.4.17 | Interface styling and design tokens |
| UI Components | Radix UI primitives | Various | Accessible dialogs, dropdowns, and tables |
| State & Queries | TanStack Query | 5.83.0 | Server-state caching and synchronization |
| Backend Runtime | Node.js | ES Modules | API runtime environment |
| Web Framework | Express | 4.18.2 | REST API routing and HTTP middleware |
| Database | MongoDB & Mongoose | 8.0.3 | Document schema modeling and storage |
| Authentication | JWT & bcryptjs | 9.0.2 / 2.4.3 | Token-based auth and password hashing |
| File Storage | Cloudinary & Multer | 1.41.3 / 2.0.2 | Media asset handling and image uploads |
| Reporting | jsPDF & SheetJS | 3.0.4 / 0.18.5 | PDF and Excel export generation |

## Architecture

The client communicates with the Express backend over HTTP using Axios. Protected endpoints require a JSON Web Token sent in the `Authorization` header.

The backend verifies the token, resolves user roles, and evaluates location permissions before querying MongoDB. For mutating hardware actions, requests pass through an action pipeline that saves a state snapshot before updating collections.

```
[Browser Client (React + Vite)]
            |
            | Axios (Bearer JWT)
            v
[Express API Server]
      |
      +---> Auth & Location Middleware
      +---> Action Pipeline (Creates snapshot in TransferRequest)
      +---> Cloudinary SDK (Image/Document Uploads)
      |
      v
[MongoDB Database]
  (Users, Laboratories, LabSystems, Issues, Notifications, DeletedItems)
```

## Project Structure

```
.
├── backend/
│   ├── config/          # MongoDB connection and Cloudinary configurations
│   ├── middleware/      # JWT verification, RBAC, and location scoping
│   ├── models/          # Mongoose schemas (User, Issue, Laboratory, LabSystem, etc.)
│   ├── routes/          # Express route handlers for auth, issues, labs, and actions
│   ├── scripts/         # Database seeding and Excel inventory import scripts
│   └── server.js        # Express app entry point and middleware pipeline
├── public/              # Static frontend assets
├── src/
│   ├── components/      # UI components (dialogs, tables, layout components)
│   ├── contexts/        # Auth, notification, and audit React contexts
│   ├── hooks/           # Custom React hooks (toast, mobile detection)
│   ├── pages/           # Application views (Registers, Issues, Admin, Login)
│   ├── services/        # Axios API client instances and request functions
│   ├── types/           # Shared TypeScript interfaces and enums
│   └── utils/           # Client-side PDF and Excel report builders
├── index.html           # Single-page application entry HTML
├── package.json         # Frontend dependencies and npm scripts
└── vite.config.ts       # Vite configuration with path aliases and dev server port
```

## Getting Started

### Prerequisites

- Node.js 18.x or 20.x
- npm 9.x or higher
- A running MongoDB instance (local or MongoDB Atlas connection URI)
- A Cloudinary account (required if testing image attachments)

### 1. Clone the Repository

```bash
git clone https://github.com/Gideonglady/infra-stream-net.git
cd infra-stream-net
```

### 2. Configure Environment Variables

Create `.env` in the `backend/` directory:

```bash
# backend/.env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/dims
JWT_SECRET=replace_with_a_secure_random_string
ALLOWED_ORIGINS=http://localhost:8080,http://localhost:5173
NODE_ENV=development

# Cloudinary credentials (required for image/document upload routes)
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

Create `.env` in the root frontend directory:

```bash
# .env
VITE_API_URL=http://localhost:5000
```

### 3. Install Backend Dependencies and Seed the Database

```bash
cd backend
npm install
npm run seed
```

The seed script creates initial users for each role using the environment variables configured in `backend/.env` (or default credentials):

- Admin: `admin@university.edu` / `admin123`
- Staff: `staff@university.edu` / `staff123`
- Class Rep: `rep@university.edu` / `rep123`
- Lab Tech: `tech@university.edu` / `tech123`

To import room records and laboratory systems from the provided Excel spreadsheets:

```bash
node scripts/updateClassrooms.js
node scripts/importLabSystems.js
```

### 4. Start the Backend API

```bash
npm start
```

Confirm the backend is running by visiting `http://localhost:5000/api/health`. It returns:

```json
{
  "success": true,
  "message": "DIMS Backend API is running"
}
```

### 5. Install Frontend Dependencies and Start the Dev Server

Open a second terminal in the project root:

```bash
npm install
npm run dev
```

The application runs at `http://localhost:8080`.

## Usage

### Reporting an Issue

1. Log in with a staff, faculty, or class representative account.
2. Navigate to **Report Issue** (`/issues/report`).
3. Select category, room, urgency level, and write a summary.
4. Optionally upload an image or diagnostic document.
5. Submit the ticket. Admins receive an in-app notification immediately.

### Requesting and Approving Equipment Transfers

1. A lab technician navigates to **Equipment Transfer** (`/equipment-transfer`).
2. Select an equipment item from an assigned lab, choose the destination room, and submit.
3. An admin navigates to **Admin > Approvals** (`/admin/approvals` or `/admin/transfer-approvals`).
4. The admin reviews the previous machine state and approves the request. The machine's location and serial order update automatically.
5. If the transfer was made by mistake, the admin can click **Revert** in the action history dialog to restore the machine to its source lab.

## Testing and Code Quality

Automated unit tests are not yet implemented. The frontend uses ESLint for static analysis:

```bash
npm run lint
```

To verify the production build compiles without TypeScript errors:

```bash
npm run build
```

## Challenges and Design Decisions

- **State Rollback on Asset Transfers**: When physical machines move between laboratories, their serial numbers within the lab must re-index to avoid conflicts. Rather than immediately overwriting documents upon technician submission, I routed changes through a unified `TransferRequest` model that snapshots `previousState`. This allows administrators to review differences before applying changes and enables a one-click rollback if equipment is returned or recorded incorrectly.
- **Location-Scoped Authorization**: Faculty and technicians should not alter or view tickets for rooms outside their jurisdiction, while department administrators need a campus-wide overview. Instead of hardcoding role checks into each query, I implemented a reusable `checkLocationAccess` middleware and a `getLocationFilter` query builder that appends user `assignedLocations` to MongoDB filters.

## Limitations and Future Work

- **Polling Instead of Real-time Sockets**: Issue tracking updates currently rely on periodic client-side polling rather than WebSockets.
- **Automated Test Coverage**: There are currently no end-to-end or integration tests covering authentication and transfer approvals.
- **Faculty Workflow Placeholders**: Certain faculty subroutes (`/faculty/issues`) currently render placeholder components and require full view binding.

## Contributors

- **Gideon Glady K** - [GitHub](https://github.com/Gideonglady) | [LinkedIn](https://www.linkedin.com/in/)
- **Sanjeev Lakshmanan** - [GitHub](https://github.com/Sanjeev745) | [LinkedIn](https://www.linkedin.com/in/)
- **Mathesh S** - [GitHub](https://github.com/mathesh-s123) | [LinkedIn](https://www.linkedin.com/in/)
