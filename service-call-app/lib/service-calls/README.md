# Service-call data layer

- `model.ts` owns the read model, timestamp conversion, and Zod validation for create/edit/status/assignment inputs. Missing legacy timestamps remain `null`; document IDs take precedence over stored `id` fields.
- `repository.ts` owns the main dashboard's Firestore reads, subscriptions, and writes. Callers supply the existing Firestore instance; this refactor does not change authentication or security rules. Creation allocates an ID and writes the complete record once, with server-generated creation/update timestamps.
- `useServiceCalls.ts` manages browser subscription lifecycle, loading/errors, and cleanup on sign-out or account/scope changes. `onAdded` notifications skip the initial snapshot.
- `email.server.ts` sends a notification from server code and escapes user input in the HTML email.

The create action validates, saves, then optionally emails. Its result distinguishes a failed save from a saved call whose email failed. The latter closes the form with an explicit warning, preventing a retry from creating another call just to resend email. A transport failure leaves the form open and asks the user to check the dashboard before retrying, because the client cannot know whether the write committed.

Create and edit forms own their pending/error state, use native form validation, and retain input on a reported save failure. Inline status and assignment controls use the same update function and disable themselves until the write settles.

Run `npm test` from `service-call-app` for regression tests. Firebase and SMTP are mocked: these tests never write production data or send email. Production authorization, offline conflict resolution, and email delivery retries remain separate work.
