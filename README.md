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

HOTMS has completed Phase 2 of development and is now a fully functional MVP. The system includes all core features needed for day-to-day hotel operations:

- ✅ Secure authentication and setup process
- ✅ Complete room and guest management
- ✅ Full reservation workflow with calendar interface
- ✅ Payment tracking and confirmation system
- ✅ Database-level constraints for data integrity
- ✅ Comprehensive audit logging

## Design Philosophy

HOTMS is built with the solo operator in mind:
- **Simple over Complex:** Every feature is designed to be intuitive
- **Reliable over Fancy:** Stability and data integrity are paramount
- **Transparent Operations:** Always know what the system is doing
- **Manual Workflows:** Designed for hands-on management style
- **Future-Proof:** Built to handle years of operational data

## License

This project is open-source.
