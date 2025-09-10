# **App Name**: StudyPulse

## Core Features:

- User Authentication: Secure user signup and login using Email/Password and Google Sign-In.
- Study Log: Allow authenticated users to log their study sessions by selecting a subject and entering study time.
- Real-time Data Display: Display study logs in real-time using Firestore's onSnapshot listener.
- Dashboard Summary: Display a summary of total study time per subject in a dashboard.
- Customizable Study Timer: Implement a customizable pomodoro timer with user-defined work and break intervals. Can use default times.
- Session Notes: Allow users to take notes during study sessions. Notes are automatically associated with the study log.
- AI-Powered Study Plan Generation: Use AI to generate a personalized study plan based on user's goals and available time; provides a study plan tool that guides students

## Style Guidelines:

- Primary color: Soft blue (#90CAF9) for a calm, focused atmosphere.
- Background color: Light gray (#FAFAFA) for clean and distraction-free interface.
- Accent color: Muted orange (#FFB74D) for actionable elements and highlights.
- Body and headline font: 'PT Sans', a sans-serif with a modern yet slightly warm feel, is used throughout the application.
- Use consistent, minimalist icons to represent different subjects and actions.
- Responsive layout adapting to both mobile and desktop screens using Tailwind CSS grid system.
- Subtle transitions and animations for a smooth user experience.