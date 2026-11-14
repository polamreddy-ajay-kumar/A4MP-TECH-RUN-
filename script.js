const form = document.getElementById("chatForm");
const promptBox = document.getElementById("prompt");
const messagesEl = document.getElementById("messages");
const sendBtn = document.getElementById("sendBtn");
const suggestions = document.getElementById("suggestions");

const history = [];

document.getElementById("year").textContent =
  new Date().getFullYear();

// Mobile navigation
document.getElementById("menuToggle").addEventListener("click", () => {
  document.querySelector(".nav-links").classList.toggle("open");
});

document.querySelectorAll(".nav-links a").forEach(link => {
  link.addEventListener("click", () => {
    document.querySelector(".nav-links").classList.remove("open");
  });
});

// Display chat messages safely
function addMessage(role, text) {
  const row = document.createElement("div");
  row.className = `message ${role}`;

  const avatar = document.createElement("div");
  avatar.className = "message-avatar";
  avatar.textContent = role === "assistant" ? "A" : "YOU";

  const bubble = document.createElement("div");
  bubble.className = "bubble";

  // Prevent HTML injection
  bubble.textContent = text;

  row.append(avatar, bubble);
  messagesEl.appendChild(row);

  messagesEl.scrollTop = messagesEl.scrollHeight;

  return bubble;
}

// Send message to A4MP AI backend
async function sendMessage(text) {
  const clean = text.trim();

  if (!clean || sendBtn.disabled) return;

  suggestions.hidden = true;

  addMessage("user", clean);

  history.push({
    role: "user",
    content: clean
  });

  promptBox.value = "";
  promptBox.style.height = "auto";

  sendBtn.disabled = true;

  const waiting = addMessage(
    "assistant",
    "Thinking..."
  );

  try {
    const response = await fetch("/api/chat", {
      method: "POST",

      headers: {
        "Content-Type": "application/json"
      },

      body: JSON.stringify({
        messages: history.slice(-12)
      })
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(
        data.detail || "Something went wrong."
      );
    }

    waiting.textContent = data.reply;

    history.push({
      role: "assistant",
      content: data.reply
    });

  } catch (error) {
    waiting.textContent =
      "Sorry — " + error.message;

  } finally {
    sendBtn.disabled = false;
    promptBox.focus();

    messagesEl.scrollTop =
      messagesEl.scrollHeight;
  }
}

// Send button
form.addEventListener("submit", event => {
  event.preventDefault();
  sendMessage(promptBox.value);
});

// Auto resize textarea
promptBox.addEventListener("input", () => {
  promptBox.style.height = "auto";

  promptBox.style.height =
    Math.min(promptBox.scrollHeight, 110) + "px";
});

// Enter to send, Shift + Enter for new line
promptBox.addEventListener("keydown", event => {
  if (event.key === "Enter" && !event.shiftKey) {
    event.preventDefault();
    form.requestSubmit();
  }
});

// Quick suggestion buttons
suggestions.querySelectorAll("button").forEach(button => {
  button.addEventListener("click", () => {
    sendMessage(button.textContent);
  });
});
  
