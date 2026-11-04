# Maison Élégance | Fashion E-Commerce Platform

A full-stack fashion e-commerce platform designed to deliver a premium online shopping experience, featuring a modern Angular storefront, a secure RESTful API, and an administrative dashboard for managing store operations.

## ✨ Overview

**Maison Élégance** is a full-stack e-commerce application built for a fashion retail business. It provides customers with an intuitive shopping experience while giving administrators the tools to manage products, categories, orders, users, and store analytics.

The application follows a separated frontend/backend architecture, with Angular handling the user interface and Node.js with Express powering the backend API. MongoDB is used for data storage through Mongoose.

## 🚀 Features

### Customer Experience
- **Product Catalog:** Browse fashion products and explore product details.
- **Product Categories:** Navigate through categories, subcategories, and seasonal collections.
- **Shopping Cart:** Add products and manage cart items.
- **Checkout:** Complete the order checkout process.
- **Authentication:** User registration and login.
- **Account Management:** Access personal account information.
- **Testimonials:** Customer reviews and testimonials.
- **Content Pages:** Dynamic website content.

### Admin Dashboard
- **Dashboard Overview:** Access store management features.
- **Product Management:** Manage the product catalog.
- **Category Management:** Organize product categories and subcategories.
- **Order Management:** View and manage customer orders.
- **User Management:** Manage customer accounts.
- **Testimonial Management:** Manage customer reviews.
- **Analytics:** Access store analytics and reporting capabilities.

### Backend & Security
- RESTful API architecture.
- JWT-based authentication.
- Password hashing using bcrypt.
- Role-based route protection.
- Request validation using Express Validator.
- Rate limiting to help protect API endpoints.
- Security headers using Helmet.
- CORS configuration.
- Image and file uploads using Multer.
- Email notifications using Nodemailer.
- Automated birthday email scheduling.
- Application logging using Winston.

## 🛠️ Tech Stack

### Frontend
- Angular 22
- TypeScript
- HTML5
- CSS3
- RxJS

### Backend
- Node.js
- Express.js 5
- MongoDB
- Mongoose
- REST API

### Authentication & Security
- JSON Web Tokens (JWT)
- bcrypt
- Helmet
- Express Rate Limit
- Express Validator

### Additional Tools
- Multer
- Nodemailer
- Node-Cron
- Winston
- dotenv
- Git & GitHub

## 📁 Project Structure

```text
E-Comerce/
│
├── Backend/
│   ├── birthday/          # Scheduled birthday email jobs
│   ├── config/            # Database configuration
│   ├── controllers/       # Business logic
│   ├── middlewares/       # Authentication and error handling
│   ├── models/            # MongoDB models
│   ├── routes/            # REST API routes
│   ├── services/          # Application services
│   ├── uploads/           # Uploaded files
│   ├── utilities/         # Logging and helper utilities
│   ├── validators/        # Request validation
│   ├── package.json
│   └── server.js
│
├── frontend/
│   ├── src/
│   │   ├── app/
│   │   │   ├── core/      # Core application functionality
│   │   │   ├── features/  # Application pages and features
│   │   │   └── shared/   # Shared components
│   │   ├── environments/
│   │   └── styles.css
│   ├── angular.json
│   └── package.json
│
└── .gitignore
```

## ⚙️ Installation & Setup

### Prerequisites

Make sure you have the following installed:

- Node.js and npm
- MongoDB (local installation or MongoDB Atlas)
- Angular CLI

### 1. Clone the Repository

```bash
git clone https://github.com/moka865/E-Comerce.git
cd E-Comerce
```

### 2. Backend Setup

Navigate to the backend directory:

```bash
cd Backend
npm install
```

Create a `.env` file inside the `Backend` directory:

```env
PORT=3000
DB_URI=your_mongodb_connection_string

# CORS
ALLOWED_ORIGINs=http://localhost:4200

# Security
RATE_LIMIT_MAX=200

# Email Configuration (Optional)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your_email
EMAIL_PASSWORD=your_email_app_password
```

Start the backend server:

**Development mode:**

```bash
npm run dev
```

**Production mode:**

```bash
npm start
```

The backend API will run at:

```text
http://localhost:3000
```

### 3. Frontend Setup

Open a new terminal and navigate to the frontend directory:

```bash
cd frontend
npm install
```

Start the Angular development server:

```bash
npm start
```

The frontend will be available at:

```text
http://localhost:4200
```

## 🔗 API Overview

The backend provides versioned REST API endpoints under `/api/v1`.

| Resource | Endpoint |
|---|---|
| Authentication | `/api/v1/auth` |
| Users | `/api/v1/users` |
| Products | `/api/v1/products` |
| Categories | `/api/v1/categories` |
| Subcategories | `/api/v1/subcategories` |
| Seasons | `/api/v1/seasons` |
| Shopping Cart | `/api/v1/cart` |
| Orders | `/api/v1/orders` |
| Testimonials | `/api/v1/testimonials` |
| Notifications | `/api/v1/notifications` |
| Delivery Fees | `/api/v1/delivery-fees` |
| Analytics | `/api/v1/analytics` |
| Content | `/api/v1/content` |
| Reports | `/api/v1/reports` |
| Admin | `/api/v1/admin` |

## 🔧 Configuration Notes

- The frontend API URL is currently configured in `frontend/src/environments/environment.ts`.
- The default API URL is `http://localhost:3000/api/v1`.
- MongoDB connection is configured through `DB_URI`.
- Email functionality requires valid SMTP credentials.
- Configure allowed frontend origins before deploying the backend.

## 👨‍💻 Author

**Ahmed Ashraf**

- GitHub: [@moka865](https://github.com/moka865)

---

⭐ If you find this project interesting, consider giving the repository a star!

