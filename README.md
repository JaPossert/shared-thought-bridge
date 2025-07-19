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


## Development Progress

### ✅ COMPLETED
**Phase 1: Core Infrastructure & Authentication**
- ✅ Database schema (profiles, privacy_settings, data_sources, content_summaries, collaboration_sessions)
- ✅ Authentication system (assumed in place)
- ✅ Google Drive OAuth2 integration  
- ✅ Logseq file upload processing
- ✅ Basic AI content summarization & topic extraction

**Phase 2: Privacy Controls (JUST COMPLETED)**
- ✅ Privacy settings interface with content sharing preferences
- ✅ Topic exclusion management system
- ✅ File pattern exclusion rules
- ✅ Data retention controls
- ✅ Topic approval/rejection system with bulk operations
- ✅ Content categorization framework

### 🚧 NEXT UP (say "continue" to proceed)
**Phase 3: AI Processing & Embeddings Enhancement**
- [ ] Add OpenAI embeddings generation to content processing
- [ ] Implement semantic similarity comparison system
- [ ] Add content hashing for privacy
- [ ] Create automatic data deletion based on retention settings
- [ ] Build embedding-based topic clustering

**Phase 4: Collaboration & Matching Engine**
- [ ] Semantic search using embeddings comparison
- [ ] Topic overlap detection between users
- [ ] Collaboration opportunity discovery
- [ ] Real-time collaboration session management
- [ ] Progress tracking and analytics

**Phase 5: Trust & Safety**
- [ ] Comprehensive audit logging
- [ ] Automated data purging systems
- [ ] Security monitoring
- [ ] GDPR compliance tools

### 💭 OPEN QUESTIONS
1. Embedding Strategy: OpenAI embeddings vs self-hosted for privacy?
2. Real-time vs async collaboration workflows?
3. File type scope for Google Drive (Docs, Sheets, PDFs)?
4. Matching algorithm: Pure AI vs user-defined keywords?


