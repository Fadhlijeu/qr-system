# PROJECT: CUSTOM EVENT REGISTRATION SYSTEM

## 0. CONTEXT

Saya ingin membuat sistem registrasi event untuk sebuah event nyata, tetapi project ini dimulai sebagai eksperimen dan kemungkinan hanya digunakan untuk satu event.

JANGAN membuat aplikasi event dari nol.

Gunakan repository open-source berikut sebagai BASE PROJECT:

https://github.com/HiEventsDev/hi.events

Repository tersebut sudah memiliki banyak fungsi event management, ticketing, attendee management, QR check-in, dashboard, export, dan API.

Tujuan pekerjaan kamu adalah:

CLONE → AUDIT → RUN → SIMPLIFY → MODIFY → TEST → DEPLOY

Bukan:

START FROM SCRATCH → RECREATE EVERYTHING

Pertahankan sebanyak mungkin logic existing yang sudah stabil.

---

# 1. TARGET PRODUK

Produk akhir adalah sistem registrasi event sederhana.

Flow utama:

PUBLIC:

Landing Event
↓
Registration Form
↓
Submit Registration
↓
Generate Participant / Registration ID
↓
Generate Personal E-ticket
↓
Generate QR Code
↓
Show Ticket
↓
Download / Save Ticket

ADMIN:

Admin Login
↓
Dashboard
↓
Participant Management
↓
QR Scanner
↓
Check-in Validation
↓
Realtime Attendance
↓
Report / Export

---

# 2. FITUR YANG WAJIB ADA

## A. PUBLIC EVENT PAGE

Buat halaman event publik yang bisa dikustomisasi.

Minimal:

- Event title
- Event description
- Event date
- Event time
- Event location
- Cover / banner
- Event information
- CTA "Daftar Sekarang"
- Registration status

Desain harus terasa seperti website event modern, bukan dashboard internal.

---

# 3. REGISTRATION

Peserta tidak perlu membuat account.

Anonymous registration diperbolehkan.

Minimal field:

- Nama lengkap
- Nomor WhatsApp
- Email
- Instansi / organisasi

Struktur field harus mudah diperluas.

Jangan hard-code seluruh registration form apabila existing Hi.Events sudah mempunyai custom questions mechanism.

Gunakan / adapt existing mechanism bila memungkinkan.

Setelah registration berhasil:

- buat participant
- buat registration/order record yang sesuai dengan architecture existing
- generate unique ticket
- generate unique ticket identifier
- generate QR code
- tampilkan confirmation page
- tampilkan e-ticket

Tidak ada payment.

Tidak ada checkout berbayar.

Tidak ada Stripe.

---

# 4. E-TICKET

Buat e-ticket personal yang sederhana dan jelas.

Minimal:

- Nama event
- Nama peserta
- Registration ID
- Ticket ID
- QR Code
- Event date/time
- Event location

Peserta harus dapat:

- melihat tiket
- download tiket
- menyimpan tiket
- screenshot tiket

Pastikan QR tidak hanya berisi nama peserta.

QR harus menggunakan identifier/token unik yang bisa divalidasi backend.

JANGAN menyimpan informasi sensitif langsung di dalam QR.

---

# 5. QR CHECK-IN

Gunakan existing QR check-in implementation dari Hi.Events jika kompatibel.

JANGAN membuat QR/check-in system kedua apabila sistem existing sudah dapat digunakan.

Scanner harus berjalan melalui browser.

Tidak perlu APK.

Admin membuka:

/admin/check-in

atau route equivalent dari existing project.

Browser meminta akses kamera.

Flow:

Scan QR
↓
Backend validation
↓
Valid?
YES
↓
Already checked-in?
NO
↓
CHECK-IN SUCCESS
YES
↓
ALREADY CHECKED-IN
NO
↓
INVALID TICKET

Status harus sangat jelas secara visual.

Contoh:

VALID
✅ Check-in berhasil

DUPLICATE
⚠️ Peserta sudah check-in

INVALID
❌ Tiket tidak valid

---

# 6. ADMIN DASHBOARD

Dashboard harus berfokus pada event attendance, bukan ticket-selling platform.

Tampilkan:

Total Registered
Total Checked-in
Total Not Checked-in
Attendance Percentage

Contoh:

324 Registered
271 Checked-in
53 Remaining
83.6% Attendance

Tambahkan:

- recent check-ins
- participant list
- search
- filtering
- sorting
- participant detail
- manual check-in
- export

---

# 7. REALTIME ATTENDANCE

Gunakan existing realtime architecture apabila tersedia.

Jika existing realtime mechanism dapat digunakan, reuse.

Target:

Admin A membuka dashboard.
Admin B melakukan scan.

Dashboard Admin A harus dapat memperbarui jumlah check-in tanpa reload manual.

Jangan membuat websocket/realtime architecture baru jika existing architecture sudah mencukupi.

---

# 8. PARTICIPANT MANAGEMENT

Admin harus bisa:

- view participants
- search participant
- filter status
- view participant detail
- edit participant
- manually check-in
- melihat waktu check-in
- melihat status registration
- export data

Status minimal:

REGISTERED
CHECKED_IN
CANCELLED

Jangan menambah status yang tidak dibutuhkan tanpa alasan.

---

# 9. EXPORT

