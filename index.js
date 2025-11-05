// === LINK SAVER EXTENSION MAIN SCRIPT ===

// DOM Elements
const inputEl = document.getElementById("input-el");
const inputBtn = document.getElementById("input-btn");
const tabBtn = document.getElementById("tab-btn");
const folderInputEl = document.getElementById("folder-input-el");
const addFolderBtn = document.getElementById("add-folder-btn");
const folderSelect = document.getElementById("folder-select");
const ulEl = document.getElementById("ul-el");
const syncBtn = document.getElementById("sync-btn");

let folders = JSON.parse(localStorage.getItem("folders")) || {};

// === Render Functions ===
function renderFolders() {
  ulEl.innerHTML = "";
  folderSelect.innerHTML = "";
  Object.keys(folders).forEach(folderName => {
    addFolderToDOM(folderName, folders[folderName]);
  });
}

function addFolderToDOM(folderName, links) {
  const folderDiv = document.createElement("div");
  folderDiv.classList.add("folder");

  const folderTitle = document.createElement("h3");
  folderTitle.classList.add("folder-title");

  const folderLabel = document.createElement("span");
  folderLabel.classList.add("folder-label");
  folderLabel.textContent = folderName;
  folderLabel.contentEditable = false;

  const deleteFolderBtn = document.createElement("button");
  deleteFolderBtn.classList.add("delete-folder-btn");
  deleteFolderBtn.textContent = "Delete";

  const toggleList = document.createElement("ul");
  toggleList.classList.add("folder-list");

  // render links
  links.forEach(link => addLinkToDOM(toggleList, folderName, link));

  folderTitle.appendChild(folderLabel);
  folderTitle.appendChild(deleteFolderBtn);
  folderDiv.appendChild(folderTitle);
  folderDiv.appendChild(toggleList);
  ulEl.appendChild(folderDiv);

  // Add to select dropdown
  const option = document.createElement("option");
  option.value = folderName;
  option.textContent = folderName;
  folderSelect.appendChild(option);

  // folder toggle
  folderTitle.addEventListener("click", e => {
    if (e.target === folderLabel) return; // don't collapse when editing
    toggleList.classList.toggle("collapsed");
  });

  // rename folder
  folderLabel.addEventListener("dblclick", () => {
    folderLabel.contentEditable = true;
    folderLabel.focus();
  });

  folderLabel.addEventListener("blur", () => {
    folderLabel.contentEditable = false;
    const newName = folderLabel.textContent.trim();
    if (newName && newName !== folderName) {
      folders[newName] = folders[folderName];
      delete folders[folderName];
      saveFolders();
      renderFolders();
    }
  });

  // delete folder
  deleteFolderBtn.addEventListener("click", () => {
    if (confirm(`Delete folder "${folderName}"?`)) {
      delete folders[folderName];
      saveFolders();
      renderFolders();
    }
  });
}

function addLinkToDOM(listEl, folderName, link) {
  const li = document.createElement("li");
  li.classList.add("lead-item");

  const nameSpan = document.createElement("span");
  nameSpan.classList.add("lead-name");
  nameSpan.textContent = link.name || "Unnamed";
  nameSpan.contentEditable = false;

  const a = document.createElement("a");
  a.href = link.url;
  a.target = "_blank";
  a.textContent = link.url;

  const moveBtn = document.createElement("button");
  moveBtn.textContent = "Move";

  const deleteBtn = document.createElement("button");
  deleteBtn.classList.add("delete-item-btn");
  deleteBtn.textContent = "X";

  // enable renaming
  nameSpan.addEventListener("dblclick", () => {
    nameSpan.contentEditable = true;
    nameSpan.focus();
  });

  nameSpan.addEventListener("blur", () => {
    nameSpan.contentEditable = false;
    link.name = nameSpan.textContent.trim() || "Unnamed";
    saveFolders();
  });

  moveBtn.addEventListener("click", () => {
    const otherFolders = Object.keys(folders).filter(f => f !== folderName);
    if (otherFolders.length === 0) {
      alert("No other folders to move to.");
      return;
    }
    const dest = prompt(`Move to which folder?\n${otherFolders.join(", ")}`);
    if (dest && folders[dest]) {
      folders[dest].push(link);
      folders[folderName] = folders[folderName].filter(l => l !== link);
      saveFolders();
      renderFolders();
    }
  });

  deleteBtn.addEventListener("click", () => {
    folders[folderName] = folders[folderName].filter(l => l !== link);
    saveFolders();
    renderFolders();
  });

  li.appendChild(nameSpan);
  li.appendChild(a);
  li.appendChild(moveBtn);
  li.appendChild(deleteBtn);
  listEl.appendChild(li);
}

