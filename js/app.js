/**
 * Main Application Logic for Asna V A's Portfolio
 * Manages navigation, project filtering, modal views, contact form, and interactions.
 */

document.addEventListener("DOMContentLoaded", () => {
  initNavbar();
  initProjectFilters();
  initCaseStudyModal();
  initResumeModal();
  initContactForm();
});

/* ==========================================================================
   Navigation Bar & Scrollspy
   ========================================================================== */
function initNavbar() {
  const header = document.querySelector(".site-header");
  const mobileToggle = document.querySelector(".mobile-toggle");
  const navMenu = document.querySelector(".nav-menu");
  const navLinks = document.querySelectorAll(".nav-link");
  const sections = document.querySelectorAll("section[id]");

  // Scroll header styling
  window.addEventListener("scroll", () => {
    if (window.scrollY > 40) {
      header.classList.add("scrolled");
    } else {
      header.classList.remove("scrolled");
    }

    // ScrollSpy active link detection
    let currentSection = "";
    sections.forEach((section) => {
      const sectionTop = section.offsetTop - 120;
      const sectionHeight = section.offsetHeight;
      if (window.scrollY >= sectionTop && window.scrollY < sectionTop + sectionHeight) {
        currentSection = section.getAttribute("id");
      }
    });

    navLinks.forEach((link) => {
      link.classList.remove("active");
      if (link.getAttribute("href") === `#${currentSection}`) {
        link.classList.add("active");
      }
    });
  });

  // Mobile navigation menu toggle
  if (mobileToggle && navMenu) {
    mobileToggle.addEventListener("click", () => {
      navMenu.classList.toggle("is-open");
      const isOpen = navMenu.classList.contains("is-open");
      mobileToggle.innerHTML = isOpen ? "✕" : "☰";
    });

    // Close mobile nav when link is clicked
    navLinks.forEach((link) => {
      link.addEventListener("click", () => {
        navMenu.classList.remove("is-open");
        mobileToggle.innerHTML = "☰";
      });
    });
  }
}

/* ==========================================================================
   Project Category Filters
   ========================================================================== */
function initProjectFilters() {
  const filterBtns = document.querySelectorAll(".filter-btn");
  const projectCards = document.querySelectorAll(".project-card");

  filterBtns.forEach((btn) => {
    btn.addEventListener("click", () => {
      filterBtns.forEach((b) => b.classList.remove("active"));
      btn.classList.add("active");

      const filter = btn.getAttribute("data-filter");

      projectCards.forEach((card) => {
        const categories = card.getAttribute("data-categories").split(",").map(c => c.trim());
        if (filter === "all" || categories.includes(filter)) {
          card.style.display = "flex";
        } else {
          card.style.display = "none";
        }
      });
    });
  });
}

/* ==========================================================================
   Case Study Modal Engine (10 Sections)
   ========================================================================== */