Minimal:

CSV

Kolom:

- Registration ID
- Ticket ID
- Name
- WhatsApp
- Email
- Organization
- Registration Date
- Check-in Status
- Check-in Time

Jika XLSX existing Hi.Events sudah stabil, boleh dipertahankan.

---

# 10. FITUR YANG TIDAK DIBUTUHKAN UNTUK V1

Karena ini hanya satu event dan tidak menggunakan pembayaran, sederhanakan atau nonaktifkan fitur berikut:

- paid tickets
- Stripe
- payment processing
- tax
- service fees
- refunds
- donation
- promo codes
- affiliate system
- referral tracking
- product add-ons
- merchandise
- invoicing
- payouts
- payment gateway management
- revenue analytics
- tax reports
- sales analytics
- marketplace-like functionality
- ticket sales optimization
- complex organizer commerce features
- unnecessary multi-event SaaS functionality
- unnecessary messaging/bulk marketing system

Jangan langsung menghapus source code besar-besaran.

Prioritas:

1. Disable
2. Hide from UI
3. Remove unnecessary routes
4. Remove unnecessary dependencies only when safe
5. Delete dead modules only after confirming they are not required

Jangan merusak dependency core hanya demi "membersihkan code".

---

# 11. WHATSAPP

JANGAN IMPLEMENT WHATSAPP DULU.

JANGAN:

- WhatsApp Cloud API
- WABA
- WhatsApp Web automation
- whatsapp-web.js
- unofficial WhatsApp bot
- template messaging

Untuk V1:

Registration
↓
Generate ticket
↓
Display ticket
↓
Download ticket

Buat architecture sedemikian rupa sehingga WhatsApp integration dapat ditambahkan nanti tanpa rewrite registration system.

Contoh:

Registration Service
Ticket Service
Notification Service

Notification Service untuk sementara dapat hanya memiliki:

email = optional / future
whatsapp = disabled / future

Jangan membuat fake WhatsApp integration.

---

# 12. USER ROLES

Untuk V1 cukup:

ADMIN
CHECK-IN STAFF

Peserta tidak perlu account.

Jika existing authentication architecture sudah kuat, reuse.

Jangan membangun permission system baru.

CHECK-IN STAFF hanya perlu mengakses:

- scanner
- participant lookup
- check-in status

ADMIN memiliki:

- dashboard
- participant management
- settings
- export
- scanner

---

# 13. EVENT SCOPE

Walaupun Hi.Events mendukung banyak event, V1 harus dioptimalkan untuk:

ONE EVENT

Tetap pertahankan underlying event architecture apabila menghapus multi-event akan merusak database/domain model.

Jadi:

UI boleh dibuat seolah-olah sistem ini untuk satu event.

Database tidak perlu dipaksa menjadi single-table event.

Contoh:

events
participants
tickets
checkins

tetap gunakan relasi existing yang sehat.

---

# 14. UI / UX

Jangan mempertahankan seluruh UI Hi.Events hanya karena existing.

Pisahkan:

PUBLIC EXPERIENCE
vs
ADMIN EXPERIENCE

Public harus sederhana dan modern.

Admin harus functional dan information-dense.

Prioritas UI:

- responsive
- mobile-first untuk peserta
- scanner-first untuk check-in staff
- desktop-friendly untuk admin
- loading states
- empty states
- error states
- success states
- confirmation states
- accessible buttons
- readable typography

Jangan melakukan redesign seluruh project sebelum functional system stabil.

---

# 15. DATABASE

JANGAN mengganti database architecture tanpa alasan.

Audit existing models terlebih dahulu.

Identifikasi existing entities yang bisa dipakai untuk:

Event
Attendee
Order/Registration
Ticket
Check-in

Jika existing entity sudah sesuai, reuse.

Buat migration baru hanya jika diperlukan.

Jangan membuat duplicate models seperti:

CustomParticipant
CustomTicket
CustomRegistration

apabila existing Hi.Events sudah mempunyai entity yang setara.

---

# 16. SECURITY

Pastikan:

- QR token tidak mudah ditebak
- registration endpoint tidak menerima arbitrary ticket manipulation
- check-in harus divalidasi server-side
- double check-in dicegah
- participant data tidak bisa diakses sembarang user
- admin routes membutuhkan authentication
- check-in staff hanya mendapatkan permission yang diperlukan
- secrets tidak pernah di-hard-code
- .env tidak di-commit
- API secrets tidak masuk frontend bundle

Jangan menganggap QR sebagai authorization.

QR hanya identifier.

Authorization dan validation tetap dilakukan backend.

---

# 17. FIRST PHASE — AUDIT

SEBELUM MODIFIKASI BESAR, lakukan audit repository.

Jangan langsung coding.

Buat laporan:

### Architecture

- frontend
- backend
- database
- authentication
- ticketing
- check-in
- realtime
- storage
- API
- deployment

### Existing Features

Buat tabel:

Feature | Existing | Needed | Keep | Disable | Modify | Remove

### File Map

Identifikasi lokasi:

- public event page
- registration
- attendee
- ticket
- QR
- check-in
- dashboard
- authentication
- export
- API
- database migrations

### Dependency Map

Jelaskan dependency yang masih dibutuhkan setelah simplification.

### Risk

