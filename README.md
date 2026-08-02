# Online Bookstore

A full-stack online bookstore developed using React, Node.js, Express, and MySQL.

## Project Features

### Customer Features

- Create a new account
- Login and logout
- Browse available books
- Search books by title or author
- Filter books by category
- View book details
- Add books to the shopping cart
- Complete checkout
- View previous orders
### Admin Features

- Admin login
- Add new books
- Delete books
- View all customer orders
- Update order status

## Technologies Used

### Frontend

- ReactJS
- React Router
- JavaScript
- HTML5
- CSS3
- Vite

### Backend

- Node.js
- Express.js
- JSON Web Token
- bcryptjs
- CORS
- dotenv

### Database

- MySQL
- MySQL Workbench
- mysql2
## Project Structure

```text
online-bookstore/
├── frontend/
│   ├── src/
│   └── package.json
│
├── backend/
│   ├── middleware/
│   ├── routes/
│   ├── db.js
│   ├── server.js
│   └── package.json
│
├── database.sql
├── .gitignore
└── README.md
## Database Setup

1. Open MySQL Workbench.
2. Open the `database.sql` file.
3. Execute the complete SQL script.
4. The database name is:

`online_bookstore_db`

The database contains these tables:

- `users`
- `books`
- `orders`
- `order_items`
## Backend Setup

Open a terminal inside the backend folder:

```bash
cd backend