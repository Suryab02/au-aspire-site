document.addEventListener("DOMContentLoaded", function () {
  // ----- HERO SLIDER -----
  let currentSlide = 0;
  const slides = document.querySelectorAll(".bg-slide");
  function showSlide(index) {
    slides.forEach((slide, i) => slide.classList.toggle("active", i === index));
  }
  function nextSlide() {
    currentSlide = (currentSlide + 1) % slides.length;
    showSlide(currentSlide);
  }
  function prevSlide() {
    currentSlide = (currentSlide - 1 + slides.length) % slides.length;
    showSlide(currentSlide);
  }
  setInterval(nextSlide, 5000);
  window.nextSlide = nextSlide;
  window.prevSlide = prevSlide;

  // ----- HERO TYPEWRITER EFFECT -----
  function typewriter(element, text, speed = 70, cb) {
    let i = 0;
    element.textContent = "";
    element.style.opacity = "1";
    function type() {
      if (i < text.length) {
        element.textContent += text[i];
        i++;
        setTimeout(type, speed);
      } else {
        if (cb) cb();
        element.style.borderRight = "0";
      }
    }
    type();
  }

  // ----- NAVBAR TOGGLE -----
  const toggle = document.getElementById("menu-toggle");
  const navLinksContainer = document.getElementById("nav-links");
  toggle.addEventListener("click", () =>
    navLinksContainer.classList.toggle("show")
  );
  toggle.addEventListener("keydown", (e) => {
    if (e.key === "Enter" || e.key === " ") toggle.click();
  });

  // ----- LAZY LOAD IMAGES -----
  document
    .querySelectorAll("img")
    .forEach((img) => img.setAttribute("loading", "lazy"));

  // ----- MODAL LOGIC -----
  function closeModal() {
    document.getElementById("leadModal").style.display = "none";
    document.body.classList.remove("modal-open");
  }
  function openModal() {
    const modal = document.getElementById("leadModal");
    modal.style.display = "flex";
    modal.setAttribute("aria-modal", "true");
    modal.setAttribute("role", "dialog");
    modal.querySelector("input").focus();
    document.body.classList.add("modal-open");
    if (window.firebase && firebase.analytics) {
      firebase.analytics().logEvent("modal_opened", { source: "lead_popup" });
    }
  }
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") closeModal();
  });
  document.getElementById("leadModal").addEventListener("click", function (e) {
    if (e.target === this) closeModal();
  });
  document.querySelector(".close-btn").addEventListener("click", closeModal);

  // Show modal only on button click
  document.querySelector(".enquire-btn").addEventListener("click", () => {
    document.getElementById("formPurpose")?.setAttribute("value", "enquiry");
    openModal();
  });

  document.querySelectorAll(".price-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      document.getElementById("formPurpose")?.setAttribute("value", "enquiry");
      openModal();
    });
  });

  document.querySelector(".cta-visit-btn").addEventListener("click", () => {
    document.getElementById("formPurpose")?.setAttribute("value", "sitevist");
    openModal();
  });

  const brochureBtn = document.getElementById("downloadBrochureBtn");
  if (brochureBtn) {
    brochureBtn.addEventListener("click", () => {
      document.getElementById("formPurpose")?.setAttribute("value", "brochure");
      openModal();
    });
  }

  // ----- TOAST LOGIC -----
  const toast = document.createElement("div");
  toast.id = "form-toast";
  toast.style.cssText =
    "position:fixed;bottom:20px;left:50%;transform:translateX(-50%);background:#28a745;color:white;padding:12px 24px;border-radius:6px;font-weight:600;box-shadow:0 4px 12px rgba(0,0,0,0.2);display:none;z-index:1001;";
  document.body.appendChild(toast);
  function showToast(message) {
    toast.textContent = message;
    toast.style.display = "block";
    setTimeout(() => {
      toast.style.display = "none";
    }, 3000);
  }

  // ----- LEAD FORM LOGIC -----
  const modalForm = document.getElementById("modalLeadForm");
  modalForm.addEventListener("submit", function (e) {
    e.preventDefault();
    const name = modalForm
      .querySelector('input[placeholder="Name"]')
      ?.value.trim();
    const phone = modalForm
      .querySelector('input[placeholder="Mobile No"]')
      ?.value.trim();
    const email = modalForm
      .querySelector('input[placeholder="E-Mail Address"]')
      ?.value.trim();
    const purpose = document.getElementById("formPurpose")?.value || "modal";
    if (!name || !phone || !email) {
      showToast("Please fill out all fields.");
      return;
    }
    db.collection("leads")
      .add({
        name,
        phone,
        email,
        source: purpose,
        createdAt: firebase.firestore.FieldValue.serverTimestamp(),
      })
      .then(() => {
        showToast("Thank you! Your details have been submitted.");
        modalForm.reset();
        closeModal();
        if (window.analytics) {
          analytics.logEvent("lead_submitted", {
            source: purpose,
            method: "modal",
            form_location: "leadModal",
          });
        }
        if (purpose === "brochure") {
          window.open("brochures/brochure.pdf", "_blank");
        } else {
          window.location.href = "#hero";
        }
        if (purpose === "cost-sheet") {
          window.open("brochures/cost-sheet.pdf", "_blank");
        }
      })
      .catch((error) => {
        console.error("Error submitting form:", error);
        showToast("Something went wrong. Please try again later.");
      });
  });

  // ----- ABOUT SECTION COLLAPSE -----
  const toggleAbout = document.createElement("button");
  toggleAbout.className = "toggle-about-btn";
  toggleAbout.textContent = "Read More";
  Object.assign(toggleAbout.style, {
    margin: "20px auto",
    display: "block",
    background: "#b30000",
    color: "#fff",
    border: "none",
    padding: "12px 24px",
    borderRadius: "30px",
    fontWeight: "600",
    cursor: "pointer",
  });
  const aboutSection = document.querySelector("#about-project .container");
  const contentToToggle = aboutSection.querySelectorAll("p, h4, ul");
  contentToToggle.forEach((el, i) => {
    if (i !== 0) el.style.display = "none";
  });
  aboutSection.appendChild(toggleAbout);
  let isExpanded = false;
  toggleAbout.addEventListener("click", () => {
    isExpanded = !isExpanded;
    contentToToggle.forEach((el, i) => {
      if (i !== 0) el.style.display = isExpanded ? "block" : "none";
    });
    toggleAbout.textContent = isExpanded ? "Read Less" : "Read More";
  });

  // ----- STICKY CONTACT FORM -----
  const stickyForm = document.getElementById("stickyContactForm");
  if (stickyForm) {
    stickyForm.addEventListener("submit", function (e) {
      e.preventDefault();
      const name = stickyForm.name.value.trim();
      const email = stickyForm.email.value.trim();
      const phone = stickyForm.phone.value.trim();
      if (!name || !email || !phone) {
        showToast("Please fill out all fields.");
        return;
      }
      db.collection("leads")
        .add({
          name,
          email,
          phone,
          source: "sticky-form",
          createdAt: firebase.firestore.FieldValue.serverTimestamp(),
        })
        .then(() => {
          showToast("Thank you! We’ll get back to you shortly.");
          stickyForm.reset();
          if (window.analytics) {
            analytics.logEvent("lead_submitted", {
              source: "sticky-form",
              form_location: "sidebar",
            });
          }
        })
        .catch((err) => {
          console.error("Sticky Form Error:", err);
          showToast("Something went wrong. Please try again later.");
        });
    });
  }

  // ----- GALLERY LIGHTBOX -----
  const lightbox = document.getElementById("lightbox");
  const lightboxImg = lightbox.querySelector("img");
  document.querySelectorAll(".gallery-grid img").forEach((img) => {
    img.addEventListener("click", () => {
      lightbox.classList.add("active");
      lightboxImg.src = img.src;
      lightboxImg.alt = img.alt;
    });
  });
  lightbox.addEventListener("click", () => {
    lightbox.classList.remove("active");
    lightboxImg.src = "";
  });

  // ----- NAVBAR SCROLL EFFECT -----
  window.addEventListener("scroll", () => {
    const navbar = document.querySelector(".navbar");
    if (window.scrollY > 60) {
      navbar.classList.add("scrolled");
    } else {
      navbar.classList.remove("scrolled");
    }
  });

  // ----- WHATSAPP CTA -----
  document.querySelectorAll(".whatsapp-cta-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      if (window.analytics) {
        analytics.logEvent("whatsapp_lead_clicked", {
          location: "hero",
        });
      }
    });
  });

  // ----- BROCHURE, COST SHEET, SITE PLAN (ALL buttons) -----
  document.querySelectorAll(".attachment-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      document.getElementById("formPurpose")?.setAttribute("value", "download");
      openModal();
    });
  });

  document.querySelectorAll(".request-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      document
        .getElementById("formPurpose")
        ?.setAttribute("value", "site-plan");
      openModal();
    });
  });

  // ----- SCROLL-TRIGGERED ANIMATIONS -----
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("visible");
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.1 }
  );
  document
    .querySelectorAll(".scroll-animate")
    .forEach((el) => observer.observe(el));
});

const sections = document.querySelectorAll("section[id]");
const navLinks = document.querySelectorAll(".nav-links li a");

function debounce(fn, delay) {
  let timeout;
  return () => {
    clearTimeout(timeout);
    timeout = setTimeout(fn, delay);
  };
}

function handleScrollSpy() {
  let currentSectionId = "";
  sections.forEach((section) => {
    const sectionTop = section.offsetTop - 110;
    const sectionHeight = section.offsetHeight;
    if (
      window.pageYOffset >= sectionTop &&
      window.pageYOffset < sectionTop + sectionHeight
    ) {
      currentSectionId = section.getAttribute("id");
    }
  });
  navLinks.forEach((link) => {
    link.classList.toggle(
      "active",
      link.getAttribute("href") === `#${currentSectionId}`
    );
  });
}
function openModalFromVisit() {
  document.getElementById("formPurpose")?.setAttribute("value", "site-visit");
  openModal();
}

function triggerCostSheetDownload() {
  document.getElementById("formPurpose")?.setAttribute("value", "cost-sheet");
  openModal();
}

window.addEventListener("scroll", debounce(handleScrollSpy, 100));
