# QA E2E Verification Guide: Two-Business GRAVTY-Style Architecture

## Objective
Verify the implemented multi-tenant architecture end to end from UI:
- Tenant isolation
- Branch uniqueness scoped by tenant
- HOST/CHILD/PARTNER sponsor model
- Location and Location PIN
- Rules by scope (PROGRAM/SPONSOR/LOCATION)
- Partner Membership mapping (external ID -> internal member)
- Partner reconciliation batches and lines

## Preconditions
1. Backend is running on http://localhost:8080.
2. Frontend is running on http://localhost:3000.
3. Database migration has been applied (sponsor_type/location_pin/tables exist).
4. Open two browser contexts:
- Context A: normal window for Business A (Garage)
- Context B: incognito window for Business B (LuxeStay)

Reason: each tenant context stores API key in browser storage and must remain isolated.

## Test Data
Use these values unless your environment already has conflicting data.

### Business A (Garage)
- Tenant name: The Garage
- Slug: the-garage
- Program: garage500
- Branches: MUM-01, DEL-01
- Members: suraj258, anita001
- CHILD Sponsor: Garage Cafe (GAR_CAFE)
- PARTNER Sponsor: Indigo Partner (INDIGO_PARTNER)
- Location under GAR_CAFE: Delhi Bar (GAR-DEL), PIN 0057

### Business B (LuxeStay)
- Tenant name: LuxeStay
- Slug: luxestay
- Program: luxeplus
- Branches: MUM-01, BLR-01
- Members: suraj258, ravi777
- CHILD Sponsor: Luxe Dining (LUX_DINE)
- PARTNER Sponsor: SkyWings (SKY_PARTNER)
- Location under LUX_DINE: Rooftop (LUX-RT), PIN 0088

## Phase 1: Provision Business A
1. Go to Tenant Setup.
2. Create tenant The Garage.
3. Expected:
- Tenant appears in Tenant Selection.
- Program card shows garage500.
- API key banner shows key prefix.

## Phase 2: Branch and Member Setup in Business A
1. In Tenant Setup, create branches MUM-01 and DEL-01.
2. Create members suraj258 and anita001.
3. Expected:
- Branch list shows both.
- Shared Members shows both.

## Phase 3: Sponsor and Location Setup in Business A
1. Go to Sponsors.
2. Confirm HOST sponsor exists (created during provisioning).
3. Create CHILD sponsor GAR_CAFE with parent HOST.
4. Create PARTNER sponsor INDIGO_PARTNER with no parent.
5. Create location for GAR_CAFE:
- Name: Delhi Bar
- Code: GAR-DEL
- PIN: 0057
6. Expected:
- Sponsor hierarchy displays sponsor type labels.
- Location list shows GAR-DEL and PIN 0057.

## Phase 4: Rule Setup in Business A
1. Go to Rules.
2. Create PROGRAM rule:
- name: Garage Program 10%
- scope: PROGRAM
- eventType: PURCHASE
- rewardType: PERCENTAGE
- rewardValue: 10
- priority: 1
3. Create SPONSOR rule for GAR_CAFE:
- name: Cafe Bonus
- scope: SPONSOR
- rewardType: FLAT
- rewardValue: 50
- priority: 2
4. Create LOCATION rule for GAR-DEL:
- name: Delhi Bar Bonus
- scope: LOCATION
- rewardType: FLAT
- rewardValue: 30
- priority: 3
5. Expected:
- All rules visible in Rules list.

## Phase 5: Event Processing in Business A (Core Flow)
1. Go to Events.
2. Select:
- Tenant: The Garage
- Member: suraj258
- Sponsor: GAR_CAFE
- Location: GAR-DEL
- Event: PURCHASE
- Amount: 5000
3. Click Process Event.
4. Expected:
- Success message appears with points.
- No channel null error should appear.

## Phase 6: Verify Wallet and Ledger in Business A
1. Go to Wallet.
2. Expected:
- Member wallet reflects increased points.
3. Go to Audit Transactions.
4. Expected transaction row includes tenant/program/sponsor/location context.

## Phase 7: Partner Membership Mapping in Business A
1. Go to Partner Memberships.
2. Select sponsor INDIGO_PARTNER.
3. Create mapping:
- External ID: 6E-789456
- Member: suraj258
4. Expected:
- Mapping appears in list.

## Phase 8: Partner Event Using External Membership ID
1. Go to API Console (Live).
2. Set event payload:
```json
{
  "tenantId": 1,
  "programId": 1,
  "sponsorId": 3,
  "externalMembershipId": "6E-789456",
  "eventType": "PURCHASE",
  "amount": 1200,
  "referenceId": "PARTNER-1001",
  "channel": "POS"
}
```
3. Execute.
4. Expected:
- Success response.
- Points credited to suraj258 via mapping.

## Phase 9: Reconciliation in Business A
1. Generate 2-3 partner events for INDIGO_PARTNER.
2. Go to Reconciliation.
3. Select INDIGO_PARTNER.
4. Enter period covering those events.
5. Set point cost = 0.25.
6. Run Reconciliation.
7. Expected:
- Batch created.
- Lines list shows transaction IDs and amounts.
- Amount follows: amount = points x pointCost.

## Phase 10: Provision Business B in Context B
1. Open incognito (Context B), go to Tenant Setup.
2. Create LuxeStay tenant.
3. Create branch MUM-01 (same code as Garage).
4. Expected:
- Success. This verifies tenant-scoped branch uniqueness.

## Phase 11: Isolation Checks Across Two Businesses
1. In Context A (Garage API key), try posting event with LuxeStay tenantId.
2. Expected:
- Error: Tenant does not match API key.
3. In Context B, before creating suraj258, post event for suraj258.
4. Expected:
- Member not found.
5. Create suraj258 in Context B and retry.
6. Expected:
- Success, points tracked separately from Business A.

## Pass Criteria
All of the following must pass:
1. Member list and event access are tenant-isolated.
2. Same branch code can exist in different tenants.
3. HOST/CHILD/PARTNER sponsor behavior works.
4. Location PIN persists and is visible.
5. Rule scopes PROGRAM/SPONSOR/LOCATION execute in event flow.
6. Partner external mapping flow works.
7. Reconciliation creates accurate batches and lines.
8. Tenant API key mismatch is blocked.

## Common Failure Signatures and Meaning
1. "Tenant does not match API key"
- Wrong browser context API key for selected tenant.
2. "Member not found"
- Member does not exist under selected tenant, or partner mapping missing.
3. "Sponsor is required and must belong to program"
- Sponsor belongs to another tenant/program.
4. "Location must belong to sponsor"
- Location selected under different sponsor.
5. Channel null constructor error
- Backend not restarted with latest fix, or stale deployment.

## Retest Notes
After backend code changes:
1. Restart backend.
2. Hard refresh frontend.
3. Re-run Phase 5 first (Events) to confirm channel issue is resolved.
