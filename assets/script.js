"use strict";

function init() {

  // general constants

  const subpages = ["feat", "chara", "artworks"];
  const charas = ["ada", "bella", "celia", "davina"];

  const mouseMid = 2;
  const keyLeft  = 37;
  const keyRight = 39;
  const keyI     = 73;
  const keyO     = 79;
  const keyEsc   = 27;

  // utility functions

  function isLeap(year) {
    if (year % 400 === 0) { return true; }
    if (year % 100 === 0) { return false; }
    if (year % 4 === 0) { return true; }
    return false;
  }

  function daysInMonth(year, month) {
    switch (month) {
      case 1: case 3: case 5: case 7: case 8: case 10: case 12:
        return 31;
      case 4: case 6: case 9: case 11:
        return 30;
      case 2:
        return (isLeap(year) ? 29 : 28);
    }
  }

  function howLongAgo(date) {
    const tday = new Date();
    tday.setHours(0,0,0,0);
    date.setHours(0,0,0,0);
    let yearDiff = tday.getFullYear() - date.getFullYear();
    let monthDiff = (tday.getMonth()+1) - (date.getMonth()+1);
    let dayDiff = tday.getDate() - date.getDate();
    if (dayDiff < 0) {
      dayDiff += daysInMonth(tday.getFullYear(), (tday.getMonth()+1)-1);
      monthDiff--;
    }
    if (monthDiff < 0) {
      monthDiff += 12;
      yearDiff--;
    }
    if (yearDiff > 0) {
      return `${yearDiff} year${yearDiff === 1 ? "" : "s"} ago`;
    }
    else if (monthDiff > 0) {
      return `${monthDiff} month${monthDiff === 1 ? "" : "s"} ago`;
    }
    else {
      return `${dayDiff} day${dayDiff === 1 ? "" : "s"} ago`;
    }
  }

  // fetch artworks data

  let numArtworks     = 0;
  let numFeatured     = 0;
  let buttonString    = "";
  let lightboxString  = "";
  let slideshowString = "";
  let pipString       = "";
  function idToYear(id) {
    return 2000 + parseInt(id.slice(0,2));
  }
  function idToDateString(id) {
    return `${idToYear(id)}-${id.slice(2,4)}-${id.slice(4,6)}`;
  }

  $.getJSON("./assets/artworks.json", (artworks) => {
    artworks.reverse();
    const featuredArtworks = artworks.filter((artwork) => artwork.featured);
    numArtworks = artworks.length;
    numFeatured = featuredArtworks.length;

    let indicatorYear = new Date().getFullYear();
    if (idToYear(artworks[0].id) === indicatorYear) {
      buttonString += `<div class="year-indicator"><span>${indicatorYear}</span></div>`;
    }

    artworks.forEach((artwork, index) => {
      if (idToYear(artwork.id) !== indicatorYear) {
        indicatorYear = idToYear(artwork.id);
        buttonString += `<div class="year-indicator"><span>${indicatorYear}</span></div>`;
      }
      const buttonAttr = {
        index: index,
        featured: artwork.featured,
        charas: artwork.chara.join(""),
        category: artwork.category,
      };
      const buttonAttrString = Object.keys(buttonAttr).map((key) => `data-${key}="${buttonAttr[key]}"`).join(" ");
      buttonString += `
        <button type="button" class="artwork-button" ${buttonAttrString}>
          <img src="./assets/img/artworks/${artwork.id}_thumb.png" alt="Open artwork ${artwork.title}" loading="lazy" class="artwork-thumb">
          <div class="artwork-button-overlay">
            <span class="artwork-title">${artwork.title}</span>
            <span class="artwork-meta">#${numArtworks - index}<i class="bi bi-dot"></i>${idToDateString(artwork.id)}</span>
            <div class="artwork-chara-container">
              ${artwork.chara.includes("A") ? `<i class="artwork-chara-ada bi bi-circle-fill"></i>` : ``}
              ${artwork.chara.includes("B") ? `<i class="artwork-chara-bella bi bi-hexagon-fill"></i>` : ``}
              ${artwork.chara.includes("C") ? `<i class="artwork-chara-celia bi bi-star-fill"></i>` : ``}
              ${artwork.chara.includes("D") ? `<i class="artwork-chara-davina bi bi-suit-diamond-fill"></i>` : ``}
            </div>
          </div>
          ${artwork.featured ? `
            <div class="artwork-feature-info">
              <div class="artwork-feature-text-container"><span class="artwork-feature-text">Featured</span></div>
              <div class="artwork-feature-badge-glow"></div>
              <img src="./assets/img/feature_badge.png" alt="Featured artwork badge" class="artwork-feature-badge">
            </div>
          ` : ``}
        </button>
      `;
      lightboxString += `
        <figure class="lightbox-entry" data-index="${index}" style="display: none;">
          <img src="./assets/img/artworks/${artwork.id}_50.png" alt="${artwork.title}" loading="lazy" class="lightbox-img">
          <figcaption class="lightbox-info-expand">
            <span class="lightbox-info-artwork-title">${artwork.title}</span>
            <p><i class="bi bi-hash"></i> ${numArtworks - index}/${numArtworks}</p>
            <p><i class="bi bi-calendar4-event"></i> ${idToDateString(artwork.id)} (${howLongAgo(new Date(idToDateString(artwork.id)))})</p>
            <hr>
            <p>${artwork.caption}</p>
          </figcaption>
        </figure>
      `;
    });

    featuredArtworks.forEach((artwork, index) => {
      slideshowString += `
        <figure class="slideshow-entry" data-index="${index}" style="display: none;">
          <img src="./assets/img/artworks/${artwork.id}_50.png" alt="${artwork.title}" class="slideshow-artwork">
          <figcaption class="slideshow-artwork-title">${artwork.title}</figcaption>
        </figure>
      `;
      pipString += `
        <button type="button" class="round-button slideshow-pip" data-index="${index}"></button>
      `;
    });

    $(".artwork-button-container").prepend(buttonString);
    $(".lightbox").prepend(lightboxString);
    $(".slideshow-container").prepend(slideshowString);
    $(".slideshow-pip-tray").prepend(pipString);

    slideShow(Math.floor(Math.random()*numFeatured));
    filterArtworks();
    $(".no-artwork-msg").hide();
  });

  // subpage controls

  for (let subpage of subpages) {
    $(`#button-${subpage}`).on("click", function() {
      $(`section:not(#${subpage})`).hide();
      $(`#${subpage}`).fadeIn();
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

  function filterArtworks() {
    const showFeatured = $("#featured-filter").is(":checked");
    const showCharas = Object.fromEntries(charas.map((chara) => [chara, $("#chara-filter-"+chara).is(":checked")]));
    const showCategory = $("#category-filter").val();
    const showYearIndicator = $("#year-indicator-filter").is(":checked");

    $(".artwork-button").show();
    if (showFeatured) {
      $(`.artwork-button:not([data-featured="true"])`).hide();
    }
    for (let chara in showCharas) {
      if (!showCharas[chara]) {
        $(`.artwork-button[data-charas*="${chara[0].toUpperCase()}"]`).hide();
      }
    }
    if (showCategory !== "all") {
      if (showCategory === "outfit-all") {
        $(`.artwork-button:not([data-category^="outfit"])`).hide();
      } else {
        $(`.artwork-button:not([data-category="${showCategory}"])`).hide();
      }
    }

    $(".year-indicator").show();
    if (!showYearIndicator) {
      $(".year-indicator").hide();
    }
    $(".year-indicator").each(function() {
      if (!$(this).nextUntil(".year-indicator, .no-artwork-msg").is(":visible")) {
        $(this).hide();
      }
    });

    $(".no-artwork-msg").show();
    if ($(".artwork-button").is(":visible")) {
      $(".no-artwork-msg").hide();
    }

  }

  $(".artwork-filter").on("change", filterArtworks);

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
    $(".lightbox-info-expand").toggleClass("expanded");
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

  $(".artwork-button-container").on("click", ".artwork-button", function() {
    lightboxOpen();
    lightboxShow(parseInt($(this).attr("data-index")));
  });
  $(".artwork-button-container").on("mousedown", ".artwork-button", function(event) {
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
    if ($("#feat").is(":visible")) {
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