// === Save / Load ===
function saveFolders() {
  localStorage.setItem("folders", JSON.stringify(folders));
}

// === Folder Creation ===
addFolderBtn.addEventListener("click", () => {
  const folderName = folderInputEl.value.trim();
  if (!folderName) return;
  if (!folders[folderName]) folders[folderName] = [];
  folderInputEl.value = "";
  saveFolders();
  renderFolders();
});

// === Link Saving ===
inputBtn.addEventListener("click", () => {
  const url = inputEl.value.trim();
  const folder = folderSelect.value;
  if (!url || !folder) return;
  folders[folder].push({ name: "Unnamed", url });
  inputEl.value = "";
  saveFolders();
  renderFolders();
});

tabBtn.addEventListener("click", () => {
  const folder = folderSelect.value;
  if (!folder) return;
  chrome.tabs.query({ active: true, currentWindow: true }, tabs => {
    const url = tabs[0].url;
    folders[folder].push({ name: tabs[0].title, url });
    saveFolders();
    renderFolders();
  });
});

// === SYNC BUTTON LOGIC ===
syncBtn.addEventListener("click", async () => {
  const choice = prompt(
    "Do you want to import or export folders + links?\nType 'import' or 'export'"
  );
  if (!choice) return;

  if (choice.toLowerCase() === "import") {
    const mode = prompt("Merge with existing or overwrite?\nType 'merge' or 'overwrite'");
    await importBookmarks(mode);
  } else if (choice.toLowerCase() === "export") {
    await exportBookmarks();
  }
});

// === IMPORT BOOKMARKS ===
async function importBookmarks(mode) {
  const tree = await chrome.bookmarks.getTree();
  const importedFolders = {};

  function traverse(nodes, parentFolder = null) {
    for (const node of nodes) {
      if (node.url) {
        const folderName = parentFolder || "Bookmarks";
        if (!importedFolders[folderName]) importedFolders[folderName] = [];
        importedFolders[folderName].push({
          name: node.title || "Unnamed",
          url: node.url
        });
      } else if (node.children && node.children.length > 0) {
        traverse(node.children, node.title || parentFolder);
      }
    }
  }

  traverse(tree);

  if (mode === "overwrite") {
    folders = importedFolders;
  } else {
    // merge mode
    for (const [name, links] of Object.entries(importedFolders)) {
      if (!folders[name]) folders[name] = [];
      const existingUrls = folders[name].map(l => l.url);
      const newLinks = links.filter(l => !existingUrls.includes(l.url));
      folders[name].push(...newLinks);
    }
  }

  saveFolders();
  renderFolders();
  alert("Bookmarks imported successfully!");
}

// === EXPORT BOOKMARKS ===
async function exportBookmarks() {
  const tree = await chrome.bookmarks.getTree();
  const bar = tree[0].children.find(n => n.title === "Bookmarks Bar") || tree[0];

  // Find or create the "Link Saver" folder
  let linkSaverFolder = bar.children.find(n => n.title === "Link Saver");
  if (!linkSaverFolder) {
    linkSaverFolder = await chrome.bookmarks.create({
      parentId: bar.id,
      title: "Link Saver"
    });
  }

  // Clear only inside "Link Saver"
  const existing = await chrome.bookmarks.getChildren(linkSaverFolder.id);
  for (const child of existing) {
    await chrome.bookmarks.removeTree(child.id);
  }

  // Create all folders/links
  for (const [folderName, links] of Object.entries(folders)) {
    const newFolder = await chrome.bookmarks.create({
      parentId: linkSaverFolder.id,
      title: folderName
    });
    for (const link of links) {
      await chrome.bookmarks.create({
        parentId: newFolder.id,
        title: link.name,
        url: link.url
      });
    }
  }

  alert("Export completed! Saved under Chrome's 'Link Saver' folder.");
}

// === Initialize ===
renderFolders();
