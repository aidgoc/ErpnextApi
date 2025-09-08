# ERPNext API Tester

A comprehensive web application for testing ERPNext API endpoints with a modern React frontend and Node.js backend.

## 🚀 Features

- **Connection Management**: Create and manage multiple ERPNext connections
- **API Testing**: Test various ERPNext API endpoints (GET, POST, PUT, DELETE)
- **Custom Endpoints**: Add and manage custom API endpoints
- **Request History**: Track and view API request history
- **Real-time Testing**: Send requests and view responses in real-time
- **Secure Storage**: Encrypted storage of API keys and secrets
- **Modern UI**: Clean, responsive interface built with React and Tailwind CSS

## 🛠️ Tech Stack

### Frontend
- **React 18** - Modern React with hooks
- **Vite** - Fast build tool and dev server
- **Tailwind CSS** - Utility-first CSS framework
- **Axios** - HTTP client for API requests
- **React Hot Toast** - Toast notifications

### Backend
- **Node.js** - JavaScript runtime
- **Express.js** - Web framework
- **MongoDB** - Database with Mongoose ODM
- **JWT** - Authentication tokens
- **Crypto** - Encryption for sensitive data
- **CORS** - Cross-origin resource sharing
- **Helmet** - Security middleware

## 📦 Installation

### Prerequisites
- Node.js (v16 or higher)
- MongoDB (local or cloud)
- Git

### Setup

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd ERpnextApi
   ```

2. **Install dependencies**
   ```bash
   # Install server dependencies
   cd erpnext-api-tester/server
   npm install
   
   # Install client dependencies
   cd ../client
   npm install
   ```

3. **Environment Setup**
   ```bash
   # Create .env file in server directory
   cd ../server
   cp .env.example .env
   ```
   
   Edit the `.env` file with your configuration:
   ```env
   PORT=4000
   MONGODB_URI=mongodb://localhost:27017/erpnext-api-tester
   CLIENT_URL=http://localhost:5173
   ENCRYPTION_KEY_BASE64=your-base64-encryption-key
   NODE_ENV=development
   ```

4. **Start the applications**
   ```bash
   # Start server (in one terminal)
   cd erpnext-api-tester/server
   npm start
   
   # Start client (in another terminal)
   cd erpnext-api-tester/client
   npm run dev
   ```

## 🌐 Usage

1. **Access the application**: Open http://localhost:5173 in your browser
2. **Create a connection**: Add your ERPNext instance details
3. **Test APIs**: Select endpoints and send requests
4. **Manage custom endpoints**: Add your own API endpoints
5. **View history**: Check your request history

## 📁 Project Structure

```
ERpnextApi/
├── erpnext-api-tester/
│   ├── client/                 # React frontend
│   │   ├── src/
│   │   │   ├── App.jsx        # Main application component
│   │   │   ├── App.css        # Application styles
│   │   │   └── index.css      # Global styles with Tailwind
│   │   ├── package.json
│   │   └── tailwind.config.js # Tailwind configuration
│   └── server/                 # Node.js backend
│       ├── src/
│       │   ├── erpnext/       # ERPNext client integration
│       │   ├── models/        # Database models
│       │   ├── routes/        # API routes
│       │   └── utils/         # Utility functions
│       ├── server.js          # Main server file
│       └── package.json
└── README.md
```

## 🔧 API Endpoints

### Connections
- `GET /api/connections` - Get all connections
- `POST /api/connections` - Create new connection
- `PUT /api/connections/:id` - Update connection
- `DELETE /api/connections/:id` - Delete connection

### ERPNext API
- `POST /api/erp/send` - Send request to ERPNext
- `GET /api/erpnext/test-connection` - Test connection
- `GET /api/erpnext/doc-types` - Get available document types

### Custom Endpoints
- `GET /api/custom` - Get custom endpoints
- `POST /api/custom` - Create custom endpoint
- `PUT /api/custom/:id` - Update custom endpoint
- `DELETE /api/custom/:id` - Delete custom endpoint
- `POST /api/custom/:id/execute` - Execute custom endpoint

### History
- `GET /api/history` - Get request history
- `POST /api/history` - Save request to history
- `DELETE /api/history/:id` - Delete history entry

## 🔐 Security Features

- **Encrypted Storage**: API keys and secrets are encrypted before storage
- **CORS Protection**: Configured for secure cross-origin requests
- **Rate Limiting**: Built-in rate limiting to prevent abuse
- **Input Validation**: Comprehensive input validation using Zod
- **Security Headers**: Helmet.js for security headers

## 🚀 Deployment

### Using PM2 (Recommended)
```bash
# Install PM2 globally
npm install -g pm2

# Start server with PM2
cd erpnext-api-tester/server
pm2 start server.js --name "erpnext-api-server"

# Start client build
cd ../client
npm run build
pm2 serve dist 5173 --name "erpnext-api-client"
```

### Using Docker
```bash
# Build and run with Docker Compose
docker-compose up -d
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

If you encounter any issues or have questions:

1. Check the [Issues](https://github.com/yourusername/ERpnextApi/issues) page
2. Create a new issue with detailed information
3. Contact the maintainers

## 🙏 Acknowledgments

- ERPNext team for the excellent API
- React and Node.js communities
- All contributors and users

---

**Happy Testing! 🎉**
