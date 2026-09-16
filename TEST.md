# Manual Testing Guide - Multi-Company System

Use this guide to verify the implementation of Phase 2 to Phase 7 on your local machine.

### NOTE
Since port 5173 is currently in use on your machine, Vite has started the development server at `http://localhost:5174/` (or `http://localhost:5173/` if port 5173 becomes free). You can use either port depending on which server you have active.

---

## 1. Central Global Selector
- **URL to open:** `http://localhost:5174/dashboard`
- **What to verify:**
  - Look at the top bar on the right side. You will see a dropdown labeled "Company" (which defaults to All Companies).
  - Click the dropdown to switch to "Apex Real Estate Partners".
  - Verify that the dashboards instantly update.
  - Refresh the page (F5). Verify that the selected company is still locked to "Apex Real Estate Partners".
  - Go to settings/profile and switch users. Users with restricted roles (such as Admin or Landlord) will only see their assigned companies inside the dropdown.

---

## 2. Overview, Vacancy, & Revenue Dashboards
- **URLs to open:**
  - Overview Dashboard: `http://localhost:5174/dashboard`
  - Vacancy Dashboard: `http://localhost:5174/vacancy`
  - Revenue Dashboard: `http://localhost:5174/revenue`
- **What to verify:**
  - Under All Companies, you will see the combined aggregates of all properties/units.
  - Switch the top dropdown to "Soros Capital LLC".
  - Verify that the statistics, revenue graphs, and vacancy lists update to only reflect the building(s) owned by Soros Capital LLC.

---

## 3. Buildings & Units List
- **URLs to open:**
  - Buildings List: `http://localhost:5174/properties/buildings`
  - Units List: `http://localhost:5174/units`
- **What to verify:**
  - On both pages, there is a new Company column in the table showing which company owns the building/unit.
  - Change the global company selector. The list of rows will immediately filter.
  - Verify that the table-level search bar and filters respect the selected company.

---

## 4. Tenant List & Details
- **URL to open:** `http://localhost:5174/tenants`
- **What to verify:**
  - In the tenant cards, you will see a badge showing the tenant's Company Name.
  - Click the "View" button on any tenant.
  - Under the Tenant Details page, verify that the Company Name badge is displayed next to the tenant status header.

---

## 5. Unit Details & Breadcrumbs
- **URL to open:** `http://localhost:5174/units`
- **What to verify:**
  - Click the "View" button next to any unit in the table.
  - Look at the top of the details page. You will see breadcrumbs displaying: `Company: [Company Name] / Building: [Building Name] / Apartment (Unit): [Unit Number]` (Example: `Company: Apex Real Estate Partners / Building: Parkview Heights / Apartment (Unit): Apt 101`)

---

## 6. Lease History
- **URL to open:** `http://localhost:5174/leases`
- **What to verify:**
  - You will see a new Company column in the leases table.
  - Change the global company selection to verify that only leases matching the active company are shown.

---

## 7. Invoices & Rent Roll
- **URLs to open:**
  - Invoices: `http://localhost:5174/payments/invoices`
  - Rent Roll Report: `http://localhost:5174/reports/rent-roll`
- **What to verify:**
  - Check the new Company column in both lists.
  - In the Rent Roll Report, changing the selected company recalculates the dynamic financial summary header (Total Rent, Deposits, Outstanding Balance, and Occupancy Rate) in real-time.

---

## 8. Lease Renewals Dashboard & Details
- **URLs to open:**
  - Renewals List: `http://localhost:5174/leases/renewals`
  - Renewal Details: `http://localhost:5174/leases/renewals/1`
- **What to verify:**
  - Open the renewals list. Click Expiry Calendar toggle to switch between the tabular list and calendar view.
  - Change the global company selector. Verify KPI totals and list records adapt dynamically.
  - Click View Details (eye icon) on any row.
  - On the details page, change the Workflow Status dropdown. Verify that the Audit Timeline at the bottom automatically appends a status transition log.
  - Try typing an internal note or document file name and click add. Verify it persists reactively in localStorage.

