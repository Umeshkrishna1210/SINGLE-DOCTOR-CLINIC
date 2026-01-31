# MediSync - Medical Clinic Management System

A comprehensive web-based medical clinic management system built with React, Node.js, Express, and MySQL.

## 🌟 Features

### For Patients
- **User Registration & Authentication** - Secure account creation and login
- **Appointment Booking** - Schedule appointments with available time slots
- **Medical Records Upload** - Upload and manage medical documents (PDFs)
- **View Prescriptions** - Access doctor-prescribed medications
- **Appointment Management** - View and cancel appointments
- **Email Reminders** - Automatic appointment reminders

### For Doctors
- **Dashboard** - View all appointments and patient information
- **Appointment Management** - Confirm, cancel, and manage appointments
- **Patient Records** - Access patient medical history and uploaded documents
- **Prescription Management** - Create and update patient prescriptions
- **Availability Settings** - Set working hours and block specific dates/times
- **Profile Management** - Update personal information and password

## 🛠️ Tech Stack

### Frontend
- **React 19** - UI framework
- **React Router** - Navigation
- **Tailwind CSS** - Styling
- **Axios** - HTTP client
- **Day.js** - Date manipulation
- **Vite** - Build tool

### Backend
- **Node.js** - Runtime environment
- **Express** - Web framework
- **MySQL2** - Database driver
- **JWT** - Authentication
- **Bcrypt** - Password hashing
- **Multer** - File uploads
- **Nodemailer** - Email sending
- **Node-cron** - Scheduled tasks
- **Helmet** - Security headers
- **Express Rate Limit** - Rate limiting
- **Express Validator** - Input validation

## 📋 Prerequisites

- Node.js (v16 or higher)
- MySQL (v8 or higher)
- npm or yarn

## 🚀 Installation

### 1. Clone the Repository
```bash
git clone <repository-url>
cd mini-project-pres
```

### 2. Backend Setup

```bash
cd backend
npm install
```

Create a `.env` file in the backend directory:

```env
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_mysql_password
DB_NAME=mediSyncDB
DB_PORT=3306
JWT_SECRET=your_super_secret_jwt_key_here
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_app_password
NODE_ENV=development
ALLOWED_ORIGINS=http://localhost:5173,http://localhost:3000
PORT=5000
```

