# 🔗 Link Saver - Chrome Extension

A powerful Chrome extension for saving and organizing links with folder management, built with **React 19**, **Vite**, and **Tailwind CSS**.

## ✨ Features

- **Save Links & Tabs** with custom names
- **Folder Organization** with visual selection and drag-and-drop
- **Rich Link Previews** with automatic **Favicons**
- **Refined UI** with intuitive Edit/Delete icons
- **Dark Theme** with neon effects and modern UI
- **Persistent Storage** using `chrome.storage.local` with auto-backup

## 🚀 Quick Installation

### Option 1: Install from Chrome Web Store (Coming Soon)

Once published, you'll be able to install directly from the Chrome Web Store.

### Option 2: Install Locally (Developer Mode)

1. **Build the Project**:
   You must build the project first to generate the extension files.

   ```bash
   npm install
   npm run build
   ```

   This creates a `dist` folder.

2. **Open Chrome Extensions**:
   - Go to `chrome://extensions/`
   - Enable **Developer mode** (top-right toggle)

3. **Load Extension**:
   - Click **Load unpacked**
   - Select the `dist` folder inside your project directory

### Option 3: Local UI Development (Mock Mode)

To work on the UI without reloading the extension constantly:

```bash
npm run dev
```

This runs the app in your browser using `localStorage` (Separate from extension data) to mock persistence. Perfect for styling and layout work.

## 📁 Project Structure

```text
link-saver-extension/
├── src/
│   ├── components/      # React Components (Header, FolderList, etc.)
│   ├── context/         # Context API (LeadsContext)
│   ├── hooks/           # Custom Hooks (useLeads)
│   ├── services/        # Chrome API & Storage logic
│   ├── utils/           # Helper functions
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

### Managing Links

- **Open Link**: Click the link name directly.
- **Edit Link**: Click the **Pencil Icon** to rename inline.
- **Delete Link**: Click the **Trash Icon**.

### Managing Folders

- **Create New Folder**: Enter name and click "Create Folder"
- **Select Folder**: Choose from dropdown to highlight and prioritize
- **Rename Folder**: Click on folder name to edit
- **Delete Folder**: Hover over folder and click the **Trash Icon**
- **Drag & Drop**: Reorder links within folders (Coming Soon)

## 🛠️ Technical Details

### Built With

- **React 19** - Modern UI library
- **Vite** - Fast build tool
- **Tailwind CSS** - Utility-first styling
- **Lucide React** - Icon library

### Browser APIs Used

- `chrome.tabs` - Access current tab information
- `chrome.storage.local` - Data persistence (survives extension updates)

### Storage

All data is stored **locally** on your device using `chrome.storage.local`. No data is sent to external servers.

## 🐛 Troubleshooting

### Extension won't load?

- Ensure you selected the `dist` folder, not the root folder.
- Run `npm run build` again to make sure the build is fresh.

### Changes not showing?

- If you edit the code, you must run `npm run build` again.
- For development, use `npm run dev` for fast feedback (UI only) or `npm run build -- --watch` for extension testing.

### Data lost after update?

- This should not happen with the current version (uses `chrome.storage.local`).
- If you're migrating from an older version, data will be automatically migrated on first load.

## 📄 Privacy

See [PRIVACY_POLICY.md](PRIVACY_POLICY.md) for details on data collection and permissions.

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📝 License

This project is open source and available under the MIT License.

## 🔗 Links

- [GitHub Repository](https://github.com/Andy-dev-hack/Link-saver-extension)
- [Report Issues](https://github.com/Andy-dev-hack/Link-saver-extension/issues)