Identifikasi bagian yang jangan disentuh sembarangan.

Jangan melakukan perubahan besar sebelum audit selesai.

---

# 18. SECOND PHASE — RUN ORIGINAL PROJECT

Pastikan Hi.Events vanilla bisa berjalan.

Gunakan Docker berdasarkan official installation approach.

Tujuannya:

1. clone repository
2. install dependencies
3. start containers
4. migrate database
5. create admin
6. open application
7. test existing registration
8. test existing ticket
9. test existing QR check-in

Catat seluruh error sebelum melakukan customization.

Kalau project original tidak bisa dijalankan, fix environment/setup issue terlebih dahulu sebelum redesign.

---

# 19. THIRD PHASE — CREATE SAFE WORKING BRANCH

Sebelum perubahan:

git status

Pastikan repository bersih.

Buat branch:

feature/custom-event-registration

atau nama branch equivalent yang jelas.

Jangan bekerja langsung di main.

---

# 20. FOURTH PHASE — SIMPLIFICATION

Setelah baseline berhasil:

1. Disable payment
2. Disable unnecessary commerce functionality
3. Simplify event creation
4. Simplify attendee management
5. Simplify dashboard
6. Simplify public event page
7. Simplify ticket flow
8. Keep QR/check-in core
9. Keep export
10. Keep authentication

Setiap feature removal harus diuji setelah perubahan.

Jangan melakukan 50 perubahan sekaligus lalu debugging semuanya di akhir.

---

# 21. FIFTH PHASE — CUSTOM EVENT FLOW

Implement:

/event
/register
/ticket/:id
/admin
/admin/participants
/admin/check-in
/admin/reports

Gunakan existing routing conventions bila tersedia.

Jangan membuat parallel routing architecture.

---

# 22. SIXTH PHASE — TESTING

Minimal test scenario:

## Registration

1. Open event
2. Fill registration
3. Submit
4. Registration created
5. Ticket created
6. QR created
7. Ticket shown

## Duplicate registration

Test expected behavior.

## QR

1. Scan valid QR
2. Check-in success
3. Scan same QR again
4. Must return duplicate/already checked-in
5. Scan random QR
6. Must return invalid

## Dashboard

After successful check-in:

Registered count unchanged.
Checked-in count +1.
Not checked-in count -1.
Attendance percentage recalculated.

## Multiple admins

Test simultaneous scanner usage.

## Export

CSV data must match database.

## Security

Unauthenticated user cannot open protected admin routes.

---

# 23. NON-REGRESSION RULE

CRITICAL:

DO NOT recreate functionality that already exists.

Before implementing a feature:

1. Search repository
2. Identify existing implementation
3. Determine whether it can be reused
4. Modify existing implementation if appropriate
5. Only create a new implementation if existing implementation genuinely cannot satisfy the requirement

This project is a customization of Hi.Events.

It is NOT a rewrite.

---

# 24. CODE QUALITY RULES

Do not:

- duplicate services
- duplicate models
- duplicate API endpoints
- duplicate QR logic
- duplicate authentication
- add random libraries
- rewrite stable modules without reason
- replace architecture merely because another framework is preferred
- introduce microservices
- introduce Kubernetes
- introduce unnecessary infrastructure
- add paid SaaS dependencies

Prefer:

existing service
existing component
existing model
existing API
existing validation
existing check-in architecture

---

# 25. DEPLOYMENT GOAL

Target deployment should require zero application licensing cost.

Prefer free-tier infrastructure where technically compatible.

However, do NOT redesign the application around a hosting platform before the local application is stable.

First:

LOCAL → WORKING

Then:

PRODUCTION → DEPLOYED

Do not pretend a service is permanently free if it has usage limits, billing requirements, or requires a paid resource.

Document all free-tier assumptions.

---

# 26. WHAT I EXPECT FROM YOU

At every major stage report:

### Changed

What was changed.

### Reused

Which existing Hi.Events modules were reused.

### Disabled

Which existing features were disabled.

### Removed

Which modules were actually deleted.

### Added

What new functionality was implemented.

### Tested

What was tested and result.

### Remaining

Known bugs or incomplete work.

---

# 27. IMPORTANT DEVELOPMENT BEHAVIOR

Do not start by modifying thousands of files.

Do not "clean up" the entire repository.

Do not migrate frameworks.

Do not rewrite the backend.

Do not replace React.

Do not replace Laravel.

Do not replace PostgreSQL.

Do not replace the existing QR/check-in implementation unless it is objectively unusable.

Do not implement WhatsApp yet.

Do not add payment.

Do not add an APK.

Do not create a separate mobile application.

Do not make a second scanner system.

DO reuse existing functionality.

---

# 28. FINAL PRODUCT DEFINITION

When finished, the system should essentially feel like:

EVENT REGISTRATION PLATFORM

Public:

Event Landing
→ Registration
→ Personal E-ticket
→ QR

Admin:

Login
→ Dashboard
→ Participants
→ QR Scanner
→ Realtime Attendance
→ Reports

Nothing more is required for V1.

The product should be simple enough for one event but architecturally clean enough that WhatsApp integration and additional event features can be added later.

---

# 29. START NOW

Start with PHASE 1 only:

AUDIT THE EXISTING HI.EVENTS REPOSITORY.

