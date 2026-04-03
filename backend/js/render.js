// ============================================================
// render.js — Dynamic content rendering: jobs, schemes, etc.
// Author: Rozar Team | Built for Convolve 4.0 / AI Ignite 2026
// ============================================================

window.RozarRender = (function () {

  // ─── Render jobs grid ─────────────────────────────────────
  function renderJobs() {
    const container = document.getElementById("jobs-grid");
    if (!container) return;
    const lang = RozarApp.getState().lang;
    const t = ROZAR_DATA.translations[lang].jobs;

    container.innerHTML = ROZAR_DATA.jobs
      .map((job) => {
        const appliedJobs = RozarApp.getState().appliedJobs;
        const isApplied = appliedJobs.has(job.id);
        return `
        <div class="job-card relative" style="font-family: ${ROZAR_DATA.translations[lang].font}">
          <div class="match-badge">${t.matchScore} ${job.match}%</div>
          <div class="flex items-center gap-3 mb-4">
            <div class="w-12 h-12 rounded-xl flex items-center justify-center text-2xl shadow-sm" style="background: ${job.color}22;">${job.logo}</div>
            <div>
              <div class="font-black text-sm" style="color: var(--text);">${job.company}</div>
              <div class="font-bold text-base" style="color: var(--text);">${job.title[lang]}</div>
            </div>
          </div>
          <div class="space-y-2 mb-4">
            <div class="flex items-center gap-2 text-sm">
              <span>💰</span>
              <span style="color: var(--muted);">${t.salary}:</span>
              <span class="font-bold text-green-600">${job.salary[lang]}</span>
            </div>
            <div class="flex items-center gap-2 text-sm">
              <span>📍</span>
              <span style="color: var(--muted);">${t.location}:</span>
              <span class="font-semibold" style="color: var(--text);">${job.location[lang]}</span>
            </div>
            <div class="flex items-center gap-2 text-sm">
              <span>📋</span>
              <span style="color: var(--muted);">${t.requirements}:</span>
              <span class="font-semibold" style="color: var(--text);">${job.req[lang]}</span>
            </div>
          </div>
          <div class="flex flex-wrap gap-2 mb-4">
            ${job.tags.map((tag) => `<span class="text-xs px-2 py-1 rounded-full font-semibold" style="background: rgba(255,103,0,0.1); color: var(--saffron);">${tag}</span>`).join("")}
          </div>
          <div class="flex gap-2">
            <button
              id="apply-btn-${job.id}"
              onclick="RozarApp.applyJob(${job.id})"
              class="${isApplied ? "opacity-70 cursor-not-allowed" : ""} btn-saffron flex-1 justify-center !py-2 !text-sm"
              ${isApplied ? "disabled" : ""}
            >
              ${isApplied ? t.applied : `⚡ ${t.autoApply}`}
            </button>
          </div>
        </div>`;
      })
      .join("");
  }

  // ─── Render schemes grid ──────────────────────────────────
  function renderSchemes() {
    const container = document.getElementById("schemes-grid");
    if (!container) return;
    const lang = RozarApp.getState().lang;
    const t = ROZAR_DATA.translations[lang].schemes;

    container.innerHTML = ROZAR_DATA.schemes
      .map((scheme) => `
        <div class="scheme-card" onclick="RozarApp.openSchemeModal('${scheme.id}')" style="font-family: ${ROZAR_DATA.translations[lang].font}">
          <div class="flex items-start justify-between mb-3">
            <div class="text-4xl">${scheme.emoji}</div>
            <span class="text-xs px-2 py-1 rounded-full font-bold" style="background: rgba(22,163,74,0.1); color: #16A34A;">${t.eligible}</span>
          </div>
          <div class="font-black text-lg mb-1" style="color: var(--text);">${scheme.name}</div>
          <div class="text-sm mb-3" style="color: var(--muted);">${scheme.desc[lang]}</div>
          <div class="text-sm font-bold mb-4" style="color: var(--saffron);">💰 ${scheme.benefit[lang]}</div>
          <div class="flex gap-2">
            <button class="btn-saffron flex-1 justify-center !py-2 !text-xs">${t.viewSteps}</button>
          </div>
        </div>`)
      .join("");
  }

  // ─── Render tutorials ─────────────────────────────────────
  function renderTutorials() {
    const container = document.getElementById("tutorials-grid");
    if (!container) return;
    const lang = RozarApp.getState().lang;

    container.innerHTML = ROZAR_DATA.tutorials
      .map((tut) => `
        <div class="rounded-2xl overflow-hidden" style="background: var(--card); border: 1px solid var(--border); font-family: ${ROZAR_DATA.translations[lang].font}">
          <div class="flex items-center gap-3 p-5 pb-4" style="background: ${tut.color}12; border-bottom: 1px solid ${tut.color}30;">
            <div class="text-3xl">${tut.icon}</div>
            <div class="font-black text-lg" style="color: ${tut.color};">${tut.title[lang]}</div>
          </div>
          <div class="p-5">
            <ol class="space-y-3">
              ${tut.steps[lang]
                .map(
                  (step, i) => `
                <li class="flex gap-3 items-start">
                  <span class="w-6 h-6 rounded-full text-white text-xs font-bold flex items-center justify-center shrink-0 mt-0.5" style="background: ${tut.color};">${i + 1}</span>
                  <span class="text-sm leading-relaxed" style="color: var(--text);">${step}</span>
                </li>`
                )
                .join("")}
            </ol>
          </div>
        </div>`)
      .join("");
  }

  // ─── Render dashboard ─────────────────────────────────────
  function renderDashboard() {
    const container = document.getElementById("dashboard-content");
    if (!container) return;
    const state = RozarApp.getState();
    const lang = state.lang;
    const t = ROZAR_DATA.translations[lang].dashboard;
    const user = state.user;
    if (!user) {
      container.innerHTML = `<div class="text-center py-20"><p class="text-lg" style="color: var(--muted);">Please login to view your dashboard.</p></div>`;
      return;
    }

    const activities = [
      { icon: "✅", text: lang === "hi" ? "Swiggy में आवेदन किया" : lang === "ta" ? "Swiggy இல் விண்ணப்பித்தது" : "Applied to Swiggy Delivery", time: "2 hours ago" },
      { icon: "📄", text: lang === "hi" ? "आधार कार्ड अपलोड किया" : lang === "ta" ? "ஆதார் அட்டை பதிவேற்றியது" : "Aadhaar card uploaded & verified", time: "3 hours ago" },
      { icon: "🎓", text: lang === "hi" ? "PMKVY के लिए पंजीकृत" : lang === "ta" ? "PMKVY க்கு பதிவு செய்தது" : "Registered for PMKVY training", time: "Yesterday" },
    ];

    container.innerHTML = `
      <!-- Welcome -->
      <div class="glass-card rounded-2xl p-6 mb-8" style="background: linear-gradient(135deg, #FF6700 0%, #003087 100%);">
        <div class="flex items-center justify-between flex-wrap gap-4">
          <div>
            <p class="text-orange-200 text-sm mb-1" style="font-family: ${ROZAR_DATA.translations[lang].font};">${t.welcome},</p>
            <h1 class="text-3xl font-black text-white">${user.name} 👋</h1>
            <p class="text-blue-200 text-sm mt-1">${user.email}</p>
          </div>
          <button onclick="RozarApp.logout()" id="logout-btn" class="px-4 py-2 rounded-xl bg-white/20 text-white font-semibold text-sm hover:bg-white/30 transition-colors" data-lang-key="nav.logout">${ROZAR_DATA.translations[lang].nav.logout}</button>
        </div>
      </div>

      <!-- Stats -->
      <div class="grid grid-cols-3 gap-4 mb-8">
        <div class="stat-card">
          <div class="text-3xl font-black mb-1" style="color: var(--saffron);">${user.jobsApplied}</div>
          <div class="text-xs font-semibold" style="color: var(--muted); font-family: ${ROZAR_DATA.translations[lang].font};">${t.jobsApplied}</div>
        </div>
        <div class="stat-card">
          <div class="text-3xl font-black mb-1" style="color: var(--navy);">${user.schemesEligible}</div>
          <div class="text-xs font-semibold" style="color: var(--muted); font-family: ${ROZAR_DATA.translations[lang].font};">${t.schemesEligible}</div>
        </div>
        <div class="stat-card">
          <div class="text-3xl font-black mb-1 text-green-600">${user.trainingScheduled}</div>
          <div class="text-xs font-semibold" style="color: var(--muted); font-family: ${ROZAR_DATA.translations[lang].font};">${t.trainingScheduled}</div>
        </div>
      </div>

      <div class="grid md:grid-cols-2 gap-6">
        <!-- Quick actions -->
        <div class="rounded-2xl p-6" style="background: var(--card); border: 1px solid var(--border);">
          <h3 class="font-bold mb-4" style="color: var(--text); font-family: ${ROZAR_DATA.translations[lang].font};">${t.quickActions}</h3>
          <div class="grid grid-cols-2 gap-3">
            <button onclick="RozarApp.navigate('jobs')" class="p-4 rounded-xl text-center transition-all hover:scale-105" style="background: rgba(255,103,0,0.1);">
              <div class="text-2xl mb-1">💼</div>
              <div class="text-xs font-bold" style="color: var(--saffron); font-family: ${ROZAR_DATA.translations[lang].font};">${t.findJobs}</div>
            </button>
            <button onclick="RozarApp.navigate('schemes')" class="p-4 rounded-xl text-center transition-all hover:scale-105" style="background: rgba(0,48,135,0.1);">
              <div class="text-2xl mb-1">🏛️</div>
              <div class="text-xs font-bold" style="color: var(--navy); font-family: ${ROZAR_DATA.translations[lang].font};">${t.checkSchemes}</div>
            </button>
            <button onclick="RozarApp.navigate('docs')" class="p-4 rounded-xl text-center transition-all hover:scale-105" style="background: rgba(22,163,74,0.1);">
              <div class="text-2xl mb-1">📄</div>
              <div class="text-xs font-bold text-green-600" style="font-family: ${ROZAR_DATA.translations[lang].font};">${t.uploadDocs}</div>
            </button>
            <button onclick="RozarApp.navigate('tutorials')" class="p-4 rounded-xl text-center transition-all hover:scale-105" style="background: rgba(124,58,237,0.1);">
              <div class="text-2xl mb-1">🎓</div>
              <div class="text-xs font-bold text-purple-600" style="font-family: ${ROZAR_DATA.translations[lang].font};">${t.startTraining}</div>
            </button>
          </div>
        </div>

        <!-- Recent activity -->
        <div class="rounded-2xl p-6" style="background: var(--card); border: 1px solid var(--border);">
          <h3 class="font-bold mb-4" style="color: var(--text); font-family: ${ROZAR_DATA.translations[lang].font};">${t.recentActivity}</h3>
          <div class="space-y-3">
            ${activities.map((a) => `
              <div class="flex items-start gap-3 py-3 border-b last:border-0" style="border-color: var(--border);">
                <span class="text-xl">${a.icon}</span>
                <div>
                  <p class="text-sm font-semibold" style="color: var(--text);">${a.text}</p>
                  <p class="text-xs mt-0.5" style="color: var(--muted);">${a.time}</p>
                </div>
              </div>`).join("")}
          </div>
        </div>
      </div>`;
  }

  // ─── Auth area update ─────────────────────────────────────
  function renderAuthArea() {
    const area = document.getElementById("auth-area");
    if (!area) return;
    const state = RozarApp.getState();
    const lang = state.lang;
    const t = ROZAR_DATA.translations[lang].nav;

    if (state.user) {
      area.innerHTML = `
        <div class="flex items-center gap-2">
          <div class="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold" style="background: var(--saffron);">${state.user.avatar}</div>
          <button onclick="RozarApp.navigate('dashboard')" class="text-sm font-semibold hidden md:block" style="color: var(--text);">${state.user.name}</button>
        </div>`;
    } else {
      area.innerHTML = `<button id="login-btn" class="btn-saffron !py-2 !px-4 !text-sm" data-lang-key="nav.login">${t.login}</button>`;
      document.getElementById("login-btn")?.addEventListener("click", () => {
        document.getElementById("login-modal")?.classList.remove("hidden");
      });
    }
  }

  // ─── Render all ───────────────────────────────────────────
  function renderAll() {
    renderJobs();
    renderSchemes();
    renderTutorials();
    renderDashboard();
    renderAuthArea();
  }

  // ─── Re-render on lang change (observe) ───────────────────
  const origApplyLang = window.RozarApp
    ? RozarApp.getState
    : null;

  // Patch: re-render content when language changes
  const langSel = document.getElementById("lang-selector");
  if (langSel) {
    langSel.addEventListener("change", () => {
      setTimeout(renderAll, 50); // after state updates
    });
  }

  return { renderAll, renderJobs, renderSchemes, renderTutorials, renderDashboard, renderAuthArea };
})();
