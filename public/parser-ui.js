// public/parser-ui.js
// Handles:
// 1) showing/hiding upload panel when "Upload Level" is clicked
// 2) uploading a .txt file to /api/parse-level
// 3) launching the game with the parsed level

document.addEventListener("DOMContentLoaded", () => {
  const uploadMenuBtn = document.getElementById("uploadMenuBtn");
  const uploadPanel = document.getElementById("uploadPanel");

  const uploadBtn = document.getElementById("uploadBtn");
  const fileInput = document.getElementById("levelFile");

  const status = document.getElementById("status");
  const output = document.getElementById("output");

  const gameContainer = document.getElementById("game-container");
  const mainHeader = document.querySelector("header.main");
  const mainNav = document.querySelector("nav.main-menu");

  function showUploadPanel() {
    uploadPanel.classList.add("visible");
    mainNav.style.display = "none";
    status.textContent = "";
    output.textContent = "";
  }

  function hideUploadPanel() {
    uploadPanel.classList.remove("visible");
    mainNav.style.display = "";
    status.textContent = "";
    output.textContent = "";
  }

  // Toggle visibility of the upload UI
  uploadMenuBtn.addEventListener("click", showUploadPanel);

  // Back button closes the upload panel
  document.getElementById("uploadBackBtn").addEventListener("click", hideUploadPanel);

  // Hide upload panel on ESC
  document.addEventListener("keydown", (e) => {
    if (uploadPanel.classList.contains("visible") && (e.key === "Escape" || e.key === "Esc")) {
      hideUploadPanel();
    }
  });
  // Upload + parse + play
  uploadBtn.addEventListener("click", async () => {
    output.textContent = "";
    status.textContent = "";

    if (!fileInput.files || fileInput.files.length === 0) {
      status.textContent = "Please choose a .txt file first.";
      return;
    }

    const file = fileInput.files[0];
    if (!file.name.toLowerCase().endsWith(".txt")) {
      status.textContent = "That file is not a .txt file.";
      return;
    }

    const formData = new FormData();
    // Must match: upload.single('level') in server.js
    formData.append("level", file);

    try {
      status.textContent = "Uploading + parsing...";

      const res = await fetch("/api/parse-level", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();

      if (!res.ok) {
        status.textContent = "Parse failed ❌";
        output.textContent = JSON.stringify(data, null, 2);
        return;
      }

      status.textContent = "Parsed successfully ✅ Launching game...";

      // Set level data and show game
      currentLevelData = data;
      uploadPanel.classList.remove("visible");
      mainHeader.style.display = "none";
      gameContainer.style.display = "flex";
      document.body.style.overflow = "hidden";

      // Restart game scene with uploaded level data
      game.scene.stop("default");
      game.scene.start("default", { levelData: data });

    } catch (err) {
      status.textContent = "Request failed ❌";
      output.textContent = String(err);
    }
  });
});

