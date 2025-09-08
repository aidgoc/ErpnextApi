# ERPNext API Tester

A modern, full-stack application for testing ERPNext API endpoints with a clean, intuitive interface.

## 🚀 Quick Start

### Prerequisites
- Node.js 20+ 
- npm or yarn

### Installation & Setup

1. **Clone and navigate to the project:**
   ```bash
   cd erpnext-api-tester
   ```

2. **Start the Server:**
   ```bash
   cd server
   cp .env.example .env
   npm run generate-key  # Generate encryption key
   npm run dev
   ```
   The server will start on `http://localhost:4000`

3. **Start the Client (in a new terminal):**
   ```bash
   cd client
   cp .env.example .env
   npm run dev
   ```
   The client will start on `http://localhost:5173`

## 📁 Project Structure

```
erpnext-api-tester/
├── server/                 # Node.js Express API server
│   ├── src/
│   │   └── index.js       # Main server file
│   ├── package.json
│   └── .env.example
├── client/                 # React frontend application
│   ├── src/
│   │   ├── App.jsx        # Main React component
│   │   └── index.css      # Tailwind CSS styles
│   ├── package.json
│   └── .env.example
└── README.md
```

## 🛠️ Tech Stack

### Server
- **Node.js 20+** with Express.js
- **JavaScript** (ES modules)
- **Security**: Helmet, CORS, Rate limiting
- **Utilities**: Morgan (logging), Compression, Zod (validation)
- **Database**: Mongoose (MongoDB)

### Client
- **React 18** with Vite
- **JavaScript** (no TypeScript)
- **Styling**: Tailwind CSS
- **State Management**: Zustand
- **HTTP Client**: Axios
- **Forms**: React Hook Form with Zod validation
- **Notifications**: React Hot Toast
- **Code Editor**: Monaco Editor

## 🔧 Configuration

### Server Environment Variables
Copy `server/.env.example` to `server/.env` and configure:

```env
PORT=4000
MONGODB_URI=mongodb://localhost:27017/erpnext_api_tester
ENCRYPTION_KEY_BASE64=your-32-byte-base64-encryption-key
```

### Client Environment Variables
Copy `client/.env.example` to `client/.env` and configure:

```env
VITE_API_BASE_URL=http://localhost:4000
VITE_APP_TITLE=ERPNext API Tester
```

## 🎯 Features

- **Modern UI**: Clean, responsive design with Tailwind CSS
- **API Testing**: Test ERPNext API endpoints with different HTTP methods
- **Real-time Connection Status**: Visual indicator of ERPNext connection
- **Request/Response Viewer**: JSON response formatting and display
- **Security**: Rate limiting, CORS, and security headers
- **Encryption**: AES-256-GCM encryption for sensitive data
- **Environment Validation**: Zod-based environment variable validation
- **MongoDB Integration**: Database connectivity with Mongoose
- **Development Ready**: Hot reload for both client and server

## 📝 Available Scripts

### Server
- `npm run dev` - Start development server with nodemon
- `npm start` - Start production server
- `npm run generate-key` - Generate a new encryption key

### Client
- `npm run dev` - Start development server with Vite
- `npm run build` - Build for production
- `npm run preview` - Preview production build

## 🔒 Security Features

- **Helmet**: Security headers
- **CORS**: Cross-origin resource sharing configuration
- **Rate Limiting**: API request rate limiting
- **Input Validation**: Zod schema validation
- **Environment Variables**: Secure configuration management

## 🚀 Deployment

1. **Build the client:**
   ```bash
   cd client
   npm run build
   ```

2. **Start the server in production:**
   ```bash
   cd server
   npm start
   ```

## 📖 Usage

1. Open the client application in your browser
2. Configure your ERPNext connection details
3. Click "Connect" to establish connection
4. Enter API endpoint and select HTTP method
5. Add request body (if needed) and click "Send Request"
6. View the response in the response panel

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

This project is licensed under the ISC License.
