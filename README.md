# School Payment Project

This project is a School Payment System with Backend (Node.js + MongoDB Atlas + JWT) and Frontend (React.js + Tailwind CSS). It allows creating and managing school payment transactions, checking status, processing refunds, and provides a dashboard with search, filter, sorting, CSV export, and dark/light mode.

To set up the backend, clone the repository using `git clone https://github.com/kashish1624/school-payment-backend.git` and navigate to the folder with `cd school-payment-backend`. Install dependencies using `npm install`. Create a `.env` file based on `.env.example` with the following variables: `MONGO_URI=your_mongodb_atlas_uri`, `JWT_SECRET=your_jwt_secret`, `PORT=5000`, `PG_KEY=edvtest01`, `API_KEY=your_api_key`. Run the server using `npm run dev`.

To set up the frontend, clone the repository using `git clone https://github.com/kashish1624/school-payment-frontend.git` and navigate to the folder with `cd school-payment-frontend`. Install dependencies using `npm install`. Start the frontend using `npm start` and open `http://localhost:3000` in your browser.

The backend API endpoints are: POST `/api/transactions` to create an order and transaction, GET `/api/transactions` to fetch all transactions, GET `/api/transactions/school/:schoolId` to fetch transactions by school, GET `/api/transactions/:orderId/status` to fetch transaction status by order ID, PUT `/api/transactions/:orderId/refund` to process refunds, and POST `/api/webhook` to handle webhooks and update transaction status. Example request for POST `/api/transactions`: `{ "schoolId": "12345", "studentName": "John Doe", "amount": 500 }`. Example response: `{ "success": true, "transactionId": "abc123", "status": "pending" }`.

The frontend features include login/logout with JWT, a paginated and searchable transactions list, filters by status, school, and date, sorting by columns, CSV export, checking transaction status via `customer_order_id` or `collect_id`, and dark/light mode toggle.

Screenshots can be added to a `screenshots/` folder in each repo and included in the README. For example, backend screenshots: Postman API test (`ss_postman.png`) and MongoDB Atlas dashboard (`ss_mongo.png`). Frontend screenshots: login page (`login.png`), dashboard with transactions table (`dashboard.png`), and dark mode (`darkmode.png`). In README, you can display them using `![Alt Text](screenshots/filename.png)`.

Include the Postman collection file `SchoolPayment.postman_collection.json` in the backend repo with all tested API requests (POST, GET, PUT). Include an `.env.example` file in the backend repo showing required environment variables without secrets:

