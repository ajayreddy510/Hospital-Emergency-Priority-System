# API Specification: Hospital Emergency Priority System

Base URL: `/api`

Response Format:
```json
{
  "success": true,
  "message": "Operation completed successfully",
  "data": {}
}
```

Error Response Format:
```json
{
  "success": false,
  "message": "Detailed error message",
  "errorCode": "RESOURCE_NOT_FOUND",
  "timestamp": "2026-09-29T19:50:00Z"
}
```

---

## Auth Endpoints
- `POST /api/auth/register` - Create user account
- `POST /api/auth/login` - Authenticate & obtain JWT
- `GET /api/auth/me` - Fetch profile

## Patient Endpoints
- `GET /api/patients?page=0&size=10&query=John` - Paginated patient list
- `GET /api/patients/{id}` - Complete patient profile
- `POST /api/patients` - Register patient
- `PUT /api/patients/{id}` - Update patient profile

## Doctor Endpoints
- `GET /api/doctors` - Directory of doctors with availability
- `GET /api/doctors/{id}` - Doctor workload details
- `POST /api/doctors` - Create doctor profile
- `PATCH /api/doctors/{id}/status` - Update status (AVAILABLE, BUSY, OFFLINE)

## Emergency Case & Queue Endpoints
- `GET /api/queue` - Real-time ordered emergency queue
- `GET /api/queue/next` - Highest priority patient
- `POST /api/emergency-cases` - Intake emergency case
- `PATCH /api/emergency-cases/{id}/priority` - Override emergency priority score
- `PATCH /api/emergency-cases/{id}/status` - Update case triage/treatment status
- `POST /api/emergency-cases/{id}/assign-doctor` - Assign doctor (Manual / Auto)

## Treatment Record Endpoints
- `GET /api/treatments/case/{caseId}` - Treatment notes for case
- `POST /api/treatments` - Add diagnosis/treatment notes

## Dashboard & Analytics Endpoints
- `GET /api/dashboard/summary` - Key performance metrics
- `GET /api/dashboard/emergency-stats` - Level breakdown & hourly volume
- `GET /api/dashboard/doctor-stats` - Doctor availability & workload
- `GET /api/reports?type=daily` - Aggregate reports

## Audit Log Endpoints
- `GET /api/audit-logs` - System operational audit logs
