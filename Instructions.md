# Complete HRMS Step-by-Step User Guide

This guide walks you through the entire MERN Human Resource Management System. It explains how to get started, set up your users, and use every single module step-by-step.

---

## Part 1: Initial Setup & Running the Apps

### 1. Configure the Environment
Ensure your `.env` files are correct.
*   **Backend** (`backend/.env`):
    ```env
    PORT=5000
    MONGO_URI=mongodb+srv://rudhu:rudhu123@cluster0.2ghl2sq.mongodb.net/?appName=Cluster0
    JWT_SECRET=supersecrethrmskey123
    ```

### 2. Start the Servers
Open two separate terminal windows inside the `vertical_ai` folder.
*   **Terminal 1 (Backend)**:
    ```bash
    cd backend
    npm run dev
    ```
*   **Terminal 2 (Frontend)**:
    ```bash
    cd frontend
    npm run dev
    ```

### 3. Access the Application
Go to `http://localhost:5173/` in your web browser. You will see the Login screen.

---

## Part 2: Step-by-Step Usage

### Module 1: Authentication & User Registration
1. **Register the First Admin User:**
   - On the Login screen, click **"Don't have an account? Sign up"**.
   - Fill out your details: Name, Email, Password.
   - Set the **Role** to **Admin**.
   - Click Sign Up. You are immediately logged into the Dashboard!
2. **Login:**
   - Anytime you return to the app, use your Email and Password on the main Login screen to access your portal.

### Module 2: The Dashboard
- After logging in, you'll see a high-level summary.
- **As an Admin/HR/Manager**: You'll see company-wide stats (Total Employees, Pending Leaves, Open Jobs).
- **As an Employee**: You'll see a simplified dashboard with quick action buttons (Clock In, Apply Leave, Submit Expense).

### Module 3: Employee Directory
1. **View Employees**: Click **Employees** on the sidebar. Everyone in the company is listed here.
2. **Add Employees (HR/Admin only)**: 
   - Click **Add Employee**.
   - Input their details (or ask them to go to the Register page directly and choose "Employee" role).

### Module 4: Attendance Tracking
1. **Clock In**: Click **Attendance** on the sidebar. At the start of your shift, click the green **Clock In** button.
2. **Clock Out**: At the end of your shift, click the red **Clock Out** button.
3. **History**: The table below will dynamically calculate how many hours you worked that day! Admin users can view history for all employees.

### Module 5: Leave Management
1. **Apply for Leave**: Click **Leave** on the sidebar.
   - Click the blue **Apply Leave** button.
   - Select Sick, Casual, or Paid leave.
   - Choose a Start Date, End Date, and write a quick Reason. Click Submit.
2. **Approve/Reject Leave (Manager/HR)**:
   - Managers will see Pending requests in their table.
   - Click the Green Checkmark ✅ to Approve or Red X ❌ to Reject. The employee's view will update instantly.

### Module 6: Performance & Goals
1. **Assign a Goal (Manager/Admin)**:
   - Go to **Performance**.
   - Click **Assign Goal**.
   - Enter the Goal Title, Description, Due Date, and select an Employee.
2. **Update Progress**:
   - Both the employee and the manager can update a goal's status ("In Progress" -> "Completed") or write feedback and ratings.

### Module 7: Payroll
1. **Generate Payroll (HR/Admin)**:
   - Go to **Payroll**.
   - Click **Generate Payroll**.
   - Input standard deduction numbers. Net Salary is automatically calculated!
2. **View Payslips**:
   - Employees visiting the Payroll tab will see their generated monthly history securely listed on their screen.

### Module 8: Expenses
1. **Submit a Claim (Employee)**:
   - Go to **Expenses**.
   - Click **Submit Claim**.
   - Enter what you bought (e.g. "Flights to NY"), category ("Travel"), and the overall Amount.
2. **Reimbursement Approval (HR/Admin)**:
   - Navigate to the table to view the Pending expense claim and Approve/Reject it to process the reimbursement.

### Module 9: Recruitment (ATS)
1. **Post a Job (HR)**:
   - Go to **Recruitment**. Click **Post New Job**.
   - Enter a title like "Senior React Developer". It will now show up publicly!
2. **Apply to Job**:
   - Open roles are displayed in a Kanban-style grid. Clicking Apply allows future external applicants to submit resumes straight into the HRMS database.