Do not begin by rewriting code.

Return:

1. architecture map
2. feature inventory
3. feature keep/disable/modify/remove matrix
4. relevant file paths
5. database model map
6. registration flow map
7. ticket flow map
8. QR/check-in flow map
9. admin/dashboard flow map
10. potential risks
11. recommended modification order

Then proceed incrementally from there.

The single most important rule:

**REUSE HI.EVENTS. DO NOT REBUILD HI.EVENTS.**

Brain pt2:

# MEGA PROMPT V3

# TRANSFORM HI.EVENTS INTO A SIMPLE NO-LOGIN EVENT REGISTRATION SYSTEM

================================================== 0. CURRENT PROJECT
==================================================

The project has ALREADY been cloned and is CURRENTLY RUNNING from:

https://github.com/HiEventsDev/hi.events

DO NOT START FROM ZERO.

DO NOT CREATE A NEW APPLICATION.

DO NOT REPLACE THE EXISTING FRAMEWORK.

DO NOT REWRITE THE WHOLE PROJECT.

DO NOT CREATE A SECOND BACKEND.

DO NOT CREATE A SECOND DATABASE.

DO NOT CREATE A SECOND QR SYSTEM.

Use Hi.Events as the underlying ENGINE and existing implementation base.

The current implementation is too large and still behaves like a general event-ticketing platform.

We are transforming it into a very small:

# EVENT REGISTRATION + E-TICKET + QR CHECK-IN SYSTEM

This is intended initially for one real event and possibly only one-time usage.

Therefore, simplicity is more important than preserving the complete Hi.Events product experience.

==================================================

1. # ABSOLUTE PRODUCT SCOPE

The final product has only TWO user sides:

A. GUEST / PARTICIPANT
B. ADMIN / CHECK-IN STAFF

There is NO guest account system.

There is NO guest login.

There is NO guest password.

There is NO guest dashboard.

There is NO checkout account.

There is NO payment.

There is NO shopping cart.

There is NO product marketplace.

There is NO ticket purchasing flow.

There is NO WhatsApp integration in V1.

There is NO mobile APK.

There is NO native application.

Everything should work through the web browser.

================================================== 2. THE CORE PRODUCT FLOW
==================================================

The entire system should revolve around this:

GUEST:

Event page
↓
Registration form
↓
Submit registration
↓
Registration created
↓
Personal ticket created
↓
Unique QR created
↓
E-ticket immediately displayed
↓
Guest saves/downloads ticket
↓
Guest arrives at event
↓
Staff scans QR
↓
Check-in
↓
Dashboard updates

ADMIN:

Admin login
↓
Dashboard
↓
Participants
↓
QR Scanner
↓
Check-in
↓
Realtime attendance
↓
Export

That is the core product.

Do not add workflows outside this unless technically required by the existing engine.

================================================== 3. GUEST MUST NEVER LOG IN
==================================================

THIS IS A HARD REQUIREMENT.

Guest registration MUST be anonymous.

A participant must be able to:

1. open the event URL
2. fill the registration form
3. submit
4. immediately receive their e-ticket
5. save the ticket

WITHOUT:

- creating an account
- entering a password
- logging in
- verifying a guest account
- opening a dashboard
- confirming an email account
- going through checkout authentication

If the existing Hi.Events architecture contains attendee/customer authentication:

DO NOT expose it to guests.

Reuse internal entities and services where useful, but remove the authentication requirement from the public registration flow.

================================================== 4. GUEST INFORMATION ARCHITECTURE
==================================================

Guest should see only:

EVENT LANDING PAGE
REGISTRATION FORM
REGISTRATION SUCCESS
E-TICKET

Nothing else.

Public flow:

/event
↓
/register
↓
/registration-success
↓
/ticket/:token

Exact paths may differ according to the existing routing architecture.

Do NOT create a separate account area.

================================================== 5. EVENT LANDING PAGE
==================================================

Create a clean public event page.

Show only relevant information:

- Event name
- Event cover
- Event description
- Event date
- Event time
- Event location
- Important information
- Registration status
- Registration button

Primary CTA:

# DAFTAR SEKARANG

The page should immediately communicate:

WHAT
WHEN
WHERE
HOW TO REGISTER

No ticket marketplace terminology.

No price catalog.

No shopping terminology.

No commerce UI.

================================================== 6. REGISTRATION FORM
==================================================

Registration must be as simple as possible.

Default fields:

- Full Name
- WhatsApp Number
- Email
- Organization / Institution

Use the existing Hi.Events custom-question mechanism if it can be reused.

Do not build a second question system.

The form must be mobile-first.

A participant should be able to complete registration comfortably from a phone.

Do not ask for:

- password
- username
- account creation
- billing information
- payment method
- address unless the event explicitly requires it
- unnecessary profile information

================================================== 7. FREE EVENT
==================================================

This event is FREE.

There is no payment.

Do not show:

- payment method
- payment gateway
- checkout
- total price
- invoice
- tax
- service fee
- discount
- promo code
- refund

If the internal Hi.Events engine requires a ticket/product entity:

Create or use one default FREE registration/ticket type internally.

The participant should not experience that as a shopping process.

The participant experience must simply be:

# REGISTRASI EVENT

not:

# BUY TICKET

