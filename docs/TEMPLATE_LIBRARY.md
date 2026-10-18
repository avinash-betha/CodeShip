# Complete editable screens

The registry combines 11 preserved screens with 29 additional screens from `screens.ts`, giving 40. Categories cover authentication, dashboards, management, websites and applications. Each entry returns a complete node tree with responsive CSS; loading replaces the active page within an undoable transaction.

Authentication includes sign-in, registration, password recovery/reset, one-time code and split layouts. Dashboard examples cover overview, financial, sales, project, developer and CRM contexts. Management covers settings, people, inventory, customers and orders. Website examples include landing, portfolio, commerce, product, pricing, contact, blog and documentation. Application examples include table management, multi-step forms, kanban, calendar, reports, notifications, chat, files, configuration and profile.

All 40 screens are measured at 320, 375, 390, 430, 768, 1024, 1280 and 1440px in `upgrade.spec.ts`. Visible text fields are checked for label spacing, minimum control height and usable width. Native checkboxes/ranges/colors have their own compact geometry; hidden panel fields are excluded until visible. Tables scroll within their region rather than widening the page.

These are editable UI starting points. Example sign-in does not create accounts, sample sales figures do not connect to banking, and local chat does not send messages to other people.
