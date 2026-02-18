// public/parser-ui.js
// Handles:
// 1) showing/hiding upload panel when "Upload Level" is clicked
// 2) uploading a .txt file to /api/parse-level
// 3) printing parsed JSON to the page

document.addEventListener("DOMContentLoaded", () => {
  const uploadMenuBtn = document.getElementById("uploadMenuBtn");
  const uploadPanel = document.getElementById("uploadPanel");

  const uploadBtn = document.getElementById("uploadBtn");
  const fileInput = document.getElementById("levelFile");

  const status = document.getElementById("status");
  const output = document.getElementById("output");

  // Toggle visibility of the upload UI
  uploadMenuBtn.addEventListener("click", () => {
    uploadPanel.classList.toggle("visible");
    status.textContent = "";
    output.textContent = "";
  });

  // Upload + parse
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

      status.textContent = "Parsed successfully ✅";
      output.textContent = JSON.stringify(data, null, 2);
    } catch (err) {
      status.textContent = "Request failed ❌";
      output.textContent = String(err);
    }
  });
});