================================================== 8. REGISTRATION SUBMISSION
==================================================

When the guest submits the form:

1. Validate fields
2. Create participant/attendee record
3. Create the required internal registration/order entity if needed
4. Create ticket
5. Generate unique ticket token
6. Generate QR code
7. Associate the ticket with the participant
8. Return the ticket immediately

Do not require the participant to log in after registration.

Do not redirect the participant to a login page.

Do not ask the participant to create credentials.

================================================== 9. NO-LOGIN E-TICKET ACCESS
==================================================

Because guests do not log in, the e-ticket must be accessible through a secure unique ticket token.

Example:

/ticket/<random-secure-token>

The token MUST:

- be cryptographically random
- be unique
- not be sequential
- not expose the database ID
- not expose private information
- be validated server-side
- be difficult to guess

Do not use:

/ticket/123

Do not expose:

/ticket/email@example.com

Do not expose:

/ticket/participant-id

Prefer a long random opaque token.

The token acts as the guest's private ticket access link.

================================================== 10. REGISTRATION SUCCESS PAGE
==================================================

Immediately after registration:

Show:

# REGISTRASI BERHASIL

Thank-you / confirmation message.

Then:

Participant Name
Registration ID
Ticket ID

QR CODE

Event Date
Event Time
Event Location

Buttons:

[ LIHAT E-TICKET ]

[ DOWNLOAD TIKET ]

Optionally:

[ SIMPAN LINK TIKET ]

The participant must understand that this ticket is their proof of registration.

IMPORTANT:

Because there is no guest account, encourage the user to save the ticket immediately.

Example:

"Simpa​​​​n tiket ini untuk digunakan saat check-in."

Do not force the user into another authentication flow.

================================================== 11. TICKET PAGE
==================================================

Ticket page must be mobile-first.

Target:

---

## EVENT NAME

[NAMA PESERTA]

Registration ID
Ticket ID

        QR CODE

Date
Time
Location

STATUS
REGISTERED

[ DOWNLOAD ]

---

The QR must be visually large enough to scan from a phone screen.

The participant should not need to zoom excessively.

================================================== 12. DOWNLOAD TICKET
==================================================

Use the existing ticket/PDF implementation if suitable.

Do not create a completely separate ticket engine if Hi.Events already provides one.

The downloaded ticket should contain:

- event name
- participant name
- registration ID
- ticket ID
- QR
- date
- time
- location

Do not include unnecessary sales information.

================================================== 13. IMPORTANT: LOST TICKET
==================================================

V1 does NOT need a full guest account recovery system.

Do NOT introduce login simply to solve ticket recovery.

Preferred V1 behavior:

After registration, show the ticket and provide:

[ DOWNLOAD TICKET ]

and a private ticket URL.

The participant is expected to save the ticket.

Do not build OTP, password recovery, email verification, or guest account management unless absolutely necessary.

Future ticket recovery can be added later.

================================================== 14. ADMIN AUTHENTICATION
==================================================

ONLY ADMIN / STAFF authenticate.

Guest authentication is forbidden.

Admin login:

Email
Password

After login:

→ ADMIN DASHBOARD

Do not show the old Hi.Events organizer onboarding experience.

================================================== 15. ADMIN ROLES
==================================================

Minimum roles:

ADMIN
CHECK-IN STAFF

ADMIN:

- Dashboard
- Participants
- QR Scanner
- Event
- Export
- Admin configuration

CHECK-IN STAFF:

- QR Scanner
- Participant lookup
- Check-in status

Reuse existing authentication and permission architecture where possible.

Do not create a new authentication system.

================================================== 16. ADMIN SIDEBAR
==================================================

Replace the current large Hi.Events navigation.

Current UI contains many unnecessary sections such as:

- Reports
- Event Settings
- Homepage Designer
- Ticket Designer
- Registration Questions
- Tickets & Products
- Orders
- Promo Codes
- Affiliates
- Messages
- Waitlist
- Capacity Management
- etc.

These must NOT remain exposed as the primary product UI.

Target:

---

## EVENT NAME / LOGO

Dashboard

Participants

QR Scanner

Event

---

Admin Profile

Logout

---

That is enough.

Do not add menus simply because Hi.Events supports them.

================================================== 17. ADMIN DASHBOARD
==================================================

Dashboard is the primary admin page.

It must focus on ATTENDANCE.

Top metrics:

REGISTERED
CHECKED-IN
NOT CHECKED-IN
ATTENDANCE %

Example:

324 Registered
271 Checked-in
53 Not Checked-in
83.6% Attendance

Primary action:

# SCAN QR

Make this action highly visible.

Then:

Recent Check-ins

and:

Participants

Do not show:

- revenue
- ticket sales
- products sold
- refunds
- taxes
- affiliate performance
- conversion metrics
- payment metrics
- order value
- commerce analytics

The system is for attendance management.

================================================== 18. QR SCANNER
==================================================

The scanner is one of the CORE features.

Use existing Hi.Events QR/check-in functionality where possible.

Do NOT create another QR implementation if the existing one works.

Scanner must run inside a browser.

Example:

/admin/scanner

Requirements:

- camera permission
- camera preview
- QR recognition
- server-side validation
- immediate result
- scan-again action

Result states:

VALID:

✅ CHECK-IN BERHASIL

