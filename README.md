# MedBridge - Virtual Medical Shadowing Platform

MedBridge is a web application that connects medical students with doctors for virtual shadowing experiences. The platform facilitates session booking, virtual meetings, and certificate generation for completed shadowing hours.

## Features

- **User Authentication**: Secure login and registration for both students and doctors
- **Role-based Access**: Different dashboards and features for students and doctors
- **Session Management**: Book, approve, and manage virtual shadowing sessions
- **Availability Management**: Doctors can set their available time slots
- **Certificate Generation**: Automatic generation of shadowing certificates
- **Progress Tracking**: Track completed hours and sessions
- **Reports & Analytics**: Detailed statistics for doctors

## Tech Stack

- **Frontend**: Next.js 14 with TypeScript
- **Styling**: Tailwind CSS
- **Authentication**: Firebase Authentication
- **Database**: Cloud Firestore
- **PDF Generation**: jsPDF
- **Deployment**: Vercel (recommended)

## Prerequisites

- Node.js 18.x or later
- npm or yarn
- Firebase account
- Git

## Environment Variables

Create a `.env.local` file in the root directory with the following variables:

```env
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_auth_domain
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_storage_bucket
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
```

## Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/medbridge.git
   cd medbridge
   ```

2. Install dependencies:
   ```bash
   npm install
   # or
   yarn install
   ```

3. Run the development server:
   ```bash
   npm run dev
   # or
   yarn dev
   ```

4. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Firebase Setup

1. Create a new Firebase project
2. Enable Authentication with Email/Password
3. Create a Cloud Firestore database
4. Deploy the security rules from `firestore.rules`
5. Add your Firebase configuration to `.env.local`

## Deployment

The easiest way to deploy MedBridge is using Vercel:

1. Push your code to GitHub
2. Import your repository to Vercel
3. Add your environment variables
4. Deploy

## Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Open a pull request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Support

For support, email support@medbridge.com or open an issue on GitHub. 