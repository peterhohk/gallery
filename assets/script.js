"use strict";

function init() {

  // general constants

  const subpages = ["feat", "chara", "works"];
  const charas = ["ada", "bella", "celia", "davina"];

  const mouseMid = 2;
  const keyLeft  = 37;
  const keyRight = 39;
  const keyI     = 73;
  const keyO     = 79;
  const keyEsc   = 27;

  // fetch artworks data

  let numArtworks     = 0;
  let numFeatured     = 0;
  let buttonString    = "";
  let lightboxString  = "";
  let slideshowString = "";
  let pipString       = "";
  function dateFromId(id) {
    return `20${id.slice(0,2)}-${id.slice(2,4)}-${id.slice(4,6)}`;
  }

  $.getJSON("./assets/artworks.json", (artworks) => {
    artworks.reverse();
    const featuredArtworks = artworks.filter((artwork) => artwork.featured);
    numArtworks = artworks.length;
    numFeatured = featuredArtworks.length;

    artworks.forEach((artwork, index) => {
      const buttonAttr = {
        index: index,
        featured: artwork.featured,
        charas: artwork.chara.join(""),
        category: artwork.category,
      };
      const buttonAttrString = Object.keys(buttonAttr).map((key) => `data-${key}="${buttonAttr[key]}"`).join(" ");
      buttonString += `
        <button type="button" class="artwork-button" ${buttonAttrString}>
          <img src="./assets/img/artworks/${artwork.id}_thumb.png" alt="Open artwork ${artwork.title}" width="144" height="144" loading="lazy" class="artwork-thumb">
          <div class="artwork-button-overlay">
            <span>${artwork.title}</span>
            <span class="artwork-meta">#${numArtworks - index} | ${dateFromId(artwork.id)}</span>
          </div>
          ${artwork.featured ? `<div class="artwork-feature-badge-glow"></div><img src="./assets/img/feature_badge.png" alt="Featured artwork badge" width="32" height="32" class="artwork-feature-badge">` : ``}
        </button>
      `;
      lightboxString += `
        <figure class="lightbox-entry" data-index="${index}" style="display: none;">
          <img src="./assets/img/artworks/${artwork.id}_50.png" alt="${artwork.title}" width="1024" height="768" loading="lazy" class="lightbox-img">
          <figcaption class="lightbox-info-expand">
            <span class="lightbox-info-artwork-title">${artwork.title}</span>
            <p>#${numArtworks - index}/${numArtworks}</p>
            <p>Date: ${dateFromId(artwork.id)}</p>
            <p>${artwork.caption}</p>
          </figcaption>
        </figure>
      `;
    });

    featuredArtworks.forEach((artwork, index) => {
      slideshowString += `
        <figure class="slideshow-entry" data-index="${index}" style="display: none;">
          <img src="./assets/img/artworks/${artwork.id}_50.png" alt="${artwork.title}" width="640" height="640" class="slideshow-artwork">
          <figcaption class="slideshow-artwork-title">${artwork.title}</figcaption>
        </figure>
      `;
      pipString += `
        <button type="button" class="round-button slideshow-pip" data-index="${index}"></button>
      `;
    });

    $(".content-works-body").prepend(buttonString);
    $(".lightbox").prepend(lightboxString);
    $(".content-feat-body").prepend(slideshowString);
    $(".slideshow-pip-tray").prepend(pipString);
    slideShow(Math.floor(Math.random()*numFeatured));
  });

  // subpage controls

  for (let subpage of subpages) {
    $(`#button-${subpage}`).on("click", function() {
      $(`section:not(.content-${subpage})`).hide();
      $(`.content-${subpage}`).fadeIn();
    });
  }

  // featured artworks controls

  let slideCurrent = 0;
  let slideIntervalId = 0;
  function slideShow(index) {
    slideCurrent = index;
    clearInterval(slideIntervalId);
    slideIntervalId = setInterval(slideNext, 10000);
    $(`.slideshow-entry:not([data-index="${index}"])`).hide();
    $(`.slideshow-pip:not([data-index="${index}"])`).removeClass("active");
    $(`.slideshow-entry[data-index="${index}"]`).fadeIn();
    $(`.slideshow-pip[data-index="${index}"]`).addClass("active");
  }
  function slidePrev() {
    slideShow((slideCurrent-1+numFeatured) % numFeatured);
  }
  function slideNext() {
    slideShow((slideCurrent+1+numFeatured) % numFeatured);
  }

  $(".slideshow-prev").on("click", slidePrev);
  $(".slideshow-next").on("click", slideNext);
  $(".slideshow-pip-tray").on("click", ".slideshow-pip", function() {
    slideShow(parseInt($(this).attr("data-index")));
  });

  // character introduction controls

  for (let chara of charas) {
    $(`.chara-button.${chara}`).on("click", function() {
      $(".chara-details.default").hide();
      $(`.chara-details:not(.${chara})`).hide();
      $(`.chara-details.${chara}`).fadeIn();
    });
  }

  // artwork catalogue filters

  let filterFeatured = false;
  const filterCharas = Object.fromEntries(charas.map((val) => [val, true]));
  let filterCategory = "all";
  function filterArtworks() {
    $(".artwork-button").show();
    if (filterFeatured) {
      $(`.artwork-button:not([data-featured="true"])`).hide();
    }
    for (let chara in filterCharas) {
      if (!filterCharas[chara]) {
        $(`.artwork-button[data-charas*=${chara[0].toUpperCase()}]`).hide();
      }
    }
    if (filterCategory !== "all") {
      if (filterCategory === "outfit-all") {
        $(`.artwork-button:not([data-category^="outfit"])`).hide();
      } else {
        $(`.artwork-button:not([data-category="${filterCategory}"])`).hide();
      }
    }
  }

  $("#featured-filter").on("change", function() {
    filterFeatured = $(this).is(":checked");
    filterArtworks();
  });
  for (let chara of charas) {
    $("#chara-filter-"+chara).on("click", function() {
      filterCharas[chara] = $(this).is(":checked");
      filterArtworks();
    });
  }
  $("#category-filter").on("change", function() {
    filterCategory = $(this).val();
    filterArtworks();
  });

  // artwork catalogue & lightbox controls

  let lightboxCurrent = 0;
  function lightboxShow(index) {
    lightboxCurrent = index;
    $(`.lightbox-entry:not([data-index="${index}"])`).hide();
    $(`.lightbox-entry[data-index="${index}"]`).show();
  }
  function lightboxOpen() {
    $(".lightbox-overlay").fadeIn();
    $(".artwork-button").each(function() {
      $(this).attr({"tabindex": -1})
    });
  }
  function lightboxPrev() {
    lightboxShow((lightboxCurrent-1+numArtworks) % numArtworks);
  }
  function lightboxNext() {
    lightboxShow((lightboxCurrent+1+numArtworks) % numArtworks);
  }
  function lightboxInfo() {
    $(".lightbox-info-expand").toggleClass("pinned");
  }
  function lightboxOrig() {
    window.open($(`.lightbox-entry[data-index="${lightboxCurrent}"] .lightbox-img`).attr("src"));
  }
  function lightboxClose() {
    $(".lightbox-overlay").fadeOut();
    $(".artwork-button").each(function() {
      $(this).attr({"tabindex": null})
    });
  }

  $(".content-works-body").on("click", ".artwork-button", function() {
    lightboxOpen();
    lightboxShow(parseInt($(this).attr("data-index")));
  });
  $(".content-works-body").on("mousedown", ".artwork-button", function(event) {
    if (event.which === mouseMid) {
      event.preventDefault();
      window.open($(`.lightbox-entry[data-index="${$(this).attr("data-index")}"] .lightbox-img`).attr("src"));
    }
  });
  $(".lightbox-prev").on("click", lightboxPrev);
  $(".lightbox-next").on("click", lightboxNext);
  $(".lightbox-info").on("click", lightboxInfo);
  $(".lightbox-expand").on("click", lightboxOrig);
  $(".lightbox-close").on("click", lightboxClose);
  $(".lightbox-overlay").on("click", function(event) {
    if (event.target === this || event.target === $(".lightbox").get(0)) {
      lightboxClose();
    }
  });

  // keyboard controls

  $(window).on("keydown", function(event) {
    if ($(".content-feat-body").is(":visible")) {
      switch (event.which) {
        case keyLeft:
          slidePrev();
          break;
        case keyRight:
          slideNext();
          break;
      }
    }
    if ($(".lightbox-overlay").is(":visible")) {
      switch (event.which) {
        case keyLeft:
          lightboxPrev();
          break;
        case keyRight:
          lightboxNext();
          break;
        case keyI:
          lightboxInfo();
          break;
        case keyO:
          lightboxOrig();
          break;
        case keyEsc:
          lightboxClose();
          break;
      }
    }
  });

}

$(document).ready(init);