Participant Name
Registration ID
Check-in Time

DUPLICATE:

⚠️ SUDAH CHECK-IN

Participant Name
Original Check-in Time

INVALID:

❌ QR TIDAK VALID

Unknown or invalid ticket.

================================================== 19. CHECK-IN SECURITY
==================================================

Never trust the frontend.

The server must validate:

1. token exists
2. ticket exists
3. ticket belongs to a valid participant
4. ticket belongs to this event
5. ticket is active
6. participant has not already checked in

Then:

if valid and not checked in:

CREATE CHECK-IN

Otherwise:

return appropriate result.

Never let frontend simply mark:

checked_in = true

without backend validation.

================================================== 20. DUPLICATE CHECK-IN
==================================================

The same QR must not be check-in twice.

First scan:

✅ SUCCESS

Second scan:

⚠️ ALREADY CHECKED IN

Return original check-in time where possible.

The backend must enforce this.

Do not rely only on UI logic.

================================================== 21. MULTI-STAFF SCANNING
==================================================

Multiple check-in staff may scan simultaneously.

Example:

Staff A scans Fadhli.

At the same time:

Staff B scans another participant.

The system must handle concurrent check-ins safely.

Avoid race conditions that could create duplicate check-ins.

Reuse existing transaction/database protections where possible.

================================================== 22. REALTIME DASHBOARD
==================================================

When a successful check-in occurs:

REGISTERED remains the same.

CHECKED-IN increases by 1.

NOT CHECKED-IN decreases by 1.

ATTENDANCE % recalculates.

RECENT CHECK-IN updates.

If existing Hi.Events realtime infrastructure can perform this:

REUSE IT.

Do not create a second websocket/realtime system.

================================================== 23. PARTICIPANTS
==================================================

Participants remains a core admin page.

Table:

Registration ID
Name
WhatsApp
Email
Organization
Registered At
Check-in Status
Check-in Time

Search.

Filter:

ALL
CHECKED-IN
NOT CHECKED-IN

Admin can:

- view participant
- edit participant
- manually check in if appropriate

Do not expose unnecessary ticket-commerce data.

================================================== 24. EXPORT
==================================================

Keep CSV export.

CSV columns:

Registration ID
Ticket ID
Full Name
WhatsApp
Email
Organization
Registered At
Check-in Status
Check-in Time

Reuse existing export implementation if possible.

================================================== 25. EVENT SETTINGS
==================================================

Simplify Event management.

Admin only needs:

Event Name
Description
Date
Time
Location
Cover Image
Registration Open / Closed

If the existing system requires more internal configuration:

keep it internally.

Do not force admin to understand unnecessary platform settings.

================================================== 26. REMOVE HI.EVENTS ONBOARDING
==================================================

The current screenshot shows a workflow like:

"Event Created"

"0 of 4 steps complete"

"Add tickets"

"Publish your event"

"Add event details"

"Customize your event page"

THIS MUST DISAPPEAR.

Admin should NOT be required to complete a complicated ticketing-platform onboarding flow.

Target:

ADMIN LOGIN
↓
DASHBOARD

If event setup is incomplete:

show ONE SIMPLE EVENT SETUP SCREEN.

Fields:

Event Name
Date
Time
Location
Description
Cover

[ SAVE ]

After saving:

→ Dashboard

No checklist with multiple product-management tasks.

================================================== 27. DISABLE UNNECESSARY FEATURES
==================================================

The product surface should NOT expose:

Payment
Stripe
Checkout
Paid tickets
Orders UI
Products UI
Promo Codes
Affiliates
Messages
Waitlist
Revenue
Refunds
Tax
Commerce
Marketing
Marketplace
Ticket marketplace
Ticket inventory management
Advanced ticket-selling features
Advanced sales analytics
Complex organizer features
Multiple commerce workflows

Preferred order:

DISABLE
↓
HIDE
↓
DECOUPLE
↓
DELETE ONLY IF SAFE

Do not blindly delete backend modules.

================================================== 28. IMPORTANT: INTERNAL ENGINE VS PRODUCT SURFACE
==================================================

This distinction is CRITICAL.

The fact that a feature is hidden does not mean its backend must be deleted.

Example:

Hi.Events ticket entity may be required internally.

KEEP IT.

But:

Ticket Designer UI may not be required.

HIDE IT.

Likewise:

Keep QR engine.

Hide unnecessary ticket-management UI.

Keep attendee model.

Hide unnecessary organizer features.

Do not destroy the engine just to make the UI smaller.

================================================== 29. NO SECOND IMPLEMENTATION
==================================================

Before writing code for:

registration
ticket
QR
check-in
authentication
participants
export
realtime

SEARCH THE CURRENT CODEBASE.

If Hi.Events already has a working implementation:

REUSE IT.

Modify it only where needed.

Do not create duplicate:

RegistrationService
TicketService
QRCodeService
CheckInService
AuthSystem
ParticipantSystem

unless the existing architecture genuinely cannot satisfy the requirement.

================================================== 30. DATABASE
==================================================

Preserve the existing healthy database architecture.

Conceptually we need:

EVENT
PARTICIPANT / ATTENDEE
REGISTRATION / ORDER INTERNAL ENTITY
TICKET
CHECK-IN
ADMIN USER