**Important Email Setup:**
- For Gmail, you need to create an [App Password](https://myaccount.google.com/apppasswords)
- Enable 2-Factor Authentication first
- Use the 16-character app password in `EMAIL_PASS`

### 3. Database Setup

```bash
# Login to MySQL
mysql -u root -p

# Run the schema file
source mediSyncDB.sql
```

Or import via MySQL Workbench:
1. Open MySQL Workbench
2. File → Run SQL Script
3. Select `mediSyncDB.sql`

### 4. Frontend Setup

```bash
cd ../frontend
npm install
```

Create a `.env` file in the frontend directory:

```env
VITE_API_URL=http://localhost:5000
```

## 🏃 Running the Application

### Development Mode

**Terminal 1 - Backend:**
```bash
cd backend
node server.js
```

**Terminal 2 - Frontend:**
```bash
cd frontend
npm run dev
```

The application will be available at:
- Frontend: http://localhost:5173
- Backend API: http://localhost:5000

### Default Accounts

**Doctor Account:**
- Email: `doctor@clinic.com`
- Password: `doctor123`

**Test Patient:**
- Register a new patient account through the UI

## 📁 Project Structure

```
mini-project-pres/
├── backend/
│   ├── middleware/
│   │   ├── authMiddleware.js      # JWT authentication
│   │   ├── errorHandler.js        # Error handling
│   │   └── validation.js          # Input validation
│   ├── routes/
│   │   ├── auth.js                # Authentication routes
│   │   ├── appointments.js        # Appointment management
│   │   ├── medicalRecords.js      # Medical records
│   │   ├── users.js               # User management
│   │   ├── availability.js        # Doctor availability
│   │   ├── schedule.js            # Schedule settings
│   │   ├── patientRoutes.js       # Patient-specific routes
│   │   └── mailer.js              # Email functionality
│   ├── uploads/                   # Uploaded files
│   ├── db.js                      # Database connection
│   ├── server.js                  # Express server
│   └── .env                       # Environment variables
├── frontend/
│   ├── src/
│   │   ├── components/            # React components
│   │   ├── context/               # Context providers
│   │   ├── App.jsx                # Main app component
│   │   └── main.jsx               # Entry point
│   └── .env                       # Frontend environment
└── mediSyncDB.sql                 # Database schema
```

## 🔒 Security Features

- ✅ JWT-based authentication
- ✅ Password hashing with bcrypt
- ✅ Input validation on all endpoints
- ✅ Rate limiting (100 requests/15min, 5 auth attempts/15min)
- ✅ Security headers (Helmet.js)
- ✅ CORS protection
- ✅ SQL injection prevention (parameterized queries)
- ✅ XSS protection
- ✅ Authenticated file access
- ✅ Database connection pooling
- ✅ Graceful shutdown handling

## 📝 API Endpoints

### Authentication
- `POST /auth/register` - Register new user
- `POST /auth/login` - User login

### Appointments
- `GET /appointments` - Get appointments (role-based)
- `POST /appointments/book` - Book appointment (patient)
- `PUT /appointments/confirm/:id` - Confirm appointment (doctor)
- `DELETE /appointments/cancel/:id` - Cancel appointment

### Medical Records
- `POST /medical-records` - Upload medical record (patient)
- `GET /medical-records/myprescriptions` - Get prescriptions (patient)
- `POST /medical-records/prescription` - Add prescription (doctor)
- `GET /medical-records/for-patient/:id` - Get patient records (doctor)

### Users
- `GET /users/:userId` - Get user details (doctor)
- `PUT /users/profile` - Update profile

### Availability
- `GET /availability/blocked-days` - Get blocked days
- `POST /availability/block-day` - Block a day (doctor)
- `DELETE /availability/unblock-day/:id` - Unblock day (doctor)
- `GET /availability/blocked-slots` - Get blocked time slots
- `POST /availability/block-slot` - Block time slot (doctor)
- `DELETE /availability/unblock-slot/:id` - Unblock slot (doctor)

## 🚀 Production Deployment

### Environment Variables for Production

Update `.env` files with production values:

**Backend:**
```env
NODE_ENV=production
DB_HOST=your_production_db_host
DB_USER=your_production_db_user
DB_PASSWORD=your_production_db_password
DB_NAME=mediSyncDB
JWT_SECRET=generate_a_strong_random_secret
EMAIL_USER=your_production_email
EMAIL_PASS=your_production_email_password
ALLOWED_ORIGINS=https://yourdomain.com
PORT=5000
```

**Frontend:**
```env
VITE_API_URL=https://api.yourdomain.com
```

### Build Frontend

```bash
cd frontend
npm run build
```

The build files will be in `frontend/dist/`

### Deploy Backend

1. **Using PM2 (Recommended):**
```bash
npm install -g pm2
cd backend
pm2 start server.js --name medisync-api
pm2 save
pm2 startup
```

2. **Using Docker:**
```dockerfile
# Create Dockerfile in backend/
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
EXPOSE 5000
CMD ["node", "server.js"]
```

### Nginx Configuration

```nginx
server {
    listen 80;
    server_name yourdomain.com;

    # Frontend
    location / {
        root /var/www/medisync/frontend/dist;
        try_files $uri $uri/ /index.html;
    }

    # Backend API
    location /api {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

## 🐛 Troubleshooting

### Database Connection Issues
- Verify MySQL is running: `sudo systemctl status mysql`
- Check credentials in `.env`
- Ensure database exists: `SHOW DATABASES;`

### Email Not Sending
- Verify Gmail App Password is correct
- Check 2FA is enabled on Google account
- Review console logs for detailed errors

### CORS Errors
- Ensure frontend URL is in `ALLOWED_ORIGINS`
- Check that frontend is using correct API URL

### File Upload Issues
- Verify `uploads/` directory exists and is writable
- Check file size limits (default: 10MB)
- Ensure authentication token is valid

## 📊 Database Schema

### Tables
- **users** - User accounts (patients & doctors)
- **appointments** - Appointment bookings
- **medical_records** - Patient medical records and prescriptions
- **blocked_days** - Doctor unavailable days
- **blocked_time_slots** - Specific blocked time slots
- **doctor_schedule_settings** - Doctor working hours

## 🔄 Future Enhancements

- [ ] Multi-doctor support
- [ ] Video consultation integration
- [ ] SMS notifications
- [ ] Payment integration
- [ ] Analytics dashboard
- [ ] Mobile app (React Native)
- [ ] Multi-language support
- [ ] Dark mode
- [ ] Export reports (PDF/CSV)

## 📄 License

This project is licensed under the MIT License.

## 👥 Support

For support, email support@medisync.com or create an issue in the repository.

## 🙏 Acknowledgments

- Built with modern web technologies
- Designed for small to medium clinics
- Focus on security and user experience

---

**Version:** 1.0.0  
**Last Updated:** January 2026
