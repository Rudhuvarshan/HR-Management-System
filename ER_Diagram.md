# HRMS Entity-Relationship Diagram (ERD)

```text
[ User ]
  |-- _id (PK)
  |-- name (String)
  |-- email (String, Unique)
  |-- password (String, Hashed)
  |-- role (Enum: Admin, HR, Manager, Employee)
  |-- department (String)
  |-- designation (String)
  |-- managerId (FK -> User._id)
  |-- skills (Array of Strings)
  |-- contactInfo (Object)
  |-- emergencyContact (Object)
  |-- avatar (String URL)
  |-- certifications (Array of Objects)

[ Attendance ]
  |-- _id (PK)
  |-- employeeId (FK -> User._id)
  |-- date (Date)
  |-- clockIn (Datetime)
  |-- clockOut (Datetime)
  |-- status (Enum)
  |-- workHours (Number)
  |-- locationCoordinates (Object)

[ Leave ]
  |-- _id (PK)
  |-- employeeId (FK -> User._id)
  |-- leaveType (Enum: Sick, Casual, Paid)
  |-- startDate (Date)
  |-- endDate (Date)
  |-- status (Enum: Pending, Approved, Rejected)
  |-- reason (String)
  |-- managerId (FK -> User._id)

[ Performance (Goal) ]
  |-- _id (PK)
  |-- employeeId (FK -> User._id)
  |-- title (String)
  |-- description (String)
  |-- dueDate (Date)
  |-- status (Enum)
  |-- selfReview (String)
  |-- managerFeedback (String)
  |-- rating (Number)

[ Payroll ]
  |-- _id (PK)
  |-- employeeId (FK -> User._id)
  |-- month (String)
  |-- year (Number)
  |-- baseSalary (Number)
  |-- allowances (Number)
  |-- deductions (Number)
  |-- tax (Number)
  |-- netSalary (Number)
  |-- status (Enum)

[ Expense ]
  |-- _id (PK)
  |-- employeeId (FK -> User._id)
  |-- title (String)
  |-- amount (Number)
  |-- category (Enum)
  |-- receiptUrl (String)
  |-- status (Enum)
  |-- submittedDate (Date)

[ Job ]
  |-- _id (PK)
  |-- title (String)
  |-- department (String)
  |-- description (String)
  |-- requirements (Array of Strings)
  |-- status (Enum: Open, Closed)

[ Application ]
  |-- _id (PK)
  |-- jobId (FK -> Job._id)
  |-- applicantName (String)
  |-- email (String)
  |-- resumeUrl (String)
  |-- coverLetter (String)
  |-- status (Enum)
```

## Relationships
- **User (1) to Attendance (M)**: An employee has multiple attendance records.
- **User (1) to Leave (M)**: An employee can submit multiple leave requests. Manager approves them.
- **User (1) to Performance (M)**: An employee has multiple performance goals.
- **User (1) to Payroll (M)**: An employee has multiple monthly payslips.
- **User (1) to Expense (M)**: An employee can submit multiple expense claims.
- **User (1) to User (M)**: A Manager (User) manages multiple Employees (Users) via `managerId`.
- **Job (1) to Application (M)**: A job posting receives many applications.