function initCaseStudyModal() {
  const modalOverlay = document.getElementById("caseStudyModal");
  const modalBody = document.getElementById("modalContentBody");
  const modalTitle = document.getElementById("modalProjectTitle");
  const modalNum = document.getElementById("modalProjectNum");
  const modalGithubLink = document.getElementById("modalGithubLink");
  const closeBtn = document.getElementById("modalCloseBtn");
  const openBtns = document.querySelectorAll("[data-case-study]");

  if (!modalOverlay || !modalBody) return;

  function openModal(projectId) {
    const data = caseStudiesData[projectId];
    if (!data) return;

    modalTitle.textContent = data.title;
    modalNum.textContent = `Case Study ${data.number} • ${data.techSummary}`;
    modalGithubLink.href = data.sections.githubUrl;

    // Render the complete 10-point case study structure
    modalBody.innerHTML = `
      <!-- 1. Business Problem -->
      <div class="case-study-section">
        <h4 class="case-section-heading"><span>01</span> Business Problem</h4>
        <p class="case-section-content">${data.sections.problem}</p>
      </div>

      <!-- 2. Dataset -->
      <div class="case-study-section">
        <h4 class="case-section-heading"><span>02</span> Dataset</h4>
        <p class="case-section-content">${data.sections.dataset}</p>
      </div>

      <!-- 3. Data Cleaning -->
      <div class="case-study-section">
        <h4 class="case-section-heading"><span>03</span> Data Cleaning & Validation</h4>
        <div class="case-section-content">${formatListContent(data.sections.dataCleaning)}</div>
      </div>

      <!-- 4. Analysis -->
      <div class="case-study-section">
        <h4 class="case-section-heading"><span>04</span> Analytical Methodology</h4>
        <div class="case-section-content">${formatListContent(data.sections.analysis)}</div>
      </div>

      <!-- 5. SQL / Python Technical Implementation -->
      <div class="case-study-section">
        <h4 class="case-section-heading"><span>05</span> SQL / Python Code Implementation</h4>
        <div class="code-block-container">
          <div class="code-header">
            <span>${data.sections.codeSnippet.title}</span>
            <button class="btn btn-sm btn-outline copy-code-btn" onclick="copyCodeSnippet(this)">Copy Code</button>
          </div>
          <pre class="code-content"><code>${escapeHtml(data.sections.codeSnippet.code)}</code></pre>
        </div>
      </div>

      <!-- 6. Dashboard & Reporting -->
      <div class="case-study-section">
        <h4 class="case-section-heading"><span>06</span> Dashboard & Reporting Structure</h4>
        <div class="case-section-content">${formatListContent(data.sections.dashboard)}</div>
      </div>

      <!-- 7. Key Findings -->
      <div class="case-study-section">
        <h4 class="case-section-heading"><span>07</span> Key Findings</h4>
        <div class="case-section-content">${formatListContent(data.sections.keyFindings)}</div>
      </div>

      <!-- 8. Business Recommendations -->
      <div class="case-study-section">
        <h4 class="case-section-heading"><span>08</span> Business Recommendations</h4>
        <div class="case-section-content">${formatListContent(data.sections.recommendations)}</div>
      </div>

      <!-- 9. Technologies -->
      <div class="case-study-section">
        <h4 class="case-section-heading"><span>09</span> Technologies & Frameworks</h4>
        <div class="project-tech-tags" style="margin-top: 8px;">
          ${data.sections.technologies.map(tech => `<span class="tech-tag">${tech}</span>`).join('')}
        </div>
      </div>

      <!-- 10. Verified Repository -->
      <div class="case-study-section">
        <h4 class="case-section-heading"><span>10</span> Verified Repository & Source Code</h4>
        <p class="case-section-content">
          Repository link: <a href="${data.sections.githubUrl}" target="_blank" rel="noopener noreferrer" style="color: var(--accent-cyan); text-decoration: underline; font-family: var(--font-mono);">${data.sections.githubUrl}</a>
        </p>
      </div>
    `;

    modalOverlay.classList.add("is-active");
    document.body.style.overflow = "hidden";
  }

  function closeModal() {
    modalOverlay.classList.remove("is-active");
    document.body.style.overflow = "";
  }

  openBtns.forEach((btn) => {
    btn.addEventListener("click", (e) => {
      e.preventDefault();
      const projectId = btn.getAttribute("data-case-study");
      openModal(projectId);
    });
  });

  if (closeBtn) {
    closeBtn.addEventListener("click", closeModal);
  }

  modalOverlay.addEventListener("click", (e) => {
    if (e.target === modalOverlay) {
      closeModal();
    }
  });

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && modalOverlay.classList.contains("is-active")) {
      closeModal();
    }
  });
}

// Helpers for modal rendering
function formatListContent(text) {
  if (!text) return "";
  const lines = text.split("\n").filter(l => l.trim().length > 0);
  if (lines.length > 1 && lines.some(l => l.startsWith("•") || l.startsWith("-"))) {
    return `<ul>${lines.map(line => `<li>${line.replace(/^[•\-]\s*/, "")}</li>`).join("")}</ul>`;
  }
  return `<p>${text}</p>`;
}

function escapeHtml(unsafe) {
  return unsafe
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

window.copyCodeSnippet = function(button) {
  const code = button.closest(".code-block-container").querySelector("code").textContent;
  navigator.clipboard.writeText(code).then(() => {
    const originalText = button.textContent;
    button.textContent = "Copied!";
    button.style.borderColor = "var(--accent-emerald)";
    button.style.color = "var(--accent-emerald)";
    setTimeout(() => {
      button.textContent = originalText;
      button.style.borderColor = "";
      button.style.color = "";
    }, 2000);
  });
};

/* ==========================================================================
   Resume Modal Quick View
   ========================================================================== */
function initResumeModal() {
  const resumeModal = document.getElementById("resumeModal");
  const openBtns = document.querySelectorAll("[data-open-resume]");
  const closeBtn = document.getElementById("resumeModalCloseBtn");

  if (!resumeModal) return;

  function openResume() {
    resumeModal.classList.add("is-active");
    document.body.style.overflow = "hidden";
  }

  function closeResume() {
    resumeModal.classList.remove("is-active");
    document.body.style.overflow = "";
  }

  openBtns.forEach((btn) => {
    btn.addEventListener("click", (e) => {
      e.preventDefault();
      openResume();
    });
  });

  if (closeBtn) {
    closeBtn.addEventListener("click", closeResume);
  }

  resumeModal.addEventListener("click", (e) => {
    if (e.target === resumeModal) closeResume();
  });
}

/* ==========================================================================
   Contact Form Submission Handling
   ========================================================================== */
function initContactForm() {
  const form = document.getElementById("contactForm");
  const successMsg = document.getElementById("contactSuccessMsg");

  if (!form) return;

  form.addEventListener("submit", (e) => {
    e.preventDefault();

    const name = document.getElementById("contactName").value.trim();
    const email = document.getElementById("contactEmail").value.trim();
    const message = document.getElementById("contactMessage").value.trim();

    if (!name || !email || !message) {
      alert("Please complete all fields before sending.");
      return;
    }

    // Show professional confirmation
    successMsg.style.display = "block";
    form.reset();

    setTimeout(() => {
      successMsg.style.display = "none";
    }, 8000);
  });
}