Exact model naming should follow the existing Hi.Events architecture.

Do not create duplicate participant/ticket models.

Do not redesign PostgreSQL without reason.

================================================== 31. PUBLIC SECURITY
==================================================

Guest can submit registration.

Guest can view their ticket using the private token.

Guest must NOT be able to:

- browse all participants
- access admin
- edit other participants
- see another participant's ticket
- modify ticket state
- mark check-in
- access admin API
- access private admin data

Ticket token must be opaque and difficult to guess.

================================================== 32. ADMIN SECURITY
==================================================

Admin routes must require authentication.

Check-in staff must only access what their role permits.

Do not expose admin APIs publicly without authorization.

Never place secrets in frontend source.

Never commit .env secrets.

================================================== 33. WHATSAPP
==================================================

DO NOT IMPLEMENT WHATSAPP IN V1.

No:

WhatsApp Cloud API
WABA
WhatsApp Web
WhatsApp automation
Template messages
Webhook

Future possibility:

Registration
↓
Ticket Created
↓
Notification Service

For V1:

Notification is disabled.

Do not fake the integration.

================================================== 34. UI PRINCIPLE
==================================================

The final product must NOT feel like a reduced copy of Hi.Events.

It should feel like a purpose-built EVENT REGISTRATION SYSTEM.

The user should not see unnecessary product complexity.

Public UI:

Simple
Clear
Modern
Mobile-first

Admin:

Fast
Information-dense
Functional
Easy to scan

Scanner:

Extremely obvious
Large camera area
Large success state
Large error state
Minimal interaction

================================================== 35. TERMINOLOGY
==================================================

Prefer:

Event
Registration
Participant
E-ticket
QR Check-in
Attendance
Admin

Avoid:

Product
Order
Sales
Revenue
Checkout
Marketplace
Promo
Affiliate

The UI language should communicate:

REGISTRATION

not:

TICKET COMMERCE

================================================== 36. GUEST EXPERIENCE TARGET
==================================================

The guest flow should require the minimum possible number of actions.

Ideal:

1. Open link
2. Read event
3. Tap DAFTAR
4. Fill form
5. Tap SUBMIT
6. See ticket
7. Download / save QR

DONE.

No account.

No login.

No password.

No checkout.

No payment.

No extra onboarding.

================================================== 37. MOBILE UX
==================================================

Guest registration MUST be optimized for phones.

Ticket MUST be optimized for phones.

QR scanner MUST be optimized for phones.

Important:

Do not make the guest rotate their phone.

Do not require desktop.

Do not require app installation.

Use browser camera APIs for scanning.

================================================== 38. VISUAL CLEANUP
==================================================

Do not simply hide sidebar entries.

Review:

- layout
- navigation
- labels
- buttons
- empty states
- onboarding
- forms
- ticket pages
- success messages
- scanner UX
- dashboard cards

The product should visually communicate that it is a focused event system.

================================================== 39. FEATURE MATRIX
==================================================

Create and maintain:

## FEATURE ACTION

Guest registration KEEP + SIMPLIFY
Guest login REMOVE FROM PUBLIC FLOW
Guest account REMOVE
E-ticket KEEP + SIMPLIFY
QR Code KEEP
QR Scanner KEEP
Check-in KEEP
Participants KEEP
Dashboard KEEP + REDESIGN
Realtime KEEP
CSV Export KEEP
Admin Login KEEP
Event Settings KEEP + SIMPLIFY

Payment DISABLE
Stripe DISABLE
Orders UI HIDE
Products UI HIDE
Promo Codes DISABLE
Affiliates DISABLE
Messages DISABLE
Waitlist DISABLE
Revenue DISABLE
Refunds DISABLE
Tax DISABLE
Commerce DISABLE
Ticket Designer HIDE
Homepage Designer HIDE / SIMPLIFY
Advanced Reports MERGE INTO DASHBOARD
Organizer Marketplace DISABLE
Guest Dashboard REMOVE

================================================== 40. DEVELOPMENT PROCESS
==================================================

Do not make huge changes all at once.

PHASE 1
Audit current codebase.

Identify:

- current guest registration
- current authentication requirements
- attendee model
- ticket model
- ticket URL
- QR generation
- scanner
- check-in API
- dashboard
- realtime
- export
- routes
- permissions

PHASE 2
Remove guest login requirement.

PHASE 3
Simplify public registration.

PHASE 4
Simplify ticket generation and ticket access.

PHASE 5
Transform admin navigation.

PHASE 6
Transform dashboard.

PHASE 7
Simplify scanner.

PHASE 8
Verify realtime attendance.

PHASE 9
Participant management + export.

PHASE 10
Full end-to-end testing.

================================================== 41. TESTING — GUEST
==================================================

Test:

Open event URL.

Expected:
Public event page.

Click DAFTAR.

Expected:
Registration form.

Submit.

Expected:
Registration succeeds without login.

Expected:
Ticket is created.

Expected:
QR is created.

Expected:
Ticket appears immediately.

No guest login must appear.

================================================== 42. TESTING — TICKET ACCESS
==================================================

Open generated private ticket URL.

Expected:
Correct participant ticket.

Open a modified/random token.

Expected:
Invalid/not found.

Do not expose other tickets.

================================================== 43. TESTING — ADMIN
==================================================

