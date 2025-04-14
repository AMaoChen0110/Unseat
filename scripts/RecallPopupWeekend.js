// Carousel implementation for the popup cards
function showIntroCarousel() {
    // Define content for the carousel slides
    const carouselContent = [
        // First slide - original event cards
        // {
        //     type: 'events',
        //     items: [
        //         {
        //             date: '4/13',
        //             weekday: '(日)',
        //             title: '苗栗罷免宣講',
        //             location: '頭份市建國國小旁建國花市預訂地',
        //             time: '10:30~10:45'
        //         },
        //         {
        //             date: '4/13',
        //             weekday: '(日)',
        //             title: '板橋罷免宣講',
        //             location: '永豐公園活動中心',
        //             time: '13:30~14:00'
        //         },
        //         {
        //             date: '4/13',
        //             weekday: '(日)',
        //             title: '文山罷免宣講',
        //             location: '文山興隆公園',
        //             time: '15:00~15:30'
        //         },
        //         {
        //             date: '4/13',
        //             weekday: '(日)',
        //             title: '雙和罷免宣講',
        //             location: '仁愛公園仁愛永貞路口',
        //             time: '16:00~16:30'
        //         }
        //     ]
        // },
        // Second slide - 419 event image
        {
            type: 'image',
            src: 'images/recall01.jpg',
            alt: '緊急情況，花蓮人站出來',
            link: '#'
        },
        {
            type: 'image',
            src: 'images/419/41901.jpg',
            alt: '419 守護台灣活動',
            link: '419ProtestEvent.html'
        }
    ];

    // Create the wrapper
    const wrapper = document.createElement('div');
    wrapper.id = 'entry-animation-wrapper';

    // Create the carousel container
    const carouselContainer = document.createElement('div');
    carouselContainer.className = 'carousel-container';
    wrapper.appendChild(carouselContainer);

    // Create the slides container
    const slidesContainer = document.createElement('div');
    slidesContainer.className = 'slides-container';
    carouselContainer.appendChild(slidesContainer);

    // Set current slide index
    let currentSlideIndex = 0;
    const totalSlides = carouselContent.length;

    // Create slides
    carouselContent.forEach((slideContent, slideIndex) => {
        const slide = document.createElement('div');
        slide.className = 'carousel-slide';
        slide.style.flexDirection = 'column';
        slide.dataset.slideIndex = slideIndex;
        wrapper.addEventListener('click', (e) => {
            if (e.target.id === 'entry-animation-wrapper' || e.target === slide) {
                closeWrapper();
            }
        });
        
        if (slideContent.type === 'events') {

            const titleContainer = document.createElement('div');
            titleContainer.className = 'popup-title-container';
            titleContainer.innerHTML = '<h2>Puma沈伯洋週末宣講行程</h2>';
            slide.appendChild(titleContainer);

            // Create scrollable container for event slides
            const scrollContainer = document.createElement('div');
            scrollContainer.className = 'scroll-container';
            
            // Create cards container for event slides
            const cardsContainer = document.createElement('div');
            cardsContainer.className = 'cards-container';
            
            // Add event cards
            slideContent.items.forEach((card, index) => {
                const div = document.createElement('div');
                div.className = 'event-card';
                div.style.animationDelay = `${index * 0.1}s`;
                div.innerHTML = `
                    <div class="event-header">
                        <div class="event-date">${card.date}</div>
                        <div class="event-weekday">${card.weekday}</div>
                        <div class="event-title">${card.title}</div>
                    </div>
                    <div class="event-location">${card.location}</div>
                    <div class="event-time">${card.time}</div>
                `;
                cardsContainer.appendChild(div);
            });
            
            scrollContainer.appendChild(cardsContainer);
            slide.appendChild(scrollContainer);

            wrapper.addEventListener('click', (e) => {
                if (e.target === cardsContainer) {
                    closeWrapper();
                }
            });

        } else if (slideContent.type === 'image') {
            // Create image slide
            const imgContainer = document.createElement('div');
            imgContainer.className = 'image-container';
            
            const imgLink = document.createElement('a');
            imgLink.href = slideContent.link;
            
            const img = document.createElement('img');
            img.src = slideContent.src;
            img.alt = slideContent.alt;
            img.className = 'carousel-image';
            
            imgLink.appendChild(img);
            imgContainer.appendChild(imgLink);
            slide.appendChild(imgContainer);
        }
        
        // Add click handler to close when clicking on slide background
        slide.addEventListener('click', (e) => {
            // Only close if the click was directly on the slide background,
            // not on any of its children
            if (e.target === slide) {
                closeWrapper();
            }
        });
        
        slidesContainer.appendChild(slide);
    });

    // Create navigation controls in center of carousel
    const navControlsLeft = document.createElement('div');
    navControlsLeft.className = 'carousel-nav-left';
    
    const navControlsRight = document.createElement('div');
    navControlsRight.className = 'carousel-nav-right';
    
    const prevButton = document.createElement('button');
    prevButton.className = 'carousel-nav-btn prev';
    prevButton.innerHTML = '&#10094;';
    
    const nextButton = document.createElement('button');
    nextButton.className = 'carousel-nav-btn next';
    nextButton.innerHTML = '&#10095;';
    
    navControlsLeft.appendChild(prevButton);
    navControlsRight.appendChild(nextButton);
    
    carouselContainer.appendChild(navControlsLeft);
    carouselContainer.appendChild(navControlsRight);
    
    // Create indicator dots at bottom
    const indicators = document.createElement('div');
    indicators.className = 'carousel-indicators';
    
    for (let i = 0; i < totalSlides; i++) {
        const dot = document.createElement('span');
        dot.className = 'carousel-dot' + (i === 0 ? ' active' : '');
        dot.dataset.slideIndex = i;
        dot.addEventListener('click', () => {
            goToSlide(i);
        });
        indicators.appendChild(dot);
    }
    
    carouselContainer.appendChild(indicators);

    // Create close button
    const closeBtn = document.createElement('button');
    closeBtn.id = 'close-entry-wrapper';
    closeBtn.innerHTML = '&times;';

    const closeWrapper = () => {
        wrapper.remove();
        closeBtn.remove();
        document.body.classList.remove('modal-open');
    }

    closeBtn.addEventListener('click', closeWrapper);

    // Function to go to specific slide
    function goToSlide(index) {
        if (index < 0) {
            index = totalSlides - 1;
        } else if (index >= totalSlides) {
            index = 0;
        }
        
        currentSlideIndex = index;
        
        // Update slides position
        slidesContainer.style.transform = `translateX(-${currentSlideIndex * 100}%)`;
        
        // Update indicators
        document.querySelectorAll('.carousel-dot').forEach((dot, idx) => {
            dot.classList.toggle('active', idx === currentSlideIndex);
        });
    }

    // Add navigation event listeners
    prevButton.addEventListener('click', (e) => {
        e.stopPropagation(); // Prevent the click from bubbling to parent elements
        goToSlide(currentSlideIndex - 1);
    });
    
    nextButton.addEventListener('click', (e) => {
        e.stopPropagation(); // Prevent the click from bubbling to parent elements
        goToSlide(currentSlideIndex + 1);
    });

    // Add touch swipe support
    let startX, endX;
    const minSwipeDistance = 50;
    
    slidesContainer.addEventListener('touchstart', (e) => {
        startX = e.touches[0].clientX;
    });
    
    slidesContainer.addEventListener('touchend', (e) => {
        endX = e.changedTouches[0].clientX;
        handleSwipe();
    });
    
    function handleSwipe() {
        const distance = startX - endX;
        
        if (Math.abs(distance) > minSwipeDistance) {
            if (distance > 0) {
                // Swipe left - next slide
                goToSlide(currentSlideIndex + 1);
            } else {
                // Swipe right - previous slide
                goToSlide(currentSlideIndex - 1);
            }
        }
    }

    // Close on background click
    wrapper.addEventListener('click', (e) => {
        if (e.target.id === 'entry-animation-wrapper') {
            closeWrapper();
        }
    });

    // Add to document
    document.body.appendChild(wrapper);
    document.body.appendChild(closeBtn);
    document.body.classList.add('modal-open');

    // Initialize first slide
    goToSlide(0);
}

document.addEventListener('DOMContentLoaded', showIntroCarousel);