# GearGuard (CareTracker)

GearGuard is a full-stack maintenance tracking application designed to streamline the management of equipment, work orders, and maintenance teams. It features a modern dashboard, Kanban-style task management, and asset tracking.

## 🚀 Features

* **Dashboard Overview:** Visual metrics and quick insights into maintenance status.
* **Asset Management:** Comprehensive inventory list of equipment (Machines, Vehicles, Laptops) with status tracking (Operational, Unusable).
* **Kanban Board:** Drag-and-drop interface for managing maintenance requests through different stages (New, In Progress, Completed).
* **Maintenance Calendar:** Visual schedule for upcoming maintenance tasks and work orders.
* **History & Tracking:** Detailed history logs for every piece of equipment.
* **Team Management:** Assignment of assets and work orders to specific teams (e.g., Mechanics, IT Support) and technicians.

## 🛠️ Tech Stack

### Client (Frontend)
* **Framework:** [React 19](https://react.dev/) with [Vite](https://vitejs.dev/)
* **Styling:** [Tailwind CSS v4](https://tailwindcss.com/)
* **State & UI:**
    * `react-beautiful-dnd` for Kanban boards.
    * `react-big-calendar` for scheduling.
    * `recharts` for data visualization.
* **HTTP Client:** Axios

### Server (Backend)
* **Runtime:** Node.js
* **Framework:** [Express](https://expressjs.com/)
* **Database:** PostgreSQL
* **ORM:** [Prisma](https://www.prisma.io/)
* **Tools:** Nodemon (dev), Dotenv

## 📂 Project Structure

```bash
├── client/                 # React Frontend
│   ├── src/
│   │   ├── components/     # Dashboard, Kanban, Forms, etc.
│   │   ├── assets/
│   │   ├── api.js          # Axios instance
│   │   └── App.jsx         # Main layout and routing
│   └── package.json
│
└── server/                 # Express Backend
    ├── prisma/
    │   ├── schema.prisma   # Database Models (User, Team, Equipment, Request)
    │   └── migrations/
    ├── index.js            # Server entry point
    └── package.json
