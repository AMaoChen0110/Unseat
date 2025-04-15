const popupType = { IMAGE: 1, INFO: 2, VIDEO: 3 };
const stopPropagationClassName = "stop-propagation";
const minSwipeDistance = 50;
let popupWrapper = null; // popup wrapper
let popupData = [];
let imgLoadCount = 0;
let popupImgCount = 0;
let timer = -1;
let startX = 0;
let endX = 0;

// get popup data
async function getPopupData() {
  return fetch("popup.json?ver=1")
    .then((response) => response.json())
    .then((data) => {
      popupData = data;
      popupImgCount = data.filter(i => i.type === popupType.IMAGE).length;
    });
}

// close popup
function closePopup() {
  document.body.classList.remove("modal-open");
  window.removeEventListener("resize", resizePopup);
  document.removeEventListener('touchstart', swiperStart);
  document.removeEventListener('touchend', swiperEnd);
  window.clearInterval(timer);
}

// set close event
function setDialogBgClose() {
  function _setPreventDefault(dom) {

    const oldClick = (dom.onclick);

    dom.onclick = (event) => {
      if (!event) return;

      event.stopPropagation();
      oldClick && oldClick();
    }
  }

  // popup wrapper
  popupWrapper.onclick = () => closePopup();

  // set stop propagation
  document.querySelectorAll(`.${stopPropagationClassName}`).forEach(child => _setPreventDefault(child))
}

// build popup wrapper
function buildPopupWrap() {
  // popup background
  const popupBg = document.createElement("div");
  popupBg.className = "popup-bg";

  // popup wrapper
  const popupWrapper = document.createElement("div");
  popupWrapper.className = "popup-wrapper";
  popupBg.appendChild(popupWrapper);

  // pagination
  const paginationPrev = document.createElement("button");
  const paginationNext = document.createElement("button");
  paginationPrev.className = `popup-pagination prev ${stopPropagationClassName}`;
  paginationNext.className = `popup-pagination next ${stopPropagationClassName}`;
  paginationPrev.innerText = "◀";
  paginationNext.innerText = "▶";
  paginationPrev.onclick = () => clickPagination('prev');
  paginationNext.onclick = () => clickPagination('next');

  const pagination = document.createElement("div");
  pagination.className = `popup-pagination-block ${stopPropagationClassName}`;
  popupData.forEach((_item, index) => {
    const paginationItem = document.createElement("div");
    paginationItem.className = "popup-pagination-item";
    paginationItem.setAttribute("data-idx", index);
    paginationItem.onclick = () => clickPaginationItem(index);
    pagination.appendChild(paginationItem);
  });

  // close button
  const closeBtn = document.createElement("button");
  closeBtn.className = "popup-close-btn";
  closeBtn.onclick = () => closePopup();
  closeBtn.innerText = "✕";

  // append to body
  popupWrapper.appendChild(closeBtn);
  popupWrapper.appendChild(paginationPrev);
  popupWrapper.appendChild(paginationNext);
  popupWrapper.appendChild(pagination);
  document.body.appendChild(popupBg);

  return popupWrapper;
}

// build text popup
function buildTextPopup(popupInfo, parentDom, idx) {
  // wrapper
  const wrapper = document.createElement("div");
  wrapper.className = "popup-item popup-text";
  wrapper.setAttribute("data-idx", idx);

  // animation wrapper
  const animationWrapper = document.createElement("div");
  animationWrapper.className = "entry-animation-wrapper";
  wrapper.appendChild(animationWrapper);

  // title
  const titleContainer = document.createElement("div");
  titleContainer.className = `popup-title-container ${stopPropagationClassName}`;
  titleContainer.innerHTML = `<h2>${popupInfo.title}</h2>`;
  animationWrapper.appendChild(titleContainer);

  // card content
  const cardsContainer = document.createElement("div");
  cardsContainer.className = `cards-container cards-count-${popupInfo.contentAry.length}`;
  animationWrapper.appendChild(cardsContainer);

  popupInfo.contentAry.forEach((content, index) => {
    const div = document.createElement("div");
    let cardContent = "";
    div.className = `event-card ${stopPropagationClassName}`;
    div.style.animationDelay = `${index * 0.1}s`; // 稍微加快動畫

    // build title
    cardContent = `<div class="event-header"> ${content.title}</div>`;
    // build content
    cardContent += `<div class="content-text">${content.text}</div>`;
    content.time && (cardContent += `<div class="content-time">${content.time}</div>`);

    div.innerHTML = cardContent;
    cardsContainer.appendChild(div);
  });

  parentDom.appendChild(wrapper);
}

// build img popup
function buildImgPopup(popupInfo, parentDom, idx) {
  // wrapper
  const wrapper = document.createElement("div");
  wrapper.className = "popup-item popup-img";
  wrapper.setAttribute("data-idx", idx);

  // img
  const img = document.createElement("img");
  img.className = stopPropagationClassName;
  img.src = popupInfo.image;
  img.alt = popupInfo.title;

  const imgContainer = popupInfo.link ? document.createElement("a") : document.createElement("div");
  popupInfo.link && (imgContainer.href = popupInfo.link);
  imgContainer.className = "popup-img-container";
  imgContainer.appendChild(img);

  wrapper.appendChild(imgContainer);

  img.addEventListener('load', imgLoadFinish);

  // hashtag
  const hashtagContainer = document.createElement("div");
  hashtagContainer.className = "popup-hashtag-container";
  wrapper.appendChild(hashtagContainer);

  popupInfo.hashtag.forEach(hashtag => {
    const span = document.createElement("span");
    span.innerText = `#${hashtag}`;
    hashtagContainer.appendChild(span);
  });

  parentDom.appendChild(wrapper);
}