---

## 9. Rent Collection & Accounts Receivable Workspace
- **URL to open:** `http://localhost:5174/payments/collection`
- **What to verify:**
  - Open the collection workspace. Verify the 7 KPI cards at the top show correct aggregated financial figures.
  - Click Rent Invoices Grid tab. Click the chevron arrow next to any row to expand it. Try duplicating, downloading PDF, or marking the invoice as sent. Verify the timeline history records these events dynamically.
  - On an unpaid row (e.g. John Doe), click Record Pay. Input a partial payment (e.g. 500) and submit. Verify that:
    - Outstanding balance updates dynamically.
    - Invoice status transitions to "Partial Payment".
    - Expanded timeline logs "Payment Received: $500".
  - Select the Tenant Ledgers tab. Choose "John Doe" from the dropdown. Verify that you see a double-entry accounting-style transaction journal with accurate running balances.
  - Select the Accounts Aging tab to view overdue balance aging buckets (0-30, 31-60, 61-90, 90+ days) and lists of highest debtors.
  - Swap the Global Company Selector in the top bar. Verify that all tabs instantly adapt to reflect only the selected company's invoices, payments, and balances!

---

## 10. TAL Cases & Legal Case Management
- **Accessing the Workspace:** Click directly on the TAL Cases root-level menu item in the sidebar (sub-menus are removed).
- **URLs to open:**
  - TAL Cases Workspace: `http://localhost:5174/tal-cases`
  - Case Details page: `http://localhost:5174/tal-cases/1`
- **What to verify:**
  - Open the TAL Cases Workspace. Verify the 8 KPI cards at the top display correct aggregated figures from the services layer.
  - Switch tabs to All Legal Cases tab. Try changing the status of any case via the dropdown next to the row. Verify that:
    - The status badge changes instantly.
    - Clicking the eyeball icon opens the Case Details page.
  - On the Case Details page, scroll down to Audit Timeline & History. Verify the status change you just performed is logged chronologically as an append-only event!
  - Scroll to Internal Legal Notes on the details page. Try writing a note and submitting. Verify it is persisted in localStorage with correct author ("Admin User") and timestamp.
  - Scroll to Legal Tasks & Follow-ups. Try adding a task, marking it complete, or deleting it. Verify it synchronizes instantly with the local state.
  - Scroll to Tribunal Hearings Schedule. Schedule a mock hearing (e.g. for tomorrow). Verify it is logged in the case detail list and updates the next hearing details.
  - Scroll to Legal Documents. Upload a mock document (e.g. "evidence.pdf"). Verify it appears in the documents list and is saved.
  - Swap the Global Company Selector in the top bar. Verify that all cases, calendar events, and overdue tasks filter instantly without page reload!

---

## 11. Notes Hub & Communication
- **URLs to open:**
  - Notes Hub: `http://localhost:5174/notes-hub`
- **What to verify:**
  - Login as `admin@property.com`. Open Sidebar → Notes Hub.
  - Verify the Overview tab has KPIs, note activity feed, and pinned notes list.
  - Switch to the All Notes tab and verify dynamic filters (date range, type, priority, and author) work properly.
  - Click on any note to view details, write comments, append mock attachments, and inspect the note's action history timeline.
  - Swap the Global Company Selector. Verify notes filter by company.
  - Verify the top-bar bell shows the latest notifications count.
  - Coworker test: Log in as `coworker@property.com`. Sarah has Notes Hub access; Mike does not (the menu is hidden from the sidebar).

---

## 12. Time & Payroll Management
- **URLs to open:**
  - Dashboard: `http://localhost:5174/payroll/dashboard`
  - Employees: `http://localhost:5174/payroll/employees`
  - Attendance: `http://localhost:5174/payroll/attendance`
  - Shifts: `http://localhost:5174/payroll/shifts`
  - Leaves: `http://localhost:5174/payroll/leaves`
  - Overtime: `http://localhost:5174/payroll/overtime`
  - Run Payroll: `http://localhost:5174/payroll/run`
  - Audit Timeline: `http://localhost:5174/payroll/timeline`
