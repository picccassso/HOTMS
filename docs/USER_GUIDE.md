# HOTMS User Guide

## Table of Contents

1. [Introduction](#introduction)
2. [First-Time Setup](#first-time-setup)
3. [Logging In & Out](#logging-in--out)
4. [The Main Dashboard](#the-main-dashboard)
5. [Managing Rooms](#managing-rooms)
6. [Managing Guests](#managing-guests)
7. [Merging Duplicate Guests](#merging-duplicate-guests)
8. [Using the Reservations Calendar](#using-the-reservations-calendar)
9. [Logging Payments](#logging-payments)

---

## Introduction

Welcome to the Hotel Operations & Task Management System (HOTMS). This application is designed specifically for solo owner-operators to efficiently manage their hotel operations, including room management, guest information, reservations, and payment tracking.

HOTMS provides a secure, web-based interface that you can access from any device with an internet connection. All your data is securely stored and protected with enterprise-grade security measures.

---

## First-Time Setup

When you first access your HOTMS application, you'll be guided through a one-time setup process.

### Step 1: Initial Access
1. Navigate to your HOTMS application URL
2. You'll be automatically redirected to the setup wizard

### Step 2: Hotel Information
1. Enter your hotel name
2. Select your timezone from the dropdown menu
3. Click "Next" to continue

### Step 3: Room Setup
1. Add your hotel rooms one by one
2. For each room, provide:
   - Room number (e.g., "101", "A1", "Suite-1")
   - Room type (e.g., "Standard", "Deluxe", "Suite")
   - Nightly rate (in USD)
3. Click "Add Room" for each room
4. Click "Complete Setup" when all rooms are added

**Important:** Once setup is complete, this wizard will never be accessible again. Make sure all your information is correct before finishing.

---

## Logging In & Out

### Logging In
1. Navigate to your HOTMS application URL
2. Enter your email address and password
3. Click "Sign In"

If you forget your password, see the [Owner's Recovery Guide](#appendix-a-owners-recovery-guide) below.

### Logging Out
1. Click your name in the top-right corner of the application
2. Select "Logout" from the dropdown menu
3. You'll be redirected to the login page

---

## The Main Dashboard

The main dashboard provides an overview of your hotel's current status and quick access to all features.

### Layout Components

**Header:** Contains the application title and your user menu (logout option)

**Sidebar:** Navigation menu with links to:
- Dashboard (home)
- Rooms
- Guests  
- Reservations Calendar

**Footer:** Displays important system information:
- Current application version
- Last successful backup timestamp

### Dashboard Information
The dashboard shows:
- Current occupancy statistics
- Today's check-ins and check-outs
- Recent reservations
- Quick action buttons for common tasks

---

## Managing Rooms

The Rooms page allows you to view, add, edit, and manage all your hotel rooms.

### Viewing Rooms
- All rooms are displayed in a table format
- You can see room number, type, rate, and status (Active/Inactive)
- Use the table headers to sort rooms by any column

### Adding a New Room
1. Click the "Add Room" button in the top-right
2. Fill in the room details:
   - **Room Number:** Unique identifier for the room
   - **Room Type:** Category of room (Standard, Deluxe, Suite, etc.)
   - **Rate:** Nightly rate in USD
   - **Status:** Active (available for booking) or Inactive
3. Click "Save" to add the room

### Editing a Room
1. Find the room in the table
2. Click the three-dot menu (⋯) in the Actions column
3. Select "Edit"
4. Update the room information
5. Click "Save Changes"

### Deleting a Room
You can delete rooms that no longer exist in your hotel:
1. Find the room in the table
2. Click the three-dot menu (⋯) in the Actions column
3. Select "Delete"
4. Confirm the deletion

**Important:** You can only delete rooms that have no active reservations. If a room has pending, confirmed, or checked-in reservations, you'll see a helpful message explaining your options:
- Complete current reservations (check guests out), then delete the room
- Cancel pending/confirmed reservations, then delete the room
- Mark the room as inactive instead of deleting it

Rooms with only checked-out or cancelled reservations can be safely deleted. The historical reservation data will be preserved, but room information will show as "Room Deleted" in old records.

### Deactivating a Room (Alternative to Deleting)
Instead of deleting rooms, you can deactivate them to keep full historical data:
1. Edit the room as described above
2. Uncheck the "Active" checkbox
3. Save the changes

Inactive rooms will not appear in booking options but remain fully in your records.

---

## Managing Guests

The Guests page helps you maintain a database of all your guests for efficient booking and customer service.

### Viewing Guests
- All guests are displayed in a searchable table
- Information includes name, email, phone, address, and date added
- Use the search functionality to quickly find specific guests

### Adding a New Guest
1. Click the "Add Guest" button
2. Fill in the guest information:
   - **Full Name:** Guest's complete name (required)
   - **Email:** Email address (required)
   - **Phone Number:** Contact number (optional)
   - **Address:** Mailing address (optional)
3. Click "Save" to add the guest

### Editing Guest Information
1. Find the guest in the table
2. Click the three-dot menu (⋯) in the Actions column
3. Select "Edit"
4. Update the information
5. Click "Save Changes"

### Searching for Guests
Use the search functionality to quickly find guests by:
- Name (partial matches work)
- Email address
- Phone number

### Deleting a Guest
You can delete guest records when necessary:
1. Find the guest in the table
2. Click the three-dot menu (⋯) in the Actions column
3. Select "Delete"
4. Confirm the deletion

**Important:** You can only delete guests who have no active reservations. If a guest has pending, confirmed, or checked-in reservations, you'll see a helpful message explaining your options:
- Complete current reservations (check the guest out), then delete the guest
- Cancel pending/confirmed reservations, then delete the guest

Guests with only checked-out or cancelled reservations can be safely deleted. The historical reservation data will be preserved, but guest information will show as "Guest Deleted" in old records.

---

## Merging Duplicate Guests

Over time, you may accidentally create duplicate guest records. HOTMS provides a safe way to merge these duplicates.

### Identifying Duplicates
1. Use the search function to find potential duplicates
2. Look for guests with similar names or the same email address

### Merging Process
1. Select exactly two guest records by checking the boxes next to their names
2. Click the "Merge Selected Guests" button that appears
3. In the merge dialog:
   - Choose which guest record to keep as the "target"
   - Review the information from both records
   - Select the best information from each field
   - The source guest will be archived, and all their reservations will be transferred
4. Click "Merge Guests" to complete the process

**Important:** This action cannot be undone. Review all information carefully before merging.

---

## Using the Reservations Calendar

The Reservations Calendar is the heart of your booking system, providing a visual overview of all reservations and availability.

### Calendar Views
- **Month View:** Overview of the entire month
- **Week View:** Detailed week view
- **Day View:** Hour-by-hour view of a single day
- **Agenda View:** List format of upcoming reservations

### Understanding the Display
Reservations are color-coded by status:
- **Yellow:** Pending reservations
- **Green:** Confirmed reservations
- **Blue:** Checked-in guests
- **Gray:** Checked-out guests
- **Red:** Cancelled reservations

### Creating a New Reservation (Click-to-Book)
1. Click on any available date/time slot on the calendar
2. The New Reservation dialog will open with the dates pre-filled
3. Fill in the reservation details:
   - **Guest:** Select from existing guests or create a new one
   - **Room:** Choose from available rooms
   - **Dates:** Adjust if needed
   - **Status:** Usually starts as "Pending"
4. Click "Create Reservation"

### Viewing Reservation Details
1. Click on any existing reservation on the calendar
2. The Reservation Details dialog will show:
   - Guest information
   - Room details
   - Dates and duration
   - Current status
   - Payment history
   - Check-in/Check-out buttons

### Managing Reservation Status
From the Reservation Details dialog, you can:
- **Check In:** Mark guest as arrived
- **Check Out:** Complete the stay
- **Update Status:** Change between Pending/Confirmed/Cancelled
- **Add Payments:** Record payment received

---

## Logging Payments

HOTMS helps you track payments manually received outside the system (cash, check, bank transfer, etc.).

### Adding a Payment
1. Open a reservation from the calendar
2. In the Reservation Details dialog, click "Add Payment"
3. Fill in the payment information:
   - **Amount:** Payment amount in USD
   - **Payment Method:** How payment was received (Cash, Check, Bank Transfer, etc.)
   - **Notes:** Optional details about the payment
   - **Confirmation Checkbox:** You MUST check this box to confirm you actually received the payment
4. Click "Add Payment"

### Payment Confirmation
The mandatory confirmation checkbox ensures you don't accidentally log payments that weren't actually received. This checkbox must be checked before you can save the payment.

### Viewing Payment History
- All payments for a reservation are displayed in the Reservation Details dialog
- You can see the total amount paid vs. the room rate
- Outstanding balances are clearly indicated

---

## Troubleshooting

### Common Issues

**Problem:** I can't log in
**Solution:** See the [Owner's Recovery Guide](#appendix-a-owners-recovery-guide) below

**Problem:** I accidentally created duplicate guests
**Solution:** Use the [Merging Duplicate Guests](#merging-duplicate-guests) feature

**Problem:** I can't see my reservations
**Solution:** Check that you're viewing the correct date range on the calendar

**Problem:** The application seems slow
**Solution:** Try refreshing your browser page. If problems persist, check your internet connection.

---

## Appendix A: Owner's Recovery Guide

This guide explains the manual process for recovering access to your account if you forget your password and cannot reset it through the normal login screen.

**IMPORTANT:** This process requires you to log in to the Supabase dashboard, which is the backend and database for your application. Keep your Supabase login credentials stored in a secure location, separate from your application password.

### Step-by-Step Password Reset

1. **Navigate to Supabase:** Open your web browser and go to [https://supabase.com](https://supabase.com).

2. **Log In:** Log in to your Supabase account using the credentials you used when setting up the application.

3. **Select Your Project:** From the project list, click on your HOTMS project.

4. **Go to Authentication:** In the left-hand menu, find and click on the **Authentication** icon (it looks like a person).

5. **Find Your User:** You will see a list of users. Since you are the only user, you will see your email address in the list. Click on it.

6. **Reset Password:** In the user details view, you will see a "Reset password" button. Click it. Supabase will send a password reset link to your registered email address.

7. **Check Your Email:** Open your email, find the message from Supabase, and click the link to set a new password.

8. **Log In to HOTMS:** You can now use this new password to log in to your application.

**Screenshot Locations:** *(Screenshots should be added to the docs/images/ folder and referenced here)*

---

## Support

If you need additional help with your HOTMS application:

1. First, consult this user guide
2. Check the system status footer for any backup or version issues
3. For technical issues beyond password recovery, contact your system administrator

---

**Document Version:** 1.0  
**Last Updated:** Phase 3 Deployment  
**Application Version:** As displayed in footer