// build video popup
function buildVideoPopup(popupInfo, parentDom, idx) {
  // wrapper
  const wrapper = document.createElement("div");
  wrapper.className = "popup-item popup-video";
  wrapper.setAttribute("data-idx", idx);

  const iframe = document.createElement("iframe");
  iframe.className = `popup-video-iframe ${stopPropagationClassName}`;
  iframe.border = "0";
  iframe.allow = "accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share; controls";
  iframe.controls = "1";
  iframe.referrerpolicy = "strict-origin-when-cross-origin";
  iframe.src = popupInfo.video;
  iframe.title = popupInfo.title;

  wrapper.appendChild(iframe);
  parentDom.appendChild(wrapper);
}

// watch img load Finish`
function imgLoadFinish() {
  imgLoadCount++;
  if (imgLoadCount === popupImgCount) {
    popupWrapper.style.width = `${popupWrapper.offsetWidth * popupData.length}px`;
  }
  this.removeEventListener('load', imgLoadFinish);
}

// change popup pagination
function changePopupPagination(popupIdx) {
  const popupItems = document.querySelectorAll(".popup-item");
  const documentWidth = document.body.clientWidth;
  const popupCurrent = document.querySelector(".popup-item.active");
  const paginationItems = document.querySelectorAll(".popup-pagination-item");
  const paginationCurrent = document.querySelector(".popup-pagination-item.active");

  if (popupIdx < 0 || popupIdx > popupItems.length - 1) {
    return;
  }

  // reset
  popupCurrent && popupCurrent.classList.remove("active");
  paginationCurrent && paginationCurrent.classList.remove("active");

  // add target active popup
  popupItems[popupIdx].classList.add("active");
  paginationItems[popupIdx].classList.add("active");
  popupWrapper.style.left = `-${documentWidth * popupIdx}px`;
}

// change popup auto
function changePopupAuto(){
  return window.setInterval(() => clickPagination('next', true), 5000);
}

function waitToChangePopupAuto(isPopupVideoActive = false) {
  // clear
  window.clearInterval(timer);

  if (isPopupVideoActive) {
    return;
  }

  timer = window.setTimeout(() => {
    window.clearInterval(timer);
    timer = changePopupAuto();
  }, 15000);
}

function clickPaginationItem(idx) {
  changePopupPagination(idx);

  const isPopupVideoActive = !!document.querySelector(".popup-video.active");
  waitToChangePopupAuto(isPopupVideoActive);
}

// click pagination prev / next
function clickPagination(type, isAuto = false) {
  const popupItems = document.querySelectorAll(".popup-item");
  const popupCurrent = document.querySelector(".popup-item.active");
  const currentIdx = parseInt(popupCurrent.getAttribute("data-idx"));
  const prevIdx = currentIdx - 1 < 0 ? popupItems.length - 1 : currentIdx - 1;
  const nextIdx = currentIdx + 1 > popupItems.length - 1 ? 0 : currentIdx + 1;
  const targetIdx = type === 'prev' ? prevIdx : nextIdx;

  // change page
  popupItems[targetIdx] && changePopupPagination(targetIdx);

  // if user click pagination, auto change after 60 seconds
  const isPopupVideoActive = !!document.querySelector(".popup-video.active");

  if (!isAuto || isPopupVideoActive) {
    waitOneMinChangePopupAuto(isPopupVideoActive);
  }
}

// watch resize
function resizePopup() {
  const documentWidth = document.body.clientWidth;
  const popupCurrent = document.querySelector(".popup-item.active");
  const currentIdx = parseInt(popupCurrent.getAttribute("data-idx"));
  popupWrapper.style.width = `${popupWrapper.offsetWidth * popupData.length}px`;
  popupWrapper.style.left = `-${documentWidth * currentIdx}px`;
}

// watch swipe
function swiperStart(e) {
  startX = e.touches[0].clientX;
}
function swiperEnd(e) {
  endX = e.changedTouches[0].clientX;
  if (Math.abs(startX - endX) > minSwipeDistance) {
    if (startX > endX) {
      clickPagination('next');
    } else {
      clickPagination('prev');
    }
  }
}

// main function
async function renderPopup() {
  await getPopupData();
  popupWrapper = buildPopupWrap();

  for (const idx in popupData) {
    popupInfo = popupData[idx];

    switch (popupInfo.type) {
      // popup type: 1 -> 圖片彈窗陣列
      case popupType.IMAGE:
        buildImgPopup(popupInfo, popupWrapper, idx);
        break;
      // popup type: 2 -> 文字彈窗陣列
      case popupType.INFO:
        buildTextPopup(popupInfo, popupWrapper, idx);
        break;
      // popup type: 2 -> 文字彈窗陣列
      case popupType.VIDEO:
        buildVideoPopup(popupInfo, popupWrapper, idx);
        break;
      default:
        break;
    }
  }

  document.body.classList.add("modal-open");
  setDialogBgClose();
  changePopupPagination(0);
  timer = changePopupAuto();
}

document.addEventListener("DOMContentLoaded", renderPopup);
window.addEventListener("resize", resizePopup);
document.addEventListener('touchstart', swiperStart);
document.addEventListener('touchend', swiperEnd);