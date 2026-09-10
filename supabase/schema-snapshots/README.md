# Remote Schema Recovery Snapshot

This is a schema-only dump of the linked remote public schema captured on 2026-09-10 after migration 00105 was deployed.

- File: remote-public-2026-09-10.sql
- SHA-256: 8a4b78d6b3e2c29aed1fcf4a16c4154c4295e7684e879a5a6d6629fcb9524406
- Data: none
- Credentials: none
- Purpose: recovery reference and source material for replacing the older remote-only schema changes with small, reviewed migrations.

Do not execute this file against production or use it as a Supabase migration. It contains a whole-schema representation, including grants and object rebuilds, which is unsafe to replay over a live database.

Before creating a new production-like environment or disaster-recovery rebuild:

1. Start from the tracked migrations through 00106.
2. Review the snapshot delta object by object.
3. Add focused, idempotent migrations for each approved missing object or change.
4. Apply and test those migrations in a disposable project before production.
5. Replace this snapshot only after the curated migrations fully reproduce the live schema.