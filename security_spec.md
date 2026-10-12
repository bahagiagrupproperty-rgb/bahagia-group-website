# Security Specification — Bahagia Group Property ERP & Portal

## 1. Data Invariants
1. **Identity Integrity**: Every created document must record `createdBy` matching `request.auth.uid` (except public booking/complaint submissions where `createdBy` can be `'public'` or `request.auth.uid`).
2. **Temporal Integrity**: `createdAt` and `updatedAt` fields must match `request.time` or be valid ISO timestamps under 64 characters, and `createdAt` is immutable on update.
3. **PII Isolation**: User profiles in `/users/{userId}` contain PII (`email`, `phone`). Read access is restricted to `isOwner(userId)` or `isAdmin()`.
4. **Role Escalation Prevention**: Users cannot self-assign `ADMIN` or `DIREKTUR` roles or modify their own `role` field unless `isAdmin()`.
5. **Path Variable Hardening**: All document IDs (`{docId}`) must match `^[a-zA-Z0-9_\-]+$` and be `<= 128` characters.
6. **Strict Schema & Bounds**: String fields are bounded by `.size()` checks; no arbitrary unbounded arrays or shadow fields are permitted.

## 2. The "Dirty Dozen" Payloads
1. **Shadow Field Injection**: `{ "id": "doc1", "title": "Test", "isSuperAdmin": true }` -> Rejected by `.keys().hasOnly(...)`.
2. **Identity Spoofing**: Creating a record with `createdBy: "someone_else_uid"` -> Rejected by `incoming().createdBy == request.auth.uid`.
3. **Unverified Email Admin Spoof**: Accessing admin routes with `email == 'bahagiagrupproperty@gmail.com'` but `email_verified == false` -> Rejected by `request.auth.token.email_verified == true`.
4. **ID Poisoning**: Document ID with 500 characters or special characters `../admin` -> Rejected by `isValidId(docId)`.
5. **PII Lateral Read**: Authenticated non-admin user reading `/users/other_user_id` -> Rejected by `isOwner(userId) || isAdmin()`.
6. **Privilege Escalation Update**: User updating `role: "ADMIN"` on their own `/users/{uid}` document -> Rejected by `affectedKeys().hasOnly(...)` excluding `role`.
7. **Immortal Field Mutation**: Updating `createdAt` or `createdBy` on an existing ERP record -> Rejected by `incoming().createdAt == existing().createdAt`.
8. **Value Poisoning (Oversized String)**: Sending a 500KB string in `notes` or `description` -> Rejected by `size() <= 5000`.
9. **Terminal State Reversal**: Non-admin attempting to mutate an already `Approved` or `Completed` verification record -> Rejected by terminal status lock.
10. **Blanket List Scraping on PII**: Executing `list` on `/users` as a regular user -> Rejected because `allow list` requires `isAdmin()` or `resource.data.uid == request.auth.uid`.
11. **Type Confusion Attack**: Passing a number or boolean where `status` string is expected -> Rejected by `data.status is string`.
12. **Unbounded Array Injection**: Passing 1000 items in a `photos` array -> Rejected by `data.photos is list && data.photos.size() <= 50`.
