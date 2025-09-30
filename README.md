# 📂 Project Structure – Financial Manager
### 🖥️ Client (Frontend – React)

client/public/ → Static assets (HTML template, icons, manifest).

client/src/components/ → Reusable UI components:

common/ → Buttons, inputs, modals.

layout/ → Header, sidebar, footer.

charts/ → Data visualization components (Recharts, etc.).

client/src/pages/ → Page-level components:

Dashboard/ → Financial overview dashboard.

Transactions/ → Transaction history & management.

Investments/ → Portfolio and investments tracking.

Auth/ → Authentication pages (login/register).

client/src/hooks/ → Custom React hooks for reusability.

client/src/services/ → API service layer for backend communication.

client/src/utils/ → Helper functions (formatters, calculators, etc.).

client/src/contexts/ → Global state management using React Context API.

client/src/styles/ → Global styles (Tailwind, custom CSS).


### ⚙️ Server (Backend – Node.js/Express)


server/config/ → App & database configuration.

server/controllers/ → Handles API requests and responses.

server/models/ → Database models (e.g., Mongoose schemas).

server/routes/ → API route definitions.

server/middleware/ → Middleware for authentication, validation, logging.

server/services/ → Core business logic (finance calculations, etc.).

server/utils/ → Utility/helper functions.


### 🔗 Shared

shared/ → Common constants, types, and interfaces used across client & server (ensures consistency).
