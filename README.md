🔗 Link Saver - Chrome Extension
A powerful Chrome extension for saving and organizing links with folder management and Chrome bookmark synchronization.

✨ Features
Save Links & Tabs with custom names

Folder Organization with visual selection

Chrome Bookmark Sync - two-way synchronization

Dark Theme with neon effects

Edit & Delete links and folders

🚀 Quick Installation
Create a new folder for the extension

Add all the files below to the folder

Open Chrome → chrome://extensions/

Enable Developer mode (top-right toggle)

Click "Load unpacked" and select your folder

Pin the extension to your toolbar

📁 Project Structure
link-saver-extension/
├── popup.html
├── manifest.json
├── assets/
│   ├── css/
│   │   └── index.css
│   └── js/
│       ├── main.js
│       ├── constants/
│       │   ├── dom-elements.js
│       │   └── config.js
│       ├── utils/
│       │   └── helpers.js
│       ├── services/
│       │   ├── storage.js
│       │   ├── folders.js
│       │   ├── leads.js
│       │   └── sync.js
│       └── ui/
│           ├── renderer.js
│           └── events.js
└── README.md

🎯 Usage Guide
Saving Links
Click the extension icon in your toolbar

Enter a URL in the input field or use "Save Tab" for current page

Select a destination folder from the dropdown

Customize the link name when prompted

Click "Save Link" or press Enter

Managing Folders
Create New Folder: Enter name and click "Create Folder"

Select Folder: Choose from dropdown to highlight and prioritize

Rename Folder: Click on folder name and edit directly

Delete Folder: Hover over folder and click "Delete Folder"

Synchronization
Click "Sync with Chrome" to synchronize with Chrome bookmarks

Data merges automatically with Chrome bookmarks taking priority

Creates "Link Saver Sync" folder in Chrome bookmarks

View sync status in real-time feedback messages

🛠️ Technical Details
Built With
Vanilla JavaScript (ES6 Modules)

Chrome Extensions API (Manifest V3)

CSS3 with modern animations

LocalStorage for data persistence

Browser APIs Used
chrome.tabs - Access current tab information

chrome.bookmarks - Synchronization with Chrome bookmarks

localStorage - Data persistence

🐛 Troubleshooting
Common Issues
Extension won't load:

Check manifest.json syntax

Ensure popup.html exists in root directory

Sync not working:

Confirm "bookmarks" permission in manifest

Check Chrome bookmark permissions

Data not saving:

Verify storage permission

Check localStorage quota

Debugging
Open chrome://extensions/

Find Link Saver and click "Details"

Enable "Developer mode"

Click "Inspect views" for console logs

🔮 Roadmap
Export/Import functionality

Search & Filter across folders

Tags System for better organization