- **What to verify:**
  - **Employee Directory:** Click "Add Employee". Fill in the details (FirstName: John, LastName: Doe, Email: john.doe@property.com, Designation: Clerk, Salary: 3200) and click save. Verify that a unique multi-company Employee ID (e.g., `EMP-APEX-2026-00003`) is generated.
  - **Shift configuration & grace rules:** In Shifts Management, review pre-seeded shift cards. Assign a shift profile to your employees.
  - **Attendance clocking & visual timeline:** Open Attendance Management. Click "Clock In" to record attendance. Verify you can review logs and approval requests for corrections.
  - **Leave applications & absence calendar:** Go to Leave Management. Approve a pending leave request. Check if the approved leave appears in the Leave Calendar tab.
  - **Overtime logger & costs calculator:** Go to Overtime Tracking. Review KPIs. Click "Log Overtime" to submit hours for approval.
  - **Configurable Approval Workflows:** Go to Run Payroll. Open the Workflow Config tab. Switch between *Auto-Approval*, *Single Level*, and *Two Level* approvals.
  - **Processing runs, audits, and payslips:** Under the Payroll Runs tab, click "Run Payroll" to process salaries for June 2026. Run through the approvals as per the active policy configuration, and click "Pay". Click "View Payslip" (eye icon) to open and print the itemized payslip card.
  - **Location Invoices & Receipt Uploads:** In the Payroll Runs table, observe the new **Location** column showing each employee's building assignment. Click the **Invoice icon (FileText)** to open the Location Invoice modal, demonstrating how labor costs are allocated and billed to each specific property (with print options). For "Paid" records, click the **Upload icon** to attach a payout transfer receipt (e.g. `wire_transfer_soros_june.pdf`) which appends an audit event to the timeline and displays a paperclip badge on the row.
  - **Timeline logging & local persistence:** Open the Audit Timeline page and confirm all transactions (leave approvals, run logs, receipt attachments) are stored in chronological order. Switch the Global Company Selector and verify that all data filters instantly.

## 13. Enterprise Reports & Portfolio Analytics
- **URLs to open:**
  - Reports Hub: `http://localhost:5174/reports`
- **What to verify:**
  - **Executive Dashboard Widgets:** Load the dashboard. Verify that KPIs (Occupancy, Revenue, Receivables, Active Lawsuits, and Payroll) load and respond to the Global Company Selector. Click **Configure Dashboard Layout** to toggle widget visibility or reset layout parameters. Verify that KPI cards support drilldown navigation to corresponding reports.
  - **Operational Alerts:** Look at the operational alert log. Verify critical notifications are displayed based on current balances.
  - **Standard Drill-Down Reports:** Click the **Standard Reports** tab. Browse through the financial reports (Rent Roll, Outstanding Balance, Rent Collection, Late Payments, and Aging Report), property reports, and litigation (TAL) cases. Make sure the Maintenance placeholders display outstanding repairs, upcoming repairs, costs, and **Furniture Status** reports.
  - **Saved Filter Templates:** In the Standard Reports view, adjust some filters, input a name in "Save current filters as...", and click **Save Filters**. Verify you can reload this configuration from the saved filters dropdown.
  - **Interactive Analytics:** Click the **Interactive Charts** tab. Verify the Area chart (Revenue), Donut chart (Occupancy Target), and Bar charts render correctly. Check the **Location Heat Map** grid representing access density.
  - **Report Builder Queries:** Open the **Custom Report Builder** tab. Select a module (e.g. Leases), select custom checkboxes for columns, configure sorting parameters, and click **Generate Custom Report**. Input a name to save the query as a template and load/delete it from the template sidebar.
  - **Audit Trails & Recurrence Schedules:** Open the **Schedules & Auditing** tab. Verify the audit log records all generated and exported reports from this session. Click **Schedule** to configure a weekly/monthly email report format for multiple recipient addresses.
  - **Export Formats:** Click **CSV**, **Excel**, or **PDF** next to standard or custom builder reports. Confirm file generation and mock notifications trigger correctly.

