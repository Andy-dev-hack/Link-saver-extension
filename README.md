# 🔗 Link Saver - Chrome Extension (React Version)

A powerful Chrome extension for saving and organizing links with folder management, now built with **React** and **Vite**.

## ✨ Features

- **Save Links & Tabs** with custom names
- **Folder Organization** with visual selection
- **Dark Theme** with neon effects
- **Edit & Delete** links and folders
- **React-based** for better performance and maintainability

## 🚀 Quick Installation

1.  **Build the Project**:
    You must build the project first to generate the extension files.

    ```bash
    npm install
    npm run build
    ```

    This creates a `dist` folder.

2.  **Open Chrome Extensions**:

    - Go to `chrome://extensions/`
    - Enable **Developer mode** (top-right toggle)

3.  **Load Extension**:
    - Click **Load unpacked**
    - Select the `dist` folder inside your project directory

## 📁 Project Structure

```
link-saver-extension/
├── src/
│   ├── components/      # React Components (Header, FolderList, etc.)
│   ├── context/         # Context API (LeadsContext)
│   ├── hooks/           # Custom Hooks (useLeads)
│   ├── services/        # Chrome API & Storage logic
│   ├── App.jsx          # Main Application Component
│   └── main.jsx         # Entry Point
├── public/              # Static assets (manifest.json, icons)
├── dist/                # Build output (Load this in Chrome)
└── vite.config.js       # Vite Configuration
```

## 🎯 Usage Guide

### Saving Links

- Click the extension icon in your toolbar
- Enter a URL in the input field or use "Save Tab" for current page
- Select a destination folder from the dropdown
- Customize the link name when prompted
- Click "Save Link" or press Enter

### Managing Folders

- **Create New Folder**: Enter name and click "Create Folder"
- **Select Folder**: Choose from dropdown to highlight and prioritize
- **Rename Folder**: Click on folder name and edit directly
- **Delete Folder**: Hover over folder and click "Delete Folder"

## 🛠️ Technical Details

### Built With

- **React 18**
- **Vite**
- **Context API** for state management
- **CSS Modules** & Modern CSS3

### Browser APIs Used

- `chrome.tabs` - Access current tab information
- `localStorage` - Data persistence

## 🐛 Troubleshooting

### Extension won't load?

- Ensure you selected the `dist` folder, not the root folder.
- Run `npm run build` again to make sure the build is fresh.

### Changes not showing?

- If you edit the code, you must run `npm run build` again.
- For development, use `npm run build -- --watch` to auto-rebuild on changes.
