# HOTMS - Hotel Management System

A streamlined hotel management system designed specifically for solo owner-operators. Built with modern web technologies, HOTMS provides a secure, efficient, and user-friendly solution for managing small to medium-sized hotel operations.

## Overview

HOTMS is a single-user hotel management application that handles the core operations of running a hotel property. It's designed to be simple, reliable, and maintenance-free for owner-operators who need to focus on their guests rather than complex software.

## Key Features

### 🔐 **Secure Single-Owner System**
- One-time setup wizard for initial configuration
- Protected authentication system with credential recovery options
- Row-level security (RLS) on all database operations
- Comprehensive audit logging for all actions

### 🏨 **Room Management**
- Complete CRUD operations for room inventory
- Room number, type, and rate management
- Real-time availability tracking
- Intuitive data table interface with sorting and filtering

### 👥 **Guest Management**
- Comprehensive guest profiles with contact information
- Smart search functionality across all guest fields
- Duplicate prevention with unique email constraints
- Advanced guest merging feature to consolidate duplicate entries
- Complete history tracking for all guest interactions

### 📅 **Reservation System**
- Interactive calendar view with color-coded reservation statuses
- Click-to-book functionality with instant room availability
- Guest selection with searchable dropdown
- Flexible check-in/check-out date management
- Visual status indicators (pending, confirmed, checked-in, checked-out)

### 💰 **Payment Tracking**
- Manual payment logging with external payment confirmation
- Multiple payment records per reservation
- Payment method tracking
- Automatic reservation status updates upon payment
- Outstanding payment badges for pending reservations

### 📊 **Operational Transparency**
- Real-time system status in footer (version and last backup time)
- Clear visual feedback for all operations
- Loading states and error handling throughout
- Transaction-safe database operations

## Technology Stack

- **Frontend Framework:** React with TypeScript
- **Build Tool:** Vite
- **UI Components:** shadcn/ui
- **Styling:** TailwindCSS
- **Backend & Database:** Supabase (PostgreSQL)
- **Authentication:** Supabase Auth
- **Data Validation:** Zod
- **Routing:** react-router-dom
- **Calendar:** react-big-calendar
- **Date Management:** date-fns & date-fns-tz

## Project Status

HOTMS has completed Phase 3 of development and is now **PRODUCTION-READY** with enterprise-grade security and comprehensive documentation. The system has been fully deployed and tested in production environment.

**Core Functionality (Phase 1-2):**
- ✅ Secure authentication and setup process
- ✅ Complete room and guest management
- ✅ Full reservation workflow with calendar interface
- ✅ Payment tracking and confirmation system
- ✅ Database-level constraints for data integrity
- ✅ Comprehensive audit logging

**Security & Production Readiness (Phase 3):**
- ✅ **Complete security audit** - Row-Level Security verified on all 7 tables
- ✅ **Zero vulnerabilities** - No dependency or XSS vulnerabilities found
- ✅ **Code quality improved** - TypeScript safety and linting cleanup completed
- ✅ **Professional documentation** - Complete user guide with recovery procedures
- ✅ **Production deployment** - Successfully deployed and smoke tested
- ✅ **Enterprise-grade security** - All 14 API functions properly protected

## Documentation & User Guide

HOTMS includes comprehensive documentation designed for non-technical hotel owners:

**📚 User Guide (`docs/USER_GUIDE.md`):**
- Complete instructions for all features
- First-time setup walkthrough
- Daily operation workflows for managing rooms, guests, and reservations
- Payment tracking and guest management procedures
- Troubleshooting section for common issues
- **Critical: Owner's Recovery Guide** (Appendix A) for credential recovery

**🔧 Technical Documentation:**
- API documentation for all 14 endpoint functions
- Database schema with security policies
- Deployment and environment configuration guides
- Security audit reports and vulnerability assessments

**📸 Project Screenshots:**
- Visual overview of the application interface (available in `docs/images/`)
- Key features and main pages demonstration

## Design Philosophy

HOTMS is built with the solo operator in mind:
- **Simple over Complex:** Every feature is designed to be intuitive
- **Reliable over Fancy:** Stability and data integrity are paramount
- **Transparent Operations:** Always know what the system is doing
- **Manual Workflows:** Designed for hands-on management style
- **Future-Proof:** Built to handle years of operational data

## Getting Started

**For Hotel Owners/Operators:**
1. **Read the User Guide:** Start with `docs/USER_GUIDE.md` for complete setup and usage instructions
2. **First-Time Setup:** Follow the one-time setup wizard when you first access the application
3. **Daily Operations:** Use the main dashboard to manage rooms, guests, and reservations
4. **Need Help?** Check the troubleshooting section in the user guide or use the recovery procedures in Appendix A

**For Developers:**
1. **Prerequisites:** Node.js 18+, npm, and Supabase account
2. **Environment Setup:** Configure `.env.local` with Supabase credentials
3. **Installation:** `npm install` followed by `npm run dev`
4. **Database:** Apply migrations in `supabase/migrations/` to set up the database schema
5. **Security:** Review RLS policies and authentication setup before deployment

## Support & Maintenance

**Production Status:** ✅ Fully deployed and production-tested
**Security Status:** ✅ Enterprise-grade security audit completed
**Documentation Status:** ✅ Complete user and technical documentation available

**Critical Recovery Information:**
- Owner credential recovery procedures are documented in `docs/USER_GUIDE.md` Appendix A
- Keep Supabase dashboard access credentials separate and secure
- Regular backups are tracked in the application footer

## License

This project is proprietary software designed for a specific hotel operation.