## 14. Enterprise Integrations Hub
- **URLs to open:**
  - QuickBooks Sync & Integrations: `http://localhost:5174/settings/quickbooks`
  - Send Email: `http://localhost:5174/admin/email/composer`
  - Sent Email History: `http://localhost:5174/admin/email/history`
- **What to verify:**
  - **QuickBooks Integration (Multi-Company):** Open the QuickBooks tab. Input OAuth Client Key and Secret to save credentials. Select a mapped company file (e.g. Apex Real Estate Partners) and a data type (e.g. Invoices, Payments, Customers, Vendors, Chart of Accounts). Trigger a manual synchronization, which places a sync task in the Sync Queue and updates the Mapped Chart of Accounts ledger table dynamically.
  - **Google Calendar Synchronization:** Click the Google Calendar Sync tab on the same page. Verify that rent deadlines, lease expirations, and court hearings are populated on the interactive monthly grid. Click a day square to add a mock calendar event. Check that local events show a "Local Only" status badge. Trigger "Sync Calendar" to upload local records to the server, changing their status to "Synced".
  - **Email Hub Composer:** Navigate to the Send Email page from the sidebar. Select a template (e.g. Rent Due Reminder). Verify that mock merge fields (Tenant name, unit, due amount) are resolved automatically. Click "SEND EMAILS NOW" to send. Open the Sent Emails page from the sidebar to verify the history logs the transaction (Sent or Failed).
  - **Notification Center rules & alerts:** Click the Notification Settings tab in QuickBooks Sync. Enable/disable rules for late attendance and rent warnings. Filter the in-app notifications inbox by priority (High, Medium, Low) and category. Mark alerts as Read, Archive them, or click Dismiss to hide them. Confirm the notification counter updates in the header bar bell icon in real-time.
  - **Sync Queue Engine:** Open the Operations Sync Queue tab. Observe the active jobs with animated progress indicators. Test retry/cancel buttons on active or failed synchronization runs, which register auditable timeline trails.

## 15. Enterprise Maintenance, Repairs & Asset Management
- **URLs to open:**
  - Maintenance Control Center: `http://localhost:5174/maintenance`
- **What to verify:**
  - **Operations Dashboard Widgets:** View the metrics (Open, In Progress, Emergency, Waiting Parts). Verify that the Technician utilization workload meters, low stock warnings alert grid, and actual cost budget bars (Variance calculations) render correctly and update instantly upon switching properties in the filters.
  - **Maintenance Request Workflow:** Click the "Requests" tab. Select "File Request Ticket" to submit a mock plumbing or electrical issue. Observe the status transitions (New -> Assigned -> In Progress -> Closed) in the dropdown and confirm it appends a chronological audit log instantly to the Audit timeline list.
  - **Linked Work Orders:** Click the "Work Orders" tab. Create a new work order linked to an active request. Set an estimated budget. Verify actual costs and hours logged update on the overview graphs.
  - **Technicians Shifts:** Click the "Technicians" tab. Select "Clock In / Clock Out" to toggle shifting status. Verify that the GPS mock coordinates update, and logged tech hours instantly map to "Payroll Synced Hours".
  - **Asset Lifecycle Management:** Click the "Assets" tab. Check the Otis elevator and boiler items. Select a status (Purchased, Installed, Active, Under Repair, Out of Service, Replaced, Disposed) and verify the lifecycle history log tracks all details.
  - **Apartment Furniture Inventory:** Click the "Furniture" tab. Change the condition of appliances (Good, Fair, Needs Repair, Replaced). Verify replacements values aggregate.
  - **Double-Entry Stock Movements:** Click the "Inventory" tab. Log a dynamic parts movement (e.g. Consuming 5 Copper Joints). Verify that current stock levels are calculated dynamically from the ledger.


