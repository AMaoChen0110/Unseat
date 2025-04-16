document.addEventListener('DOMContentLoaded', function () {
    let videos = [];
    fetch('videos.json')
        .then(res => res.json())
        .then(data => {
            videos = data;
            getAllTags(videos).forEach(tag => {
                const label = document.createElement('label');
                label.innerHTML = `<input type="checkbox" value="${tag}"> ${tag}`;
                dropdownMenu.appendChild(label);
              });
          
              renderGallery(); // 初次渲染畫面
        })
        .catch(err => {
            console.error("載入 videos.json 發生錯誤：", err);
        });

    const tagDropdown = document.getElementById('tagDropdown');
    const dropdownMenu = document.getElementById('dropdownMenu');
    const toggleBtn = tagDropdown.querySelector('.dropdown-toggle');

    toggleBtn.addEventListener('click', () => {
        tagDropdown.classList.toggle('active');
    });

    document.addEventListener('click', (e) => {
        if (!tagDropdown.contains(e.target)) {
            tagDropdown.classList.remove('active');
        }
    });

    function getSelectedTags() {
        return Array.from(dropdownMenu.querySelectorAll('input[type=\"checkbox\"]:checked')).map(cb => cb.value);
    }

    getAllTags(videos).forEach(tag => {
        const label = document.createElement('label');
        label.innerHTML = `<input type="checkbox" value="${tag}"> ${tag}`;
        dropdownMenu.appendChild(label);
    });

    dropdownMenu.addEventListener('change', () => {
        renderGallery(searchInput.value, getSelectedTags(), sortTitle.value);
    });

    const gallery = document.getElementById('videoGallery');
    const lightbox = document.getElementById('lightbox');
    const lightboxVideo = document.getElementById('lightboxVideo');
    const closeBtn = document.getElementById('closeLightbox');
    const searchInput = document.getElementById('searchInput');
    const sortTitle = document.getElementById('sortTitle');

    function getAllTags(videos) {
        const tagSet = new Set();
        videos.forEach(v => v.tags.forEach(t => tagSet.add(t)));
        return Array.from(tagSet);
    }

    function renderGallery(filterText = '', selectedTags = [], sort = 'asc') {
        const lowerFilter = filterText.toLowerCase();
        const filtered = videos.filter(v =>
            v.title.toLowerCase().includes(lowerFilter) &&
            (selectedTags.length === 0 || selectedTags.some(tag => v.tags.includes(tag)))
        ).sort((a, b) =>
            sort === 'asc'
                ? a.title.localeCompare(b.title)
                : b.title.localeCompare(a.title)
        );

        gallery.innerHTML = '';
        filtered.forEach(video => {
            const card = document.createElement('div');
            card.className = 'video-card';
            card.innerHTML = `
<img class="video-thumbnail" src="https://img.youtube.com/vi/${video.id}/hqdefault.jpg" alt="${video.title}">
<h3>${video.title}</h3>
<p>${video.description}</p>
<div class="tags">${video.tags.join(' ')}</div>
`;
            card.addEventListener('click', () => {
                lightbox.style.display = 'flex';
                lightboxVideo.src = `https://www.youtube.com/embed/${video.id}?autoplay=1`;
            });
            gallery.appendChild(card);
        });
    }

    searchInput.addEventListener('input', () => {
        renderGallery(searchInput.value, getSelectedTags(), sortTitle.value);
    });

    sortTitle.addEventListener('change', () => {
        renderGallery(searchInput.value, getSelectedTags(), sortTitle.value);
    });

    closeBtn.addEventListener('click', () => {
        lightbox.style.display = 'none';
        lightboxVideo.src = '';
    });

    lightbox.addEventListener('click', (e) => {
        if (e.target === lightbox) {
            lightbox.style.display = 'none';
            lightboxVideo.src = '';
        }
    });

    renderGallery();

});