Login.

Expected:
Dashboard.

Not:
Hi.Events onboarding.

Dashboard shows:

Registered
Checked-in
Not checked-in
Attendance %

================================================== 44. TESTING — SCANNER
==================================================

Scan valid QR.

Expected:

✅ CHECK-IN BERHASIL

Scan same QR again.

Expected:

⚠️ SUDAH CHECK-IN

Scan random QR.

Expected:

❌ QR TIDAK VALID

================================================== 45. TESTING — REALTIME
==================================================

Open admin dashboard in browser A.

Open scanner in browser B.

Scan a valid ticket.

Expected:

Dashboard A updates automatically.

No manual reload should be required if existing realtime infrastructure supports it.

================================================== 46. TESTING — NO GUEST LOGIN
==================================================

IMPORTANT REGRESSION TEST:

Use a clean browser / incognito window.

Open public event.

Register.

At NO POINT should the guest be asked to:

- login
- create account
- enter password
- access dashboard
- authenticate

This is a mandatory acceptance criterion.

================================================== 47. TESTING — MOBILE
==================================================

Test public registration using mobile viewport.

Test ticket using mobile viewport.

Test scanner using mobile browser.

Check:

- form usability
- QR visibility
- camera permission
- scan result visibility
- buttons
- scrolling
- responsive layout

================================================== 48. FINAL ADMIN INFORMATION ARCHITECTURE
==================================================

ADMIN

Dashboard
Participants
QR Scanner
Event

Admin Profile
Logout

Nothing more is required for V1.

================================================== 49. FINAL GUEST INFORMATION ARCHITECTURE
==================================================

PUBLIC

Event
↓
Registration
↓
Success
↓
E-ticket

NO:

Login
Account
Dashboard
Checkout
Payment

================================================== 50. FINAL PRODUCT LOOP
==================================================

The finished product must communicate this one simple idea:

# DAFTAR EVENT

↓

# DAPATKAN E-TICKET

↓

# SIMPAN QR

↓

# DATANG

↓

# SCAN

↓

# CHECK-IN

That is the entire product.

================================================== 51. CRITICAL RULE
==================================================

Whenever you are about to add complexity, ask:

"Apakah guest membutuhkan ini untuk mendaftar dan mendapatkan QR?"

or:

"Apakah admin membutuhkan ini untuk mengelola peserta dan melakukan check-in?"

If the answer is NO:

DO NOT ADD IT.

Whenever you encounter an existing Hi.Events feature, ask:

"Is this part of the core registration/check-in loop?"

If NO:

Hide or disable it from the product surface.

================================================== 52. CURRENT TASK
==================================================

DO NOT START CODING THE WHOLE SYSTEM.

Start with an AUDIT of the CURRENT, ALREADY-RUNNING cloned repository.

Specifically audit:

1. How guest registration currently works.
2. Where guest authentication is currently enforced.
3. How to remove guest authentication safely.
4. How attendee records are created.
5. How tickets are generated.
6. How ticket URLs work.
7. How QR codes are generated.
8. How QR scanning works.
9. How check-in is persisted.
10. How duplicate check-in is prevented.
11. How realtime updates work.
12. Which current admin routes can be retained.
13. Which current routes/UI should be hidden or disabled.
14. Which database models are reusable.
15. Which services/controllers/components should be modified.

Return a concrete implementation plan with:

FILE PATH
CURRENT PURPOSE
KEEP / MODIFY / HIDE / DISABLE / REMOVE
REASON
DEPENDENCIES
RISK

Then implement incrementally.

Do not rebuild the application.

Do not create a parallel architecture.

Do not introduce unnecessary dependencies.

================================================== 53. FINAL SUCCESS CRITERIA
==================================================

The project is successful when:

PUBLIC:

✓ Guest can register without login.
✓ Guest can register without account.
✓ Guest can register without password.
✓ Guest can register without payment.
✓ Registration creates participant.
✓ Registration creates ticket.
✓ Ticket gets unique QR.
✓ Ticket is immediately displayed.
✓ Ticket can be downloaded/saved.
✓ Private ticket URL works without login.

ADMIN:

✓ Admin can login.
✓ Admin sees simple dashboard.
✓ Admin sees registered count.
✓ Admin sees checked-in count.
✓ Admin sees remaining count.
✓ Admin sees attendance percentage.
✓ Admin sees participants.
✓ Admin can search participants.
✓ Admin can export participants.
✓ Staff can scan QR.
✓ Valid QR checks in.
✓ Duplicate QR is rejected.
✓ Invalid QR is rejected.
✓ Dashboard updates realtime where supported.
✓ Admin can manage event information.

PRODUCT:

✓ No guest login.
✓ No guest account.
✓ No payment.
✓ No WhatsApp.
✓ No APK.
✓ No unnecessary ticket commerce.
✓ No large Hi.Events onboarding.
✓ No unnecessary sidebar.
✓ No duplicate backend systems.
✓ Existing stable Hi.Events engine is reused.

FINAL PRODUCT:

# SIMPLE EVENT REGISTRATION SYSTEM

using Hi.Events as the underlying engine.

DO NOT turn this back into a general-purpose event ticketing platform.

Keep it small.
Keep it focused.
Keep the existing stable engine.
Remove complexity from the user experience.
