# Educational Incident Tracking System

## 📖 Description
This project is a **web-based Incident Tracking System** developed as part of the course  
**ISW-811 – Desarrollo de Aplicaciones Web Utilizando Software Libre** at Universidad Técnica Nacional.

The system allows different user roles to **register, manage, assign, and track technical support incidents** in a centralized and traceable manner, following a complete ticket lifecycle with historical records and SLA compliance.

The project fully meets the functional and technical requirements defined in the academic specification, with the exception of the **notification module**, which is defined and designed but planned for future implementation.

---

## 🛠 Technologies
- **Backend:** Node.js (v22.14.0+) with TypeScript
- **ORM:** Prisma
- **Database:** MySQL
- **Frontend:** Angular (v20+)
- **Architecture:** Layered Architecture (separation of concerns)
- **Version Control:** Git

---

## 🧱 System Architecture
The system follows a layered architecture that ensures scalability, maintainability, and clear separation of responsibilities.

```text
project-root
│
├── backend
│   ├── application   → Business logic and use cases
│   ├── infrastructure → Database access and persistence
│   └── api            → Controllers and endpoints
│
└── frontend
    └── Angular application (modules, components, services)
```

## 👥 User Roles

### 👤 Client
- Registers incidents
- Tracks ticket status
- Closes resolved tickets

### 🧑‍🔧 Technician
- Manages assigned tickets
- Updates ticket status
- Adds observations
- Resolves incidents

### 🧑‍💼 Administrator
- Supervises the full ticket lifecycle
- Manages users and technicians
- Configures categories and SLA rules
- Generates and reviews system reports

---

## ✨ Main Features

### 🔐 Authentication & Authorization
- Secure user registration and login
- Role-based access control (Administrator, Technician, Client)
- Password encryption
- Last login tracking

---

### 🎫 Ticket Management
- Ticket creation with:
  - Title
  - Description
  - Priority
  - Category
  - Attachments
- Complete ticket lifecycle:

```text
Pending → Assigned → In Progress → Resolved → Closed
```

- Role-based state transitions
- Full historical tracking of all status changes, including:
- Date and time
- Responsible user
- Observations
- Associated images

---

### 📊 Calculated Fields & SLA
- Resolution time (in days)
- SLA response deadline
- SLA resolution deadline
- SLA response compliance
- SLA resolution compliance

All SLA-related values are calculated automatically based on category configuration.

---

### 🗂 Categories, SLA & Labels
- Categories associated with:
- SLA definitions
- Technical specialties
- Descriptive labels
- SLA consistency validation
- Shared SLA configuration across multiple categories

---

### 🧑‍🔧 Technician & Specialty Management
- Technician registration and update
- Assignment of technical specialties
- Automatic workload calculation
- Availability status management

---

### ⚙ Ticket Assignment

#### 🔄 Automatic Assignment (Autotriage)
- Based on:
- SLA urgency
- Ticket priority
- Technician workload
- Specialty compatibility

#### ✋ Manual Assignment
- Performed by administrator
- Visual technician selection with workload indicators
- Full assignment history tracking

---

### 🗓 Assignment Visualization
- Visual overview of technician assignments
- Tickets organized by time period
- SLA urgency indicators
- Quick actions for ticket management

---

### ⭐ Service Rating
- Clients can rate closed tickets
- Rating scale from **1 to 5**
- Optional comments
- Validation to prevent duplicate ratings

---

### 📊 Administrator Dashboard
- Tickets grouped by status
- Tickets created per month
- SLA compliance metrics
- Technician performance ranking
- Categories with highest SLA violations
- Average service ratings

---

### 🌍 Internationalization (I18N)
- Support for **English** and **Spanish**
- Language selection mechanism
- Persistent language preference
- Full translation of:
- Titles, buttons, labels, and placeholders
- Validation messages
- UI-level notifications
- Date formats based on selected language

> **Note:** Database-stored content is not translated.

---

### 🔔 Notifications (Future Implementation)
The system includes a **designed notification model** planned for future implementation.

Planned notifications:
- Ticket assignment
- Status changes
- New observations
- User login events

Each notification will support:
- Read / unread status
- Event type
- Timestamp
- User-level traceability

---

## 🎯 Project Purpose
This project was developed to:
- Apply real-world web application design principles
- Implement a complete incident tracking workflow
- Practice clean architecture and modular development
- Integrate SLA management and automated assignment logic
- Demonstrate full-stack development skills using modern technologies

---

## 👨‍💻 Author
**Moisés Castro Madrigal**  
Software Development Engineering Student  
Universidad Técnica Nacional


  
