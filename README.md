# 🌱 EcoNexus - Sustainable Product Lifecycle Platform

<div align="center">

![EcoNexus Logo](https://img.shields.io/badge/EcoNexus-Sustainable%20Future-10b981?style=for-the-badge&logo=recycle)

**Recycle. Earn. Impact — with EcoNexus**

[![Live Demo](https://img.shields.io/badge/Live-Demo-success?style=flat-square)](https://old-randee-scambot8-385c84e4.koyeb.app/)

[Features](#-features) • [Tech Stack](#-tech-stack) • [Getting Started](#-getting-started) • [Team](#-team) 

</div>

---

## 📖 About

EcoNexus is a comprehensive **Sustainable Product Lifecycle Management Platform** that revolutionizes how we approach recycling and circular economy. By connecting customers, companies, and administrators, we create a seamless ecosystem where waste becomes valuable, and sustainability becomes rewarding.

### 🎯 Mission

To create a sustainable future by making recycling rewarding, trackable, and impactful through innovative technology and user-centric design.

### 🌟 Vision

A world where every product has a complete, transparent lifecycle, and every individual is empowered to contribute to environmental sustainability while earning rewards.

---

## ✨ Features

### 👤 For Customers
- 🔍 **Product Registration** - Scan and register products using RFID technology
- 💰 **Rewards System** - Earn points for every product recycled (₹1 per point)
- 📊 **Dashboard** - Track registered products, pending pickups, and collection history
- 🚚 **Pickup Requests** - Schedule convenient pickup times for recyclable products
- 📱 **Mobile Responsive** - Access from any device, anywhere
- 🎨 **Beautiful UI** - Enhanced green theme with wave animations

### 🏢 For Companies
- 📦 **Product Management** - Add products individually or via bulk upload
- 🔄 **Lifecycle Tracking** - Monitor products from manufacturing to recycling
- 📈 **Analytics Dashboard** - View product statistics and lifecycle stages
- ✅ **Status Updates** - Track products through various stages
- 🎯 **Inventory Management** - Manage active, in-market, and collected products

### 🛡️ For Administrators
- ✅ **Company Verification** - Approve or reject company registrations
- 📋 **Pickup Management** - Oversee and manage pickup requests
- 🏭 **Inventory Control** - Track collected products and processing status
- ♻️ **Recycling Oversight** - Monitor products sent to recycling units
- 📊 **System Analytics** - Comprehensive overview of platform operations

---

## 🛠️ Tech Stack

### Frontend
- **Framework**: React 18 with TypeScript
- **Routing**: Wouter (lightweight React router)
- **State Management**: TanStack Query (React Query)
- **UI Components**: Radix UI + Custom Components
- **Styling**: Tailwind CSS with custom animations
- **Forms**: React Hook Form + Zod validation
- **Icons**: Lucide React
- **Build Tool**: Vite

### Backend
- **Authentication API**: Flask (Python)
  - Handles customer, company, and admin authentication
  - Company verification system
  
- **Products API**: FastAPI (Python)
  - Product management and CRUD operations
  - Reward calculations
  - Pickup request handling
  - Status tracking

### Database
- **Primary Database**: PostgreSQL
- **ORM**: Drizzle ORM
- **Session Store**: PostgreSQL with connect-pg-simple

### DevOps & Deployment
- **Frontend Hosting**: Koyeb
- **Backend Hosting**: Koyeb
- **Version Control**: Git & GitHub
- **CI/CD**: Netlify automatic deployments
- **SSL**: Automatic HTTPS via Netlify

---

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ and npm
- Git
- Modern web browser

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/PranjaldevX/Eco_octopus.git
   cd econexus/final_eco_nexus
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start development server**
   ```bash
   npm run dev
   ```

4. **Open your browser**
   ```
   http://localhost:5000
   ```

### Build for Production

```bash
npm run build
```

The production build will be in the `dist` directory.

### Preview Production Build

```bash
npm run build
npx vite preview
```

---



## 🎨 Design Features

### Enhanced Green Theme
- Vibrant green gradient backgrounds
- Animated wave effects on all pages
- Smooth transitions and hover effects
- Glassmorphism design elements
- Floating animated elements

### Wave Backgrounds
- Login page with three-layer animated waves
- Dashboard hero sections with wave animations
- Product cards with hover-activated wave effects
- Consistent theme across all pages

### Responsive Design
- Mobile-first approach
- Tablet and desktop optimized
- Touch-friendly interface
- Adaptive layouts

---

## 🔐 Authentication

### Test Accounts

**Admin**
- ID: `admin_001`
- Password: `admin123`

**Company**
- Email: `company@example.com`
- Password: `company123`

**Customer**
- Create a new account or use existing credentials

---

## 📁 Project Structure

```
final_eco_nexus/
├── client/                    # Frontend application
│   ├── src/
│   │   ├── components/       # Reusable UI components
│   │   ├── pages/           # Page components
│   │   │   ├── HomePage.tsx
│   │   │   ├── LoginPage.tsx
│   │   │   ├── CustomerDashboard.tsx
│   │   │   ├── CompanyDashboard.tsx
│   │   │   └── AdminDashboard.tsx
│   │   ├── lib/             # Utilities and API
│   │   │   ├── api.ts       # API configuration
│   │   │   └── queryClient.ts
│   │   ├── styles/          # Custom styles
│   │   └── App.tsx          # Main app component
│   ├── public/              # Static assets
│   ├── netlify.toml         # Netlify configuration
│   └── _redirects           # SPA routing rules
├── server/                   # Backend (if needed)
├── docs/                     # Documentation
└── README.md                # This file
```

---

## 🔌 API Endpoints

### Authentication API (Flask)
- `POST /api/auth/customer/register` - Register customer
- `POST /api/auth/customer/login` - Customer login
- `POST /api/auth/company/register` - Register company
- `POST /api/auth/company/login` - Company login
- `POST /api/auth/admin/login` - Admin login
- `GET /api/admin/companies` - Get all companies
- `POST /api/admin/companies/verify` - Verify company
- `POST /api/admin/companies/reject` - Reject company

### Products API (FastAPI)
- `POST /add_product` - Add product to customer account
- `POST /add_product_company` - Company adds new product
- `GET /get_products_by_email` - Get customer products
- `GET /products_by_company/{email}` - Get company products
- `GET /product_by_rfid/{rfid}` - Get product by RFID
- `POST /update_product_status` - Update product status
- `POST /calculate-reward/` - Calculate reward points
- `GET /all_products` - Get all products (admin)

---

## 👥 Team

### Development Team

<table>
  <tr>
    <td align="center">
      <img src="https://ui-avatars.com/api/?name=Mujeem+Khan&background=10b981&color=fff&size=100" width="100px;" alt="Mujeem Khan"/><br />
      <sub><b>Mujeem Khan</b></sub><br />
      <sub>DevOps Engineer</sub><br />
      <sub>Backend Development | Database Management | Debugging</sub>
    </td>
    <td align="center">
      <img src="https://ui-avatars.com/api/?name=Pranjal+Yadav&background=059669&color=fff&size=100" width="100px;" alt="Pranjal Yadav"/><br />
      <sub><b>Pranjal Yadav</b></sub><br />
      <sub>Researcher & Frontend Developer</sub><br />
      <sub>UI/UX Development | Research | Testing</sub>
    </td>
    <td align="center">
      <img src="https://ui-avatars.com/api/?name=Naved+Alam&background=14b8a6&color=fff&size=100" width="100px;" alt="Naved Alam"/><br />
      <sub><b>Naved Alam</b></sub><br />
      <sub>Researcher & Designer</sub><br />
      <sub>Research Assistant | UI/UX Designer</sub>
    </td>
  </tr>
</table>

### Roles & Responsibilities

#### 🔧 Mujeem Khan - DevOps Engineer
- Backend API development and deployment
- Database architecture and management
- System debugging and optimization
- Server configuration and maintenance
- API integration and testing
- Performance monitoring

#### 💻 Pranjal Yadav -Research & Frontend Developer
- Frontend architecture and development
- UI/UX implementation
- Research and feature planning
- User experience optimization
- Cross-browser compatibility

#### 🎨 Naved Alam - Design & Resaerch
- User research and analysis
- UI/UX design and prototyping
- Design system development
- User flow optimizatio
- Visual design and branding
- Research assistance
- Quality assurance and testing

---

## 📊 Features Breakdown

### Customer Journey
1. **Registration** → Create account with email
2. **Product Scan** → Scan RFID to register products
3. **Reward Calculation** → System calculates potential rewards
4. **Pickup Request** → Schedule convenient pickup
5. **Collection** → Products collected by admin
6. **Reward Earned** → Points credited to account

### Company Journey
1. **Registration** → Submit company details
2. **Admin Approval** → Wait for verification
3. **Product Addition** → Add products (single/bulk)
4. **Lifecycle Tracking** → Monitor product journey
5. **Analytics** → View statistics and insights

### Admin Journey
1. **Company Verification** → Approve/reject companies
2. **Pickup Management** → Oversee pickup requests
3. **Inventory Control** → Manage collected products
4. **Recycling Process** → Send to recycling units
5. **System Oversight** → Monitor entire platform

---

## 🔄 Product Lifecycle

```
Manufacturing → Registration → Customer Use → Pickup Request
     ↓              ↓              ↓              ↓
  Company      Active Status   Pending Pickup  Collected
     ↓              ↓              ↓              ↓
  Tracking    Customer Dashboard  Admin Queue  Processing
     ↓              ↓              ↓              ↓
  Analytics   Reward Calculation  Collection   Recycling
```

---

## 🎯 Key Metrics

- **Reward Rate**: 12% of product price
- **Point Value**: ₹1 per point
- **Product Statuses**: 
  - Registered
  - Active
  - Pending Pickup
  - Collected
  - Processing
  - Recycled

---

## 🔒 Security Features

- Secure authentication with password hashing
- Role-based access control (RBAC)
- Session management
- HTTPS encryption
- XSS protection headers
- CSRF protection
- Input validation and sanitization

---

## 🌍 Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)
- Mobile browsers (iOS Safari, Chrome Mobile)

---

## 📱 Mobile Support

- Fully responsive design
- Touch-optimized interface
- Mobile-first approach
- Progressive Web App ready

---

## 🐛 Known Issues

None currently. Report issues on GitHub Issues page.

---

## 🔮 Future Enhancements

- [ ] QR code scanning support
- [ ] Real-time notifications
- [ ] Mobile app (React Native)
- [ ] Blockchain integration for transparency
- [ ] AI-powered product categorization
- [ ] Social sharing features
- [ ] Gamification elements
- [ ] Multi-language support
- [ ] Advanced analytics dashboard
- [ ] Integration with recycling facilities

---

## 📚 Documentation

- [Deployment Guide](NETLIFY_DEPLOYMENT_GUIDE.md) - Complete deployment instructions
- [Quick Deploy](QUICK_DEPLOY.md) - 5-minute deployment guide
- [Deployment Checklist](DEPLOYMENT_CHECKLIST.md) - Pre-deployment checklist
- [Navigation Fix](NAVIGATION_FIX_SUMMARY.md) - Routing and navigation details
- [Enhanced Theme](ENHANCED_THEME_SUMMARY.md) - UI/UX enhancements
- [Final Review](FINAL_REVIEW_AND_FIXES.md) - Bug fixes and improvements

---

## 🤝 Contributing

We welcome contributions! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 🙏 Acknowledgments

- **Radix UI** - For accessible UI components
- **Tailwind CSS** - For utility-first CSS framework
- **Lucide** - For beautiful icons
- **Vercel** - For backend hosting
- **Netlify** - For frontend hosting
- **Open Source Community** - For amazing tools and libraries

---

## 📞 Support

For support, email support@econexus.com or join our Slack channel.

---

## 🌟 Star Us!

If you find this project useful, please consider giving it a ⭐ on GitHub!

---

## 📈 Project Status

**Status**: ✅ Production Ready

**Version**: 1.0.0

**Last Updated**: 2024

---

<div align="center">

### Made with 💚 for a Sustainable Future

**EcoNexus** - Transform Waste Into Rewards & Impact

[Website](https://your-site.netlify.app) • [Documentation](docs/) • [Report Bug](issues/) • [Request Feature](issues/)

---

© 2024 EcoNexus Team. All rights reserved.

</div>



