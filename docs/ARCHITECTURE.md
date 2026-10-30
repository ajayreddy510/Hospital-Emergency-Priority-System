# System Architecture: Hospital Emergency Priority System

## Overview
The Hospital Emergency Priority System is designed as a decoupled, multi-layer full-stack application supporting real-time queue management, triage assignment, doctor allocation, treatment recording, and operational monitoring.

```
+-----------------------------------------------------------------------+
|                         React SPA (Vite + TS)                         |
|  [ Dashboard | Queue Command Center | Patients | Doctors | Reports ]  |
+-----------------------------------+-----------------------------------+
                                    |
            +-----------------------+-----------------------+
            | REST (HTTPS / JSON)                           | WebSockets (STOMP / SockJS)
            v                                               v
+-----------------------------------+-----------------------------------+
|                     Spring Boot 3 Web Application                     |
|                                                                       |
|  +------------------+   +-------------------+   +------------------+  |
|  | Controller Layer |   | Security (JWT)    |   | WebSocket Broker |  |
|  +--------+---------+   +---------+---------+   +--------+---------+  |
|           |                       |                      |            |
|           +-----------------------+----------------------+            |
|                                   v                                   |
|  +-------------------------------------------------------------+  |
|  |                        Service Layer                        |  |
|  |  +---------------------+           +---------------------+  |  |
|  |  | PriorityQueueEngine |           | AllocationEngine    |  |  |
|  |  | (Heap DSA Logic)    |           | (Doctor Matcher)    |  |  |
|  |  +---------------------+           +---------------------+  |  |
|  +--------------------------------+----------------------------+  |
|                                   |                                   |
|                                   v                                   |
|  +-------------------------------------------------------------+  |
|  |                       Repository Layer                      |  |
|  +--------------------------------+----------------------------+  |
+-----------------------------------|-----------------------------------+
                                    | Spring Data MongoDB
                                    v
+-----------------------------------------------------------------------+
|                             MongoDB Atlas                             |
|  (users, patients, doctors, emergency_cases, treatments, audit_logs)  |
+-----------------------------------------------------------------------+
```

## Data Structure & Algorithm (DSA) Engine

### Priority Queue Mechanics
1. **Model**: `PriorityQueue<EmergencyCase>` using a custom `Comparator`.
2. **Priority Scores**:
   - `CRITICAL`: Base Weight = 100
   - `HIGH`: Base Weight = 75
   - `MEDIUM`: Base Weight = 50
   - `LOW`: Base Weight = 25
3. **Tie-Breaking Rule**: When two cases have identical priority scores, the case with the earlier `arrivalTime` timestamp receives precedence ($Min-Heap$ timing comparison).
4. **Time Complexity**:
   - Queue Insertion: $O(\log N)$
   - Next Patient Peek: $O(1)$
   - Next Patient Poll: $O(\log N)$
   - Priority Override & Re-heapify: $O(N \log N)$

## Doctor Allocation Algorithm
The recommendation algorithm picks optimal doctors based on:
$$\text{DoctorScore} = w_1 \cdot \text{AvailabilityStatus} + w_2 \cdot \text{SpecializationMatch} - w_3 \cdot \text{ActiveCasesCount}$$
- `AVAILABLE` status is required.
- Matching department/specialization provides priority points.
- Minimum `ActiveCasesCount` is prioritized to balance workload.
