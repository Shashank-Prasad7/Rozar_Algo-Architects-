// ============================================================
// app.js — Core application state, auth, language, routing
// Author: Rozar Team | Built for Convolve 4.0 / AI Ignite 2026
// ============================================================

window.RozarApp = (function () {
  // ─── State ────────────────────────────────────────────────
  let state = {
    lang: "en",
    theme: "light",
    user: null,
    page: "home",
    chatOpen: false,
    chatHistory: [],
    appliedJobs: new Set(),
    chatFlowIndex: 0,
    activeAgent: "receptionist",
  };

  // ─── Init ─────────────────────────────────────────────────
  function init() {
    loadFromStorage();
    applyTheme(state.theme);
    applyLanguage(state.lang);
    render();
    bindGlobalEvents();
  }

  // ─── Storage ──────────────────────────────────────────────
  function loadFromStorage() {
    try {
      const stored = JSON.parse(localStorage.getItem("rozar_state") || "{}");
      if (stored.lang) state.lang = stored.lang;
      if (stored.theme) state.theme = stored.theme;
      if (stored.user) state.user = stored.user;
      if (stored.chatHistory) state.chatHistory = stored.chatHistory;
      if (stored.appliedJobs) state.appliedJobs = new Set(stored.appliedJobs);
    } catch (e) {}
  }

  function saveToStorage() {
    try {
      localStorage.setItem(
        "rozar_state",
        JSON.stringify({
          lang: state.lang,
          theme: state.theme,
          user: state.user,
          chatHistory: state.chatHistory.slice(-50),
          appliedJobs: [...state.appliedJobs],
        })
      );
    } catch (e) {}
  }

  // ─── Language ─────────────────────────────────────────────
  function applyLanguage(lang) {
    state.lang = lang;
    const t = ROZAR_DATA.translations[lang];
    document.documentElement.lang = lang;
    document.body.style.fontFamily = t.font;
    document.querySelectorAll("[data-lang-key]").forEach((el) => {
      const keys = el.getAttribute("data-lang-key").split(".");
      let val = t;
      keys.forEach((k) => (val = val?.[k]));
      if (val && typeof val === "string") {
        if (el.tagName === "INPUT" || el.tagName === "TEXTAREA") {
          el.placeholder = val;
        } else {
          el.textContent = val;
        }
      }
    });
    saveToStorage();
  }

  // ─── Theme ────────────────────────────────────────────────
  function applyTheme(theme) {
    state.theme = theme;
    if (theme === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
    saveToStorage();
  }

  function toggleTheme() {
    applyTheme(state.theme === "light" ? "dark" : "light");
    renderThemeIcon();
  }

  // ─── Auth ─────────────────────────────────────────────────
  function login(email, password) {
    if (email === "demo@rozar.in" && password === "rozar123") {
      state.user = {
        name: "Ravi Kumar",
        email,
        avatar: "RK",
        joinedDate: new Date().toLocaleDateString("en-IN"),
        jobsApplied: 3,
        schemesEligible: 2,
        trainingScheduled: 1,
      };
      saveToStorage();
      navigate("dashboard");
      return true;
    }
    return false;
  }

  function logout() {
    state.user = null;
    saveToStorage();
    navigate("home");
  }

  // ─── Navigation ───────────────────────────────────────────
  function navigate(page) {
    state.page = page;
    document.querySelectorAll(".page-section").forEach((s) => s.classList.add("hidden"));
    const target = document.getElementById(`page-${page}`);
    if (target) target.classList.remove("hidden");
    updateNavActive(page);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function updateNavActive(page) {
    document.querySelectorAll("[data-nav]").forEach((el) => {
      el.classList.remove("nav-active");
      if (el.dataset.nav === page) el.classList.add("nav-active");
    });
  }

  // ─── Chatbot ──────────────────────────────────────────────
  function openChat() {
    state.chatOpen = true;
    const modal = document.getElementById("chat-modal");
    if (modal) {
      modal.classList.remove("hidden");
      modal.classList.add("flex");
    }
    if (state.chatHistory.length === 0) {
      const greeting = ROZAR_DATA.translations[state.lang].chatbot.greeting;
      addBotMessage(greeting, "receptionist");
    }
    renderChatHistory();
  }

  function closeChat() {
    state.chatOpen = false;
    const modal = document.getElementById("chat-modal");
    if (modal) {
      modal.classList.add("hidden");
      modal.classList.remove("flex");
    }
  }

  function addUserMessage(text) {
    state.chatHistory.push({ role: "user", text, ts: Date.now() });
    renderChatHistory();
    saveToStorage();
  }

  function addBotMessage(text, agent) {
    state.chatHistory.push({ role: "bot", text, agent: agent || "receptionist", ts: Date.now() });
    renderChatHistory();
    saveToStorage();
    speakText(text);
  }

  function sendChatMessage(text) {
    if (!text.trim()) return;
    addUserMessage(text);

    const flows = ROZAR_DATA.chatFlows[state.lang];
    const userFlows = flows.filter((f) => f.role === "user");
    const botFlows = flows.filter((f) => f.role === "bot");

    // Show thinking indicator
    showThinking();

    setTimeout(() => {
      hideThinking();
      const flowIdx = state.chatFlowIndex;
      if (flowIdx < botFlows.length) {
        const botMsg = botFlows[flowIdx];
        addBotMessage(botMsg.text, botMsg.agent);
        state.activeAgent = botMsg.agent;
        updateAgentUI(botMsg.agent);
        if (flowIdx + 1 < botFlows.length) {
          const nextBot = botFlows[flowIdx + 1];
          setTimeout(() => {
            addBotMessage(nextBot.text, nextBot.agent);
            state.activeAgent = nextBot.agent;
            updateAgentUI(nextBot.agent);
            state.chatFlowIndex++;
          }, 1200);
        }
      } else {
        addBotMessage(
          ROZAR_DATA.translations[state.lang].chatbot.greeting,
          "receptionist"
        );
        state.chatFlowIndex = -1;
      }
      state.chatFlowIndex++;
    }, 900);
  }

  function showThinking() {
    const chatMessages = document.getElementById("chat-messages");
    if (!chatMessages) return;
    const div = document.createElement("div");
    div.id = "thinking-bubble";
    div.className = "flex gap-2 items-start mb-3";
    div.innerHTML = `
      <div class="w-8 h-8 rounded-full bg-orange-500 flex items-center justify-center text-white text-xs font-bold shrink-0">R</div>
      <div class="bg-gray-100 dark:bg-gray-700 rounded-2xl px-4 py-3 flex gap-1 items-center">
        <span class="w-2 h-2 bg-orange-400 rounded-full animate-bounce" style="animation-delay:0ms"></span>
        <span class="w-2 h-2 bg-orange-400 rounded-full animate-bounce" style="animation-delay:150ms"></span>
        <span class="w-2 h-2 bg-orange-400 rounded-full animate-bounce" style="animation-delay:300ms"></span>
      </div>`;
    chatMessages.appendChild(div);
    chatMessages.scrollTop = chatMessages.scrollHeight;
  }

  function hideThinking() {
    const bubble = document.getElementById("thinking-bubble");
    if (bubble) bubble.remove();
  }

  function renderChatHistory() {
    const container = document.getElementById("chat-messages");
    if (!container) return;
    container.innerHTML = "";
    state.chatHistory.forEach((msg) => {
      const div = document.createElement("div");
      if (msg.role === "user") {
        div.className = "flex justify-end mb-3";
        div.innerHTML = `<div class="bg-orange-500 text-white rounded-2xl rounded-br-sm px-4 py-2.5 max-w-xs text-sm leading-relaxed">${msg.text}</div>`;
      } else {
        const agentColors = {
          receptionist: "#FF6700",
          jobMatcher: "#003087",
          docAssistant: "#16A34A",
          schemeNavigator: "#7C3AED",
        };
        const color = agentColors[msg.agent] || "#FF6700";
        const agentLabel = ROZAR_DATA.translations[state.lang].chatbot.agents[msg.agent] || msg.agent;
        div.className = "flex gap-2 items-start mb-3";
        div.innerHTML = `
          <div class="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0" style="background:${color}">R</div>
          <div class="flex flex-col max-w-xs">
            <span class="text-xs font-semibold mb-1" style="color:${color}">${agentLabel}</span>
            <div class="bg-white dark:bg-gray-700 border border-gray-100 dark:border-gray-600 rounded-2xl rounded-bl-sm px-4 py-2.5 text-sm text-gray-800 dark:text-gray-100 leading-relaxed shadow-sm">${msg.text}</div>
          </div>`;
      }
      container.appendChild(div);
    });
    container.scrollTop = container.scrollHeight;
  }

  function updateAgentUI(agent) {
    document.querySelectorAll("[data-agent]").forEach((el) => {
      el.classList.remove("agent-active");
      if (el.dataset.agent === agent) el.classList.add("agent-active");
    });
  }

  // ─── TTS ──────────────────────────────────────────────────
  function speakText(text) {
    if (!window.speechSynthesis) return;
    const utt = new SpeechSynthesisUtterance(text);
    const langMap = { en: "en-IN", hi: "hi-IN", ta: "ta-IN" };
    utt.lang = langMap[state.lang] || "en-IN";
    utt.rate = 0.9;
    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(utt);
  }

  // ─── STT ──────────────────────────────────────────────────
  function startVoiceInput() {
    if (!window.SpeechRecognition && !window.webkitSpeechRecognition) {
      alert("Speech recognition not supported in this browser.");
      return;
    }
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    const rec = new SR();
    const langMap = { en: "en-IN", hi: "hi-IN", ta: "ta-IN" };
    rec.lang = langMap[state.lang] || "en-IN";
    rec.interimResults = false;
    rec.onresult = (e) => {
      const transcript = e.results[0][0].transcript;
      const input = document.getElementById("chat-input");
      if (input) {
        input.value = transcript;
        sendChatMessage(transcript);
        input.value = "";
      }
    };
    rec.onerror = () => {};
    rec.start();
    const micBtn = document.getElementById("mic-btn");
    if (micBtn) {
      micBtn.classList.add("recording");
      setTimeout(() => micBtn.classList.remove("recording"), 3000);
    }
  }

  // ─── Job Apply ────────────────────────────────────────────
  function applyJob(jobId) {
    state.appliedJobs.add(jobId);
    if (state.user) state.user.jobsApplied = state.appliedJobs.size;
    saveToStorage();
    const btn = document.getElementById(`apply-btn-${jobId}`);
    if (btn) {
      const t = ROZAR_DATA.translations[state.lang].jobs;
      btn.textContent = t.applied;
      btn.disabled = true;
      btn.classList.add("opacity-70");
    }
    openChat();
    setTimeout(() => {
      const flow = ROZAR_DATA.chatFlows[state.lang];
      const applyMsg = flow.find((f) => f.role === "user" && (f.text.includes("apply") || f.text.includes("अप्लाई") || f.text.includes("விண்ணப்பிக்கவும்")));
      sendChatMessage(applyMsg ? applyMsg.text : "Apply for this job");
    }, 500);
  }

  // ─── Render theme icon ────────────────────────────────────
  function renderThemeIcon() {
    const btn = document.getElementById("theme-toggle");
    if (btn) btn.innerHTML = state.theme === "dark" ? "☀️" : "🌙";
  }

  // ─── Global Events ────────────────────────────────────────
  function bindGlobalEvents() {
    // Language selector
    const langSel = document.getElementById("lang-selector");
    if (langSel) {
      langSel.value = state.lang;
      langSel.addEventListener("change", (e) => {
        applyLanguage(e.target.value);
        state.chatFlowIndex = 0;
      });
    }

    // Theme toggle
    const themeBtn = document.getElementById("theme-toggle");
    if (themeBtn) {
      renderThemeIcon();
      themeBtn.addEventListener("click", toggleTheme);
    }

    // Login button
    document.getElementById("login-btn")?.addEventListener("click", () => {
      document.getElementById("login-modal")?.classList.remove("hidden");
    });

    // Close login modal
    document.getElementById("close-login-modal")?.addEventListener("click", () => {
      document.getElementById("login-modal")?.classList.add("hidden");
    });

    // Login form
    document.getElementById("login-form")?.addEventListener("submit", (e) => {
      e.preventDefault();
      const email = document.getElementById("login-email").value;
      const pw = document.getElementById("login-password").value;
      const ok = login(email, pw);
      if (!ok) {
        document.getElementById("login-error").classList.remove("hidden");
      } else {
        document.getElementById("login-modal")?.classList.add("hidden");
      }
    });

    // Demo login
    document.getElementById("demo-login-btn")?.addEventListener("click", () => {
      document.getElementById("login-email").value = "demo@rozar.in";
      document.getElementById("login-password").value = "rozar123";
      login("demo@rozar.in", "rozar123");
      document.getElementById("login-modal")?.classList.add("hidden");
    });

    // Logout
    document.getElementById("logout-btn")?.addEventListener("click", logout);

    // Chatbot open
    document.getElementById("chat-fab")?.addEventListener("click", openChat);
    document.getElementById("hero-call-btn")?.addEventListener("click", openChat);

    // Close chat
    document.getElementById("close-chat")?.addEventListener("click", closeChat);

    // Chat send
    document.getElementById("chat-send-btn")?.addEventListener("click", () => {
      const input = document.getElementById("chat-input");
      if (input?.value.trim()) {
        sendChatMessage(input.value.trim());
        input.value = "";
      }
    });

    document.getElementById("chat-input")?.addEventListener("keydown", (e) => {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        const input = document.getElementById("chat-input");
        if (input?.value.trim()) {
          sendChatMessage(input.value.trim());
          input.value = "";
        }
      }
    });

    // Mic button
    document.getElementById("mic-btn")?.addEventListener("click", startVoiceInput);

    // Nav links
    document.querySelectorAll("[data-nav]").forEach((el) => {
      el.addEventListener("click", (e) => {
        e.preventDefault();
        const page = el.dataset.nav;
        if ((page === "dashboard") && !state.user) {
          document.getElementById("login-modal")?.classList.remove("hidden");
        } else {
          navigate(page);
        }
      });
    });

    // Doc upload simulation
    const dropzone = document.getElementById("doc-dropzone");
    const fileInput = document.getElementById("doc-file-input");
    if (dropzone) {
      dropzone.addEventListener("click", () => fileInput?.click());
      dropzone.addEventListener("dragover", (e) => { e.preventDefault(); dropzone.classList.add("border-orange-500"); });
      dropzone.addEventListener("dragleave", () => dropzone.classList.remove("border-orange-500"));
      dropzone.addEventListener("drop", (e) => { e.preventDefault(); simulateOCR(); });
    }
    fileInput?.addEventListener("change", () => simulateOCR());

    // Scheme modal close
    document.getElementById("close-scheme-modal")?.addEventListener("click", () => {
      document.getElementById("scheme-modal")?.classList.add("hidden");
    });
  }

  // ─── OCR Simulation ───────────────────────────────────────
  function simulateOCR() {
    const status = document.getElementById("ocr-status");
    const result = document.getElementById("ocr-result");
    if (!status) return;
    status.classList.remove("hidden");
    result?.classList.add("hidden");
    setTimeout(() => {
      status.classList.add("hidden");
      result?.classList.remove("hidden");
    }, 2000);
  }

  // ─── Scheme Modal ─────────────────────────────────────────
  function openSchemeModal(schemeId) {
    const scheme = ROZAR_DATA.schemes.find((s) => s.id === schemeId);
    if (!scheme) return;
    const t = ROZAR_DATA.translations[state.lang];
    const modal = document.getElementById("scheme-modal");
    const titleEl = document.getElementById("scheme-modal-title");
    const stepsEl = document.getElementById("scheme-modal-steps");
    const eligEl = document.getElementById("scheme-modal-eligibility");
    const benefitEl = document.getElementById("scheme-modal-benefit");

    if (titleEl) titleEl.textContent = scheme.fullName[state.lang];
    if (benefitEl) benefitEl.textContent = scheme.benefit[state.lang];
    if (eligEl) eligEl.textContent = scheme.eligibility[state.lang];
    if (stepsEl) {
      const steps = scheme.steps[state.lang];
      stepsEl.innerHTML = steps.map((step, i) => `
        <div class="flex gap-3 items-start py-2">
          <div class="w-7 h-7 rounded-full bg-orange-500 text-white text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">${i + 1}</div>
          <p class="text-gray-700 dark:text-gray-200 text-sm leading-relaxed">${step}</p>
        </div>`).join("");
    }
    modal?.classList.remove("hidden");
  }

  // ─── Public API ───────────────────────────────────────────
  return {
    init,
    navigate,
    login,
    logout,
    openChat,
    closeChat,
    sendChatMessage,
    applyJob,
    openSchemeModal,
    simulateOCR,
    startVoiceInput,
    getState: () => state,
  };
})();
