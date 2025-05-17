# QuizMaster

QuizMaster is a modern, interactive quiz platform designed to help students revise and master their subjects through customizable question banks, instant feedback, and a user-friendly interface. Built with [Next.js](https://nextjs.org), it leverages local storage for offline-first editing and supports rich question formatting.

## Features

- **Question Banks**: Organize questions into named banks for different subjects or topics.
- **Rich Question Editor**: Create and edit questions with formatted text, multiple choices, tags, categories, difficulty levels, and notes.
- **Drag-and-Drop Sorting**: Easily reorder questions within a bank.
- **Import/Export**: Import questions or entire banks from JSON files, and export your data for backup or sharing.
- **Tag Management**: Assign and manage tags for easy filtering and organization.
- **Responsive UI**: Works seamlessly on desktop and mobile devices.
- **Offline Support**: All data is stored locally in your browser using IndexedDB (Dexie.js), so you can work without an internet connection.
- **Instant Feedback**: Get immediate feedback on your actions with toast notifications.

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) (v22 or newer recommended)
- [npm](https://www.npmjs.com/)

### Installation

1. Clone the repository:

   ```bash
   git clone https://github.com/manhbi18112005/QuizMaster.git
   cd QuizMaster
   ```

2. Install dependencies:

   ```bash
   npm install
   ```

### Running the Development Server

Start the local development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser to use QuizMaster.

### Building for Production

To build and start the app in production mode:

```bash
npm run build
npm start
```

## Usage

- **Create a Question Bank**: Click "Create New Bank" on the home page, provide a name and description.
- **Add Questions**: Inside a bank, use the toolbar to add, import, export, or clear questions.
- **Edit Questions**: Select a question to edit its details, choices, answers, tags, and notes.
- **Reorder Questions**: Drag and drop questions to change their order.
- **Import/Export**: Use the toolbar to import questions from a JSON file or export your current bank.

## Technologies Used

- [Next.js](https://nextjs.org/) (App Router)
- [React](https://react.dev/)
- [Dexie.js](https://dexie.org/) (IndexedDB wrapper)
- [Tiptap](https://tiptap.dev/) (Rich text editor)
- [Tailwind CSS](https://tailwindcss.com/) (Styling)
- [Radix UI](https://www.radix-ui.com/) (Accessible UI primitives)
- [Sonner](https://sonner.emilkowal.ski/) (Toast notifications)

## Project Structure

- `/app` - Next.js app directory (pages, layouts, routing)
- `/components` - UI and feature components
- `/helpers` - Utility and handler functions
- `/lib` - Database and core logic
- `/types` - TypeScript types and interfaces

## Data Storage

All data is stored locally in your browser using IndexedDB. No data is sent to any server. You can export/import your data as JSON files for backup or sharing.

## Contributing

Contributions are welcome! Please open issues or pull requests for bug fixes, improvements, or new features.

## License

GNU GENERAL PUBLIC LICENSE

---

*QuizMaster is an open-source project aimed at making student revision more effective and enjoyable.*
