const whatsappNumber = "5547999999999"; // TODO: trocar pelo numero real.
const defaultMessage =
  "Olá, vim pela página da Dra. Emanueli Lima e gostaria de saber mais sobre os tratamentos e agendamento.";

const body = document.body;
const header = document.querySelector("[data-header]");
const nav = document.querySelector("[data-nav]");
const navToggle = document.querySelector("[data-nav-toggle]");
const floatingCta = document.querySelector("[data-floating-cta]");
const leadForm = document.querySelector("[data-lead-form]");
const feedback = document.querySelector("[data-form-feedback]");
const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

function digitsOnly(value) {
  return value.replace(/\D/g, "");
}

function buildWhatsAppMessage(topic = "", leadData = null) {
  const lines = [defaultMessage];

  if (topic) {
    lines.push(`Interesse principal: ${topic}.`);
  }

  if (leadData) {
    lines.push(`Nome: ${leadData.name}.`);
    lines.push(`WhatsApp informado: ${leadData.phone}.`);
    if (leadData.interest) {
      lines.push(`Tratamento de interesse: ${leadData.interest}.`);
    }
  }

  return lines.join("\n");
}

function buildWhatsAppLink(topic = "", leadData = null) {
  const message = buildWhatsAppMessage(topic, leadData);
  return `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(message)}`;
}

function applyWhatsAppLinks() {
  const links = document.querySelectorAll("[data-whatsapp-link]");

  links.forEach((link) => {
    const topic = link.dataset.whatsappTopic || "";
    link.href = buildWhatsAppLink(topic);
    link.target = "_blank";
    link.rel = "noopener noreferrer";
  });
}

function setHeaderState() {
  if (!header) {
    return;
  }

  header.classList.toggle("is-scrolled", window.scrollY > 12);
}

function toggleMenu(forceState) {
  if (!navToggle || !nav) {
    return;
  }

  const shouldOpen =
    typeof forceState === "boolean"
      ? forceState
      : navToggle.getAttribute("aria-expanded") !== "true";

  navToggle.setAttribute("aria-expanded", String(shouldOpen));
  navToggle.setAttribute("aria-label", shouldOpen ? "Fechar menu" : "Abrir menu");
  nav.setAttribute("aria-hidden", String(!shouldOpen));
  body.classList.toggle("menu-open", shouldOpen);
}

function setupNavigation() {
  if (!navToggle) {
    return;
  }

  if (window.innerWidth <= 960) {
    nav.setAttribute("aria-hidden", "true");
  }

  navToggle.addEventListener("click", () => toggleMenu());

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
      toggleMenu(false);
    }
  });

  const internalLinks = document.querySelectorAll('a[href^="#"]');

  internalLinks.forEach((link) => {
    link.addEventListener("click", (event) => {
      const targetId = link.getAttribute("href");

      if (!targetId || targetId === "#") {
        return;
      }

      const target = document.querySelector(targetId);

      if (!target) {
        return;
      }

      event.preventDefault();
      toggleMenu(false);
      target.scrollIntoView({
        behavior: prefersReducedMotion ? "auto" : "smooth",
        block: "start",
      });
    });
  });
}

function setupRevealAnimations() {
  const items = document.querySelectorAll(".reveal");

  if (!items.length || prefersReducedMotion) {
    items.forEach((item) => item.classList.add("is-visible"));
    return;
  }

  const observer = new IntersectionObserver(
    (entries, currentObserver) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) {
          return;
        }

        entry.target.classList.add("is-visible");
        currentObserver.unobserve(entry.target);
      });
    },
    {
      threshold: 0.18,
      rootMargin: "0px 0px -30px 0px",
    }
  );

  items.forEach((item) => observer.observe(item));
}

function setFloatingCtaState() {
  if (!floatingCta || window.innerWidth > 640) {
    return;
  }

  floatingCta.classList.toggle("is-visible", window.scrollY > 520);
}

function setFieldState(field, isValid) {
  field.classList.toggle("is-invalid", !isValid);
  field.setAttribute("aria-invalid", String(!isValid));
}

function showFormFeedback(message, type) {
  if (!feedback) {
    return;
  }

  feedback.textContent = message;
  feedback.classList.remove("is-error", "is-success");

  if (type) {
    feedback.classList.add(type === "error" ? "is-error" : "is-success");
  }
}

function setupLeadForm() {
  if (!leadForm) {
    return;
  }

  leadForm.addEventListener("submit", (event) => {
    event.preventDefault();

    const nameField = leadForm.elements.namedItem("name");
    const phoneField = leadForm.elements.namedItem("phone");
    const interestField = leadForm.elements.namedItem("interest");

    const name = nameField.value.trim();
    const phone = phoneField.value.trim();
    const phoneDigits = digitsOnly(phone);
    const interest = interestField.value.trim();

    const nameValid = name.length >= 3;
    const phoneValid = phoneDigits.length >= 10;

    setFieldState(nameField, nameValid);
    setFieldState(phoneField, phoneValid);

    if (!nameValid || !phoneValid) {
      showFormFeedback(
        "Preencha nome e WhatsApp com dados válidos para iniciar o atendimento.",
        "error"
      );
      return;
    }

    showFormFeedback("Abrindo o WhatsApp com sua mensagem preenchida.", "success");

    const leadData = {
      name,
      phone,
      interest,
    };

    window.open(buildWhatsAppLink(interest, leadData), "_blank", "noopener");
    leadForm.reset();
  });
}

applyWhatsAppLinks();
setHeaderState();
setFloatingCtaState();
setupNavigation();
setupRevealAnimations();
setupLeadForm();

window.addEventListener("scroll", () => {
  setHeaderState();
  setFloatingCtaState();
});

window.addEventListener("resize", () => {
  if (window.innerWidth > 960) {
    toggleMenu(false);
    nav.removeAttribute("aria-hidden");
  } else if (navToggle.getAttribute("aria-expanded") !== "true") {
    nav.setAttribute("aria-hidden", "true");
  }

  setFloatingCtaState();
});
