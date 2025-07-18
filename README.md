# Welcome to your Lovable project

## Project info

**URL**: https://lovable.dev/projects/b4bf9b63-90d3-47d0-b8bf-93d3a5819a3c

## How can I edit this code?

There are several ways of editing your application.

**Use Lovable**

Simply visit the [Lovable Project](https://lovable.dev/projects/b4bf9b63-90d3-47d0-b8bf-93d3a5819a3c) and start prompting.

Changes made via Lovable will be committed automatically to this repo.

**Use your preferred IDE**

If you want to work locally using your own IDE, you can clone this repo and push changes. Pushed changes will also be reflected in Lovable.

The only requirement is having Node.js & npm installed - [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating)

Follow these steps:

```sh
# Step 1: Clone the repository using the project's Git URL.
git clone <YOUR_GIT_URL>

# Step 2: Navigate to the project directory.
cd <YOUR_PROJECT_NAME>

# Step 3: Install the necessary dependencies.
npm i

# Step 4: Start the development server with auto-reloading and an instant preview.
npm run dev
```

**Edit a file directly in GitHub**

- Navigate to the desired file(s).
- Click the "Edit" button (pencil icon) at the top right of the file view.
- Make your changes and commit the changes.

**Use GitHub Codespaces**

- Navigate to the main page of your repository.
- Click on the "Code" button (green button) near the top right.
- Select the "Codespaces" tab.
- Click on "New codespace" to launch a new Codespace environment.
- Edit files directly within the Codespace and commit and push your changes once you're done.

## What technologies are used for this project?

This project is built with:

- Vite
- TypeScript
- React
- shadcn-ui
- Tailwind CSS

## How can I deploy this project?

Simply open [Lovable](https://lovable.dev/projects/b4bf9b63-90d3-47d0-b8bf-93d3a5819a3c) and click on Share -> Publish.

## Can I connect a custom domain to my Lovable project?

Yes, you can!

To connect a domain, navigate to Project > Settings > Domains and click Connect Domain.

Read more here: [Setting up a custom domain](https://docs.lovable.dev/tips-tricks/custom-domain#step-by-step-guide)


Public Notes:
1)
open questions
Embedding Strategy: Should we use OpenAI's embeddings or a self-hosted solution for better privacy?

Data Storage: How should we handle the temporary storage of embeddings and summaries before the 30-day deletion?

Real-time Features: Do you want real-time collaboration during the discovery session, or async approval workflows?

Google Drive Scope: What file types should we support initially? (Docs, Sheets, PDFs, etc.)

Matching Algorithm: Should the semantic matching be purely AI-driven or include user-defined keywords/topics?

2) paste as is
is all of this already in place: Phase 1: Core Infrastructure & Authentication (Week 1-2) Database Schema Setup: Create user profiles and authentication system Set up data source connections table (Google Drive, Notion, etc.) Create privacy settings and exclusion rules tables Implement user session management and temporary access tokens Authentication Flow: Add sign-up/login functionality with email verification Implement secure session handling with proper token management Create user onboarding flow with privacy preference setup Phase 2: Data Integration & Privacy Controls (Week 2-3) Google Drive Integration: Create OAuth2 flow for Google Drive access Build secure edge functions for reading user files Implement content filtering based on user exclusion rules Add file type detection and content extraction Privacy Boundaries: Create interface for users to set topic exclusions Implement content categorization (work, personal, emotional patterns) Build approval/rejection system for discoverable topics Add bulk approve/reject functionality (already in UI) Phase 3: AI Processing & Embeddings (Week 3-4) LLM Integration: Set up OpenAI API integration in edge functions Create content summarization and embedding generation Implement topic extraction and categorization Build semantic similarity comparison system Security & Privacy: Ensure no raw content is stored on servers Implement hashing for content IDs Create automatic data deletion (30-day summaries, 90-day backups) Add end-to-end encryption for temporary data Phase 4: Collaboration & Matching (Week 4-5) Discovery Engine: Implement semantic search using embeddings comparison Create topic clustering and overlap detection Build the approval workflow for sharing suggestions Add real-time collaboration features User Interface: Connect the existing dashboard preview to real data Implement the collaborative session management Add progress tracking and analytics Create the final sharing confirmation flow Phase 5: Trust & Safety Features (Week 5-6) Security Measures: Implement comprehensive audit logging Add data retention policy enforcement Create security monitoring and alerts Set up automated data purging systems Compliance & Documentation: Create privacy policy and terms of service Implement GDPR-compliant data handling Add security documentation and SOC 2 preparation Create user data export/deletion tool


