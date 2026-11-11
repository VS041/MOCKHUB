"use strict";

// Limits (change here if needed)
var MAX_CHARS = 30000;
var MAX_FILE_BYTES = 10 * 1024 * 1024; // 10 MB

var appName = document.getElementById("appName");
var fsFile = document.getElementById("fsFile");
var fsText = document.getElementById("fsText");
var count = document.getElementById("count");
var msg = document.getElementById("msg");
var checkBtn = document.getElementById("checkBtn");
var clearBtn = document.getElementById("clearBtn");

// Always use textContent (never innerHTML) so FS text can never run as code.
function showMsg(text, isError) {
  msg.textContent = text;
  msg.className = isError ? "msg error" : "msg";
}

function refresh() {
  var len = fsText.value.length;
  var over = len > MAX_CHARS;
  count.textContent = len.toLocaleString("en-US") + " / " + MAX_CHARS.toLocaleString("en-US") + " characters";
  count.className = over ? "hint error" : "hint";
  if (over) {
    showMsg("FS is too long. Please shorten it to 30,000 characters.", true);
  } else if (msg.className === "msg error" && msg.textContent.indexOf("too long") !== -1) {
    showMsg("", false);
  }
  checkBtn.disabled = over || len === 0 || appName.value.trim() === "";
}

fsFile.addEventListener("change", function () {
  var file = fsFile.files && fsFile.files[0];
  if (!file) { return; }

  if (!/\.docx$/i.test(file.name)) {
    showMsg("Only .docx files are supported. For other formats, paste the text.", true);
    fsFile.value = "";
    return;
  }
  if (file.size > MAX_FILE_BYTES) {
    showMsg("File is larger than 10 MB. Please paste the text instead.", true);
    fsFile.value = "";
    return;
  }

  showMsg("Reading file...", false);
  var reader = new FileReader();
  reader.onerror = function () {
    showMsg("Could not read the file.", true);
  };
  reader.onload = function () {
    // Text only: images and screenshots are dropped here.
    window.mammoth.extractRawText({ arrayBuffer: reader.result })
      .then(function (result) {
        var text = (result.value || "").replace(/\n{3,}/g, "\n\n").trim();
        if (!text) {
          showMsg("No text found in this file.", true);
          return;
        }
        fsText.value = text;
        showMsg("File loaded. Images were ignored. Please review the text below.", false);
        refresh();
      })
      .catch(function () {
        showMsg("This file could not be read as .docx.", true);
      });
  };
  reader.readAsArrayBuffer(file);
});

fsText.addEventListener("input", refresh);
appName.addEventListener("input", refresh);

clearBtn.addEventListener("click", function () {
  fsText.value = "";
  fsFile.value = "";
  showMsg("", false);
  refresh();
});

checkBtn.addEventListener("click", function () {
  // The gap check (backend) is added in the next step.
  showMsg("Input is ready. The gap check will be connected in the next step.", false);
});

refresh();
