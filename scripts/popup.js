const popupType = { IMAGE: 1, INFO: 2 };
const popupWrapper = buildPopupWrap(); // popup wrapper
let popupData = [];
let imgLoadCount = 0;
let popupImgCount = 0;

async function getPopupData() {
  return fetch("popup.json?ver=1")
    .then((response) => response.json())
    .then((data) => {
      popupData = data;
      popupImgCount = data.filter(i => i.type === popupType.IMAGE).length;
    });
}

function buildPopupWrap() {
  // popup wrapper
  const popupWrapper = document.createElement("div");
  popupWrapper.className = "popup-wrapper";

  const paginationPrev = document.createElement("button");
  const paginationNext = document.createElement("button");
  paginationPrev.className = "popup-pagination prev";
  paginationNext.className = "popup-pagination next";
  paginationPrev.innerText = "◀";
  paginationNext.innerText = "▶";
  console.log(clickPagination);

  paginationPrev.onclick = () => clickPagination('prev');
  paginationNext.onclick = () => clickPagination('next');

  popupWrapper.appendChild(paginationPrev);
  popupWrapper.appendChild(paginationNext);

  return popupWrapper;
}

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
  titleContainer.className = "popup-title-container";
  titleContainer.innerHTML = `<h2>${popupInfo.title}</h2>`;
  animationWrapper.appendChild(titleContainer);

  // card content
  const cardsContainer = document.createElement("div");
  cardsContainer.className = "cards-container";
  animationWrapper.appendChild(cardsContainer);

  popupInfo.contentAry.forEach((content, index) => {
    const div = document.createElement("div");
    let cardContent = "";
    div.className = "event-card";
    div.style.animationDelay = `${index * 0.1}s`; // 稍微加快動畫

    // build title
    cardContent = `<div class="event-header"> ${content.title}</div>`;
    // build content
    cardContent += `<div class="content-text">${content.text}</div>`;
    cardContent += `<div class="content-time">${content.time}</div>`;

    div.innerHTML = cardContent;
    cardsContainer.appendChild(div);
  });

  parentDom.appendChild(wrapper);
}

function buildImgPopup(popupInfo, parentDom, idx) {
  // wrapper
  const wrapper = document.createElement("div");
  wrapper.className = "popup-item popup-img";
  wrapper.setAttribute("data-idx", idx);

  // img
  const img = document.createElement("img");
  img.src = popupInfo.image;

  const imgContainer = popupInfo.link ? document.createElement("a") : document.createElement("div");
  popupInfo.link && (imgContainer.href = popupInfo.link);
  imgContainer.className = "popup-img-container";
  imgContainer.appendChild(img);

  wrapper.appendChild(imgContainer);

  img.addEventListener('load', imgLoadFinish);

  // title
  // const titleContainer = document.createElement("div");
  // titleContainer.className = "popup-title-container";
  // titleContainer.innerHTML = `<h2>${popupInfo.title}</h2>`;
  // wrapper.appendChild(titleContainer);

  // hashtag
  // const hashtagContainer = document.createElement("div");
  // hashtagContainer.className = "popup-hashtag-container";
  // wrapper.appendChild(hashtagContainer);

  // popupInfo.hashtag.forEach(hashtag => {
  //   const span = document.createElement("span");
  //   span.innerText = `#${hashtag}`;
  //   hashtagContainer.appendChild(span);
  // });

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

async function renderPopup() {
  await getPopupData();

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

      default:
        break;
    }
  }

  document.body.appendChild(popupWrapper);
  document.body.classList.add("modal-open");

  changePopupPagination(0);
}

function changePopupPagination(popupIdx) {
  const popupItems = document.querySelectorAll(".popup-item");
  const documentWidth = document.body.clientWidth;
  const popupCurrent = document.querySelector(".popup-item.active");
  const paginationPrev = document.querySelector(".popup-pagination.prev");
  const paginationNext = document.querySelector(".popup-pagination.next");

  if (popupIdx < 0 || popupIdx > popupItems.length - 1) {
    return;
  }

  // reset
  popupCurrent && popupCurrent.classList.remove("active");
  paginationPrev.disabled = false;
  paginationNext.disabled = false;

  // add target active popup
  popupItems[popupIdx].classList.add("active");
  popupItems[popupIdx -1] ? popupItems[popupIdx - 1].classList.add("prev") : paginationPrev.disabled = true;
  popupItems[popupIdx + 1] ? popupItems[popupIdx + 1].classList.add("next") : paginationNext.disabled = true;
  popupWrapper.style.left = `-${documentWidth * popupIdx}px`;
}

function clickPagination(type) {
  console.log(clickPagination);

  const popupItems = document.querySelectorAll(".popup-item");
  const popupCurrent = document.querySelector(".popup-item.active");
  const currentIdx = parseInt(popupCurrent.getAttribute("data-idx"));
  const targetIdx = type === 'prev' ? currentIdx - 1 : currentIdx + 1;
  console.log(currentIdx, targetIdx, type);

  popupItems[targetIdx] && changePopupPagination(targetIdx);
}

document.addEventListener("DOMContentLoaded", renderPopup);
