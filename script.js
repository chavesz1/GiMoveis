const header = document.querySelector("[data-header]");
const menuToggle = document.querySelector("[data-menu-toggle]");
const nav = document.querySelector("[data-nav]");
const navLinks = document.querySelectorAll(".main-nav a");
const internalLinks = document.querySelectorAll('a[href^="#"]');
const revealElements = document.querySelectorAll(".reveal");
const sections = document.querySelectorAll("main section[id]");
const galleryCards = document.querySelectorAll("[data-gallery]");
const lightbox = document.querySelector("[data-lightbox]");
const lightboxImage = document.querySelector("[data-lightbox-image]");
const lightboxCount = document.querySelector("[data-lightbox-count]");
const lightboxClose = document.querySelector("[data-lightbox-close]");
const lightboxPrev = document.querySelector("[data-lightbox-prev]");
const lightboxNext = document.querySelector("[data-lightbox-next]");

let activeLightboxImages = [];
let activeLightboxAlt = "";
let activeLightboxIndex = 0;

const updateHeader = () => {
  header.classList.toggle("is-scrolled", window.scrollY > 12);
};

const getHashTarget = (hash) => {
  if (!hash || hash === "#") return null;

  return document.getElementById(hash.slice(1));
};

const getHeaderOffset = () => header.getBoundingClientRect().height + 18;

const getTargetTop = (target) => {
  if (target.id === "inicio") return 0;

  const targetStyles = window.getComputedStyle(target);
  const targetPaddingTop = parseFloat(targetStyles.paddingTop) || 0;
  const targetTop = target.getBoundingClientRect().top + window.scrollY;

  return targetTop + targetPaddingTop - getHeaderOffset();
};

const scrollToSection = (target, shouldUpdateHash = false) => {
  window.scrollTo({
    top: Math.max(0, getTargetTop(target)),
    behavior: "smooth",
  });

  if (shouldUpdateHash) {
    history.pushState(null, "", `#${target.id}`);
  }
};

const readGalleryImages = (card) => {
  try {
    return JSON.parse(card.dataset.gallery || "[]");
  } catch {
    return [];
  }
};

const wrapGalleryIndex = (index, length) => (index + length) % length;

const updateCardGallery = (card, index) => {
  const images = readGalleryImages(card);
  const image = card.querySelector(".gallery-image");
  const counter = card.querySelector("[data-gallery-count]");

  if (!images.length || !image) return;

  const nextIndex = wrapGalleryIndex(index, images.length);
  card.dataset.galleryIndex = String(nextIndex);
  image.src = images[nextIndex];

  if (counter) {
    counter.textContent = `${nextIndex + 1}/${images.length}`;
  }
};

const updateLightbox = () => {
  if (!activeLightboxImages.length || !lightboxImage || !lightboxCount) return;

  lightboxImage.src = activeLightboxImages[activeLightboxIndex];
  lightboxImage.alt = activeLightboxAlt;
  lightboxCount.textContent = `${activeLightboxIndex + 1}/${activeLightboxImages.length}`;

  const hasSequence = activeLightboxImages.length > 1;
  if (lightboxPrev) lightboxPrev.hidden = !hasSequence;
  if (lightboxNext) lightboxNext.hidden = !hasSequence;
  lightboxCount.hidden = !hasSequence;
};

const openLightbox = (images, index, alt) => {
  if (!lightbox || !images.length) return;

  activeLightboxImages = images;
  activeLightboxIndex = wrapGalleryIndex(index, images.length);
  activeLightboxAlt = alt;

  updateLightbox();
  lightbox.classList.add("is-open");
  lightbox.setAttribute("aria-hidden", "false");
  document.body.classList.add("lightbox-open");
  lightboxClose?.focus();
};

const closeLightbox = () => {
  if (!lightbox) return;

  lightbox.classList.remove("is-open");
  lightbox.setAttribute("aria-hidden", "true");
  document.body.classList.remove("lightbox-open");
};

const moveLightbox = (step) => {
  if (activeLightboxImages.length <= 1) return;

  activeLightboxIndex = wrapGalleryIndex(
    activeLightboxIndex + step,
    activeLightboxImages.length
  );
  updateLightbox();
};

galleryCards.forEach((card) => {
  const images = readGalleryImages(card);
  const openButton = card.querySelector("[data-gallery-open]");
  const prevButton = card.querySelector("[data-carousel-prev]");
  const nextButton = card.querySelector("[data-carousel-next]");
  const image = card.querySelector(".gallery-image");

  card.dataset.galleryIndex = "0";

  if (images.length <= 1) {
    card.querySelectorAll(".gallery-nav, .gallery-count").forEach((element) => {
      element.hidden = true;
    });
  }

  openButton?.addEventListener("click", () => {
    openLightbox(images, Number(card.dataset.galleryIndex) || 0, image?.alt || "");
  });

  prevButton?.addEventListener("click", () => {
    updateCardGallery(card, (Number(card.dataset.galleryIndex) || 0) - 1);
  });

  nextButton?.addEventListener("click", () => {
    updateCardGallery(card, (Number(card.dataset.galleryIndex) || 0) + 1);
  });
});

lightboxClose?.addEventListener("click", closeLightbox);
lightboxPrev?.addEventListener("click", () => moveLightbox(-1));
lightboxNext?.addEventListener("click", () => moveLightbox(1));

lightbox?.addEventListener("click", (event) => {
  if (event.target === lightbox) {
    closeLightbox();
  }
});

document.addEventListener("keydown", (event) => {
  if (!lightbox?.classList.contains("is-open")) return;

  if (event.key === "Escape") closeLightbox();
  if (event.key === "ArrowLeft") moveLightbox(-1);
  if (event.key === "ArrowRight") moveLightbox(1);
});

menuToggle.addEventListener("click", () => {
  const isOpen = nav.classList.toggle("is-open");
  menuToggle.setAttribute("aria-expanded", String(isOpen));
});

internalLinks.forEach((link) => {
  link.addEventListener("click", (event) => {
    const targetId = link.getAttribute("href");
    const target = getHashTarget(targetId);

    nav.classList.remove("is-open");
    menuToggle.setAttribute("aria-expanded", "false");

    if (!target) return;

    event.preventDefault();
    scrollToSection(target);
  });
});

const revealObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("is-visible");
        revealObserver.unobserve(entry.target);
      }
    });
  },
  { threshold: 0.14 }
);

revealElements.forEach((element) => revealObserver.observe(element));

const activeObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;

      navLinks.forEach((link) => {
        link.classList.toggle(
          "is-active",
          link.getAttribute("href") === `#${entry.target.id}`
        );
      });
    });
  },
  { rootMargin: "-45% 0px -45% 0px", threshold: 0.01 }
);

sections.forEach((section) => activeObserver.observe(section));
window.addEventListener("scroll", updateHeader, { passive: true });
window.addEventListener("load", () => {
  const target = getHashTarget(window.location.hash);

  if (target) {
    window.setTimeout(() => scrollToSection(target, false), 80);
  }
});
window.addEventListener("popstate", () => {
  const target = getHashTarget(window.location.hash);

  if (target) {
    scrollToSection(target, false);
  }
});
updateHeader();
