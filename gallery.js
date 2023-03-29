"use strict";

function init() {

  // general constants

  const subpages = ["feat", "chara", "works"];
  const charas = ["ada", "bella", "celia", "davina"];

  // subpage controls

  for (let subpage of subpages) {
    $("#button-"+subpage).on("click", function() {
      $("main").not(".content-"+subpage).hide();
      $(".content-"+subpage).fadeIn();
    });
  }
  $("#button-feat").trigger("click");

  // character introduction controls

  for (let chara of charas) {
    $(".chara-button."+chara).on("click", function() {
      $(".chara-box.default").hide();
      $(".chara-box").not("."+chara).hide();
      $(".chara-box."+chara).fadeIn();
    });
  }

  // json data magic

  let numArtworks = 0;
  let numFeatured = 0;
  let buttonString = "";
  let lightboxString = "";
  let slideshowString = "";
  const dateFromId = (id) => `20${id.slice(0,2)}-${id.slice(2,4)}-${id.slice(4,6)}`;

  $.getJSON("artworks.json", function(data) {
    numArtworks = data.length;
    numFeatured = data.filter((artwork) => artwork.featured).length;
    data.reverse().forEach(function(artwork, index) {
      let classString = "";
      classString += (artwork.chara.includes("A") ? " ada" : "");
      classString += (artwork.chara.includes("B") ? " bella" : "");
      classString += (artwork.chara.includes("C") ? " celia" : "");
      classString += (artwork.chara.includes("D") ? " davina" : "");
      buttonString += `
        <button type="button" class="artwork-button${classString}">
          <img src="assets/artworks/${artwork.id}_thumb.png" alt="Open artwork ${artwork.title}" loading="lazy">
          <div class="artwork-button-overlay">
            <span>${artwork.title}</span>
            <span>#${numArtworks - index} | ${dateFromId(artwork.id)}</span>
          </div>
        </button>
      `;
      lightboxString += `
        <img src="assets/artworks/${artwork.id}_50.png" alt="${artwork.title}" loading="lazy">
        <div class="lightbox-info-expand">
          <span class="artwork-title">${artwork.title}</span>
          <p>#${numArtworks - index}/${numArtworks}</p>
          <p>Date: ${dateFromId(artwork.id)}</p>
          <p>${artwork.caption}</p>
        </div>
      `;
      if (artwork.featured) {
        slideshowString += `
          <img src="assets/artworks/${artwork.id}_50.png" alt="${artwork.title}">
          <span>${artwork.title}</span>
        `;
      }
    });
    $(".content-works-body").append(buttonString);
    $(".lightbox").append(lightboxString);
    $(".content-feat-body").append(slideshowString);
    $(".slideshow-pip-tray").append(`<button type="button" class="slideshow-pip"></button>`.repeat(numFeatured));
    slideShow(Math.floor(Math.random()*numFeatured));
  });

  // artwork catalogue filters

  const hideCharas = Object.fromEntries(charas.map((val) => [val, false]));
  for (let chara of charas) {
    $("#artwork-filter-"+chara).on("click", function() {
      hideCharas[chara] = !$(this).is(":checked");
      $(".artwork-button").show();
      for (let chara of charas) {
        if (hideCharas[chara]) {
          $(".artwork-button."+chara).hide();
        }
      }
    });
  }

  // artwork catalogue & lightbox controls

  let lightboxCurrent = 0;
  function lightboxShow(index) {
    lightboxCurrent = index;
    $(".lightbox img").not($(".lightbox img").eq(index)).hide();
    $(".lightbox-info-expand").not($(".lightbox-info-expand").eq(index)).hide();
    $(".lightbox img").eq(index).show();
    $(".lightbox-info-expand").eq(index).show();
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
    window.open($(".lightbox img").filter(":visible").attr("src"));
  }
  function lightboxClose() {
    $(".lightbox-overlay").fadeOut();
  }

  $(".content-works-body").on("click", ".artwork-button", function() {
    $(".lightbox-overlay").fadeIn();
    lightboxShow($(this).index());
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

  // featured artworks controls

  let slideCurrent = 0;
  let slideIntervalId = 0;
  function slideShow(index) {
    slideCurrent = index;
    clearInterval(slideIntervalId);
    slideIntervalId = setInterval(slideNext, 10000);
    $(".content-feat-body img").not($(".content-feat-body img").eq(index)).hide();
    $(".content-feat-body span").not($(".content-feat-body span").eq(index)).hide();
    $(".slideshow-pip").not($(".slideshow-pip").eq(index)).removeClass("active");
    $(".content-feat-body img").eq(index).fadeIn();
    $(".content-feat-body span").eq(index).fadeIn();
    $(".slideshow-pip").eq(index).addClass("active");
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
    slideShow($(this).index());
  });

  // keyboard controls

  const keyLeft  = 37;
  const keyRight = 39;
  const keyI     = 73;
  const keyO     = 79;
  const keyEsc   = 27;
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