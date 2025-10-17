// 돌잔치 날짜 설정 (2025년 10월 11일 12:00)
const partyDate = new Date('2025-10-11T12:00:00').getTime();

// DOM 요소 선택
const daysElement = document.getElementById('days');
const hoursElement = document.getElementById('hours');
const minutesElement = document.getElementById('minutes');

// 카운트다운 업데이트 함수
function updateCountdown() {
    const now = new Date().getTime();
    const distance = partyDate - now;

    // 시간 계산
    const days = Math.floor(distance / (1000 * 60 * 60 * 24));
    const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));

    // DOM 업데이트
    if (daysElement) daysElement.textContent = days < 0 ? 0 : days;
    if (hoursElement) hoursElement.textContent = hours < 0 ? 0 : hours;
    if (minutesElement) minutesElement.textContent = minutes < 0 ? 0 : minutes;

    // 돌잔치가 지났을 때
    if (distance < 0) {
        if (daysElement) daysElement.textContent = '0';
        if (hoursElement) hoursElement.textContent = '0';
        if (minutesElement) minutesElement.textContent = '0';
        
        // 카운트다운 라벨 변경
        const countdownLabel = document.querySelector('.countdown-label');
        if (countdownLabel) {
            countdownLabel.textContent = '돌잔치가 열렸어요! 🎉';
        }
    }
}

// 부드러운 스크롤 함수
function smoothScrollTo(targetId) {
    const targetElement = document.getElementById(targetId);
    if (targetElement) {
        const headerOffset = 0; // 필요에 따라 조정
        const elementPosition = targetElement.getBoundingClientRect().top;
        const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

        window.scrollTo({
            top: offsetPosition,
            behavior: 'smooth'
        });
    }
}

// 네비게이션 클릭 이벤트 처리
function handleNavigation() {
    const navItems = document.querySelectorAll('.nav-item');
    
    navItems.forEach(item => {
        item.addEventListener('click', function(e) {
            e.preventDefault();
            const href = this.getAttribute('href');
            if (href && href.startsWith('#')) {
                const targetId = href.substring(1);
                smoothScrollTo(targetId);
            }
        });
    });
}

// 스크롤 애니메이션 효과
function addScrollAnimations() {
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver(function(entries) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }
        });
    }, observerOptions);

    // 애니메이션을 적용할 요소들 선택
    const animatedElements = document.querySelectorAll('.section-content, .timeline-item, .party-card, .gallery-item, .location-card');
    
    animatedElements.forEach(element => {
        element.style.opacity = '0';
        element.style.transform = 'translateY(30px)';
        element.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
        observer.observe(element);
    });
}

// 갤러리 이미지 클릭 이벤트 (간단한 확대 효과)
function handleGalleryImages() {
    const galleryItems = document.querySelectorAll('.gallery-item');
    
    galleryItems.forEach(item => {
        item.addEventListener('click', function() {
            this.style.transform = this.style.transform === 'scale(1.2)' ? 'scale(1)' : 'scale(1.2)';
            this.style.zIndex = this.style.transform === 'scale(1.2)' ? '10' : '1';
            this.style.transition = 'transform 0.3s ease, z-index 0.3s ease';
        });
    });
}

// 플로팅 네비게이션 활성화 표시
function updateActiveNavigation() {
    const sections = document.querySelectorAll('section[id]');
    const navItems = document.querySelectorAll('.nav-item');
    
    window.addEventListener('scroll', function() {
        let current = '';
        
        sections.forEach(section => {
            const sectionTop = section.getBoundingClientRect().top;
            const sectionHeight = section.offsetHeight;
            
            if (sectionTop <= 100 && sectionTop + sectionHeight > 100) {
                current = section.getAttribute('id');
            }
        });
        
        navItems.forEach(item => {
            item.classList.remove('active');
            const href = item.getAttribute('href');
            if (href === `#${current}`) {
                item.classList.add('active');
            }
        });
    });
}

// 활성 네비게이션 스타일 추가
function addActiveNavStyles() {
    const style = document.createElement('style');
    style.textContent = `
        .nav-item.active {
            background: rgba(255, 255, 255, 0.4) !important;
            transform: scale(1.1);
            box-shadow: 0 0 15px rgba(255, 255, 255, 0.3);
        }
    `;
    document.head.appendChild(style);
}

// 타임라인 아이템 순차 애니메이션
function animateTimelineItems() {
    const timelineItems = document.querySelectorAll('.timeline-item');
    
    const timelineObserver = new IntersectionObserver(function(entries) {
        entries.forEach((entry, index) => {
            if (entry.isIntersecting) {
                setTimeout(() => {
                    entry.target.style.opacity = '1';
                    entry.target.style.transform = 'translateY(0)';
                }, index * 200); // 200ms 간격으로 순차 애니메이션
            }
        });
    }, {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    });

    timelineItems.forEach(item => {
        item.style.opacity = '0';
        item.style.transform = 'translateY(50px)';
        item.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
        timelineObserver.observe(item);
    });
}

// 페이지 로드 시 Hero 섹션 애니메이션
function animateHeroSection() {
    const heroPhoto = document.querySelector('.hero-photo');
    const heroTitle = document.querySelector('.hero-title');
    const heroSubtitle = document.querySelector('.hero-subtitle');
    
    if (heroPhoto) {
        heroPhoto.style.opacity = '0';
        heroPhoto.style.transform = 'scale(0.8)';
        heroPhoto.style.transition = 'opacity 1s ease, transform 1s ease';
        
        setTimeout(() => {
            heroPhoto.style.opacity = '1';
            heroPhoto.style.transform = 'scale(1)';
        }, 300);
    }
    
    if (heroTitle) {
        heroTitle.style.opacity = '0';
        heroTitle.style.transform = 'translateY(30px)';
        heroTitle.style.transition = 'opacity 0.8s ease, transform 0.8s ease';
        
        setTimeout(() => {
            heroTitle.style.opacity = '1';
            heroTitle.style.transform = 'translateY(0)';
        }, 800);
    }
    
    if (heroSubtitle) {
        heroSubtitle.style.opacity = '0';
        heroSubtitle.style.transform = 'translateY(30px)';
        heroSubtitle.style.transition = 'opacity 0.8s ease, transform 0.8s ease';
        
        setTimeout(() => {
            heroSubtitle.style.opacity = '1';
            heroSubtitle.style.transform = 'translateY(0)';
        }, 1200);
    }
}

// 카운트다운 숫자 애니메이션 효과
function animateCountdownNumbers() {
    const countdownItems = document.querySelectorAll('.countdown-item span');
    
    countdownItems.forEach(item => {
        const finalValue = parseInt(item.textContent);
        let currentValue = 0;
        const increment = Math.ceil(finalValue / 20);
        
        const timer = setInterval(() => {
            currentValue += increment;
            if (currentValue >= finalValue) {
                currentValue = finalValue;
                clearInterval(timer);
            }
            item.textContent = currentValue;
        }, 50);
    });
}

// 페이지 스크롤 진행률 표시 (선택사항)
function addScrollProgress() {
    const progressBar = document.createElement('div');
    progressBar.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 0%;
        height: 3px;
        background: linear-gradient(90deg, #f4a261, #e76f51);
        z-index: 9999;
        transition: width 0.1s ease;
    `;
    document.body.appendChild(progressBar);
    
    window.addEventListener('scroll', function() {
        const scrollTop = window.pageYOffset;
        const documentHeight = document.documentElement.scrollHeight - window.innerHeight;
        const scrollPercent = (scrollTop / documentHeight) * 100;
        progressBar.style.width = scrollPercent + '%';
    });
}

// 이미지 로드 에러 처리
function handleImageErrors() {
    const images = document.querySelectorAll('img');
    
    images.forEach(img => {
        img.addEventListener('error', function() {
            // 이미지 로드 실패 시 플레이스홀더 표시
            this.style.backgroundColor = '#f0f0f0';
            this.style.display = 'flex';
            this.style.alignItems = 'center';
            this.style.justifyContent = 'center';
            this.style.color = '#999';
            this.style.fontSize = '14px';
            this.style.border = '2px dashed #ddd';
            this.alt = '이미지를 준비 중입니다';
        });
    });
}

// 터치 디바이스에서 hover 효과 개선
function improveTouchExperience() {
    if ('ontouchstart' in window) {
        const hoverElements = document.querySelectorAll('.party-card, .gallery-item, .nav-item');
        
        hoverElements.forEach(element => {
            element.addEventListener('touchstart', function() {
                this.classList.add('touch-active');
            });
            
            element.addEventListener('touchend', function() {
                setTimeout(() => {
                    this.classList.remove('touch-active');
                }, 300);
            });
        });
        
        // 터치 활성화 스타일 추가
        const touchStyle = document.createElement('style');
        touchStyle.textContent = `
            .touch-active {
                transform: scale(0.95) !important;
                transition: transform 0.1s ease !important;
            }
        `;
        document.head.appendChild(touchStyle);
    }
}

// 페이지 로드 완료 시 실행
document.addEventListener('DOMContentLoaded', function() {
    // 카운트다운 시작
    updateCountdown();
    setInterval(updateCountdown, 60000); // 1분마다 업데이트
    
    // 네비게이션 이벤트 설정
    handleNavigation();
    
    // 스크롤 애니메이션 추가
    addScrollAnimations();
    
    // 갤러리 이미지 이벤트 설정
    handleGalleryImages();
    
    // 활성 네비게이션 스타일 추가
    addActiveNavStyles();
    
    // 활성 네비게이션 업데이트
    updateActiveNavigation();
    
    // 타임라인 애니메이션
    animateTimelineItems();
    
    // Hero 섹션 애니메이션
    animateHeroSection();
    
    // 스크롤 진행률 표시
    addScrollProgress();
    
    // 이미지 에러 처리
    handleImageErrors();
    
    // 터치 경험 개선
    improveTouchExperience();
    
    // 배경음악 초기화
    initBackgroundMusic();
    
    // 라이트박스 초기화
    initLightbox();
    
    // 카운트다운 숫자 애니메이션 (5초 후 실행)
    setTimeout(() => {
        const countdownSection = document.getElementById('date');
        if (countdownSection) {
            const observer = new IntersectionObserver(function(entries) {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        animateCountdownNumbers();
                        observer.unobserve(entry.target);
                    }
                });
            }, { threshold: 0.5 });
            
            observer.observe(countdownSection);
        }
    }, 1000);
});

// 브라우저 지원 체크 및 폴백
if (!window.IntersectionObserver) {
    // IntersectionObserver 미지원 브라우저를 위한 폴백
    console.warn('IntersectionObserver not supported. Some animations may not work.');
    
    // 모든 애니메이션 요소를 즉시 표시
    setTimeout(() => {
        const hiddenElements = document.querySelectorAll('[style*="opacity: 0"]');
        hiddenElements.forEach(element => {
            element.style.opacity = '1';
            element.style.transform = 'translateY(0)';
        });
    }, 100);
}

// 성능 최적화: 스크롤 이벤트 쓰로틀링
function throttle(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// 배경음악 제어
function initBackgroundMusic() {
    const audio = document.getElementById('background-music');
    const musicBtn = document.getElementById('music-toggle');
    
    if (!audio || !musicBtn) return;
    
    let isPlaying = false;
    
    // 음악 버튼 클릭 이벤트
    musicBtn.addEventListener('click', function() {
        if (isPlaying) {
            audio.pause();
            musicBtn.textContent = '🔇';
            musicBtn.classList.add('muted');
            isPlaying = false;
        } else {
            audio.play().catch(function(error) {
                console.log('음악 재생 실패:', error);
            });
            musicBtn.textContent = '🎵';
            musicBtn.classList.remove('muted');
            isPlaying = true;
        }
    });
    
    // 첫 번째 사용자 상호작용 후 자동 재생 시도 (개선)
    function tryAutoPlay() {
        if (!isPlaying) {
            audio.play().then(function() {
                musicBtn.textContent = '🎵';
                musicBtn.classList.remove('muted');
                isPlaying = true;
                console.log('자동 재생 성공!');
            }).catch(function(error) {
                console.log('자동 재생 실패 (브라우저 정책):', error);
                // 버튼을 깜빡여서 사용자에게 알림
                musicBtn.style.animation = 'pulse 2s infinite';
            });
        }
    }
    
    // 페이지 로드 시 즉시 자동재생 시도
    setTimeout(tryAutoPlay, 1000);
    
    // 다양한 이벤트에서 자동재생 시도
    ['click', 'touchstart', 'keydown', 'scroll'].forEach(eventType => {
        document.addEventListener(eventType, tryAutoPlay, { once: true });
    });
    
    // 음악 로드 에러 처리
    audio.addEventListener('error', function() {
        console.log('음악 파일을 로드할 수 없습니다.');
        // musicBtn.style.display = 'none'; // 버튼 숨기지 않음
    });
    
    // 볼륨 설정 (30% - 부드럽게)
    audio.volume = 0.3;
}

// 라이트박스 초기화
function initLightbox() {
    const lightbox = document.getElementById('lightbox');
    const lightboxImage = document.getElementById('lightbox-image');
    const lightboxCurrent = document.getElementById('lightbox-current');
    const lightboxTotal = document.getElementById('lightbox-total');
    const closeBtn = document.querySelector('.lightbox-close');
    const prevBtn = document.querySelector('.lightbox-prev');
    const nextBtn = document.querySelector('.lightbox-next');
    const backdrop = document.querySelector('.lightbox-backdrop');
    
    let currentImageIndex = 0;
    const galleryImages = [
        'assets/images/gallery/gallery-1.jpg',
        'assets/images/gallery/gallery-2.jpg',
        'assets/images/gallery/gallery-3.jpg',
        'assets/images/gallery/gallery-4.jpg',
        'assets/images/gallery/gallery-5.jpg',
        'assets/images/gallery/gallery-6.jpg',
        'assets/images/gallery/gallery-7.jpg',
        'assets/images/gallery/gallery-8.jpg',
        'assets/images/gallery/gallery-9.jpg'
    ];
    
    // 전역 함수로 설정 (HTML onclick에서 호출)
    window.openLightbox = function(index) {
        currentImageIndex = index;
        showLightboxImage();
        lightbox.classList.add('active');
        document.body.style.overflow = 'hidden'; // 스크롤 막기
    };
    
    function showLightboxImage() {
        lightboxImage.src = galleryImages[currentImageIndex];
        lightboxCurrent.textContent = currentImageIndex + 1;
        lightboxTotal.textContent = galleryImages.length;
    }
    
    function closeLightbox() {
        lightbox.classList.remove('active');
        document.body.style.overflow = ''; // 스크롤 복원
    }
    
    function nextImage() {
        currentImageIndex = (currentImageIndex + 1) % galleryImages.length;
        showLightboxImage();
    }
    
    function prevImage() {
        currentImageIndex = (currentImageIndex - 1 + galleryImages.length) % galleryImages.length;
        showLightboxImage();
    }
    
    // 이벤트 리스너
    closeBtn.addEventListener('click', closeLightbox);
    nextBtn.addEventListener('click', nextImage);
    prevBtn.addEventListener('click', prevImage);
    backdrop.addEventListener('click', closeLightbox);
    
    // 키보드 이벤트
    document.addEventListener('keydown', function(e) {
        if (!lightbox.classList.contains('active')) return;
        
        switch(e.key) {
            case 'Escape':
                closeLightbox();
                break;
            case 'ArrowLeft':
                prevImage();
                break;
            case 'ArrowRight':
                nextImage();
                break;
        }
    });
    
    // 터치/스와이프 지원
    let touchStartX = 0;
    let touchEndX = 0;
    
    lightbox.addEventListener('touchstart', function(e) {
        touchStartX = e.changedTouches[0].screenX;
    });
    
    lightbox.addEventListener('touchend', function(e) {
        touchEndX = e.changedTouches[0].screenX;
        handleSwipe();
    });
    
    function handleSwipe() {
        const swipeThreshold = 50;
        const diff = touchStartX - touchEndX;
        
        if (Math.abs(diff) > swipeThreshold) {
            if (diff > 0) {
                nextImage(); // 왼쪽으로 스와이프 = 다음 이미지
            } else {
                prevImage(); // 오른쪽으로 스와이프 = 이전 이미지
            }
        }
    }
}

// 리사이즈 이벤트 핸들링
window.addEventListener('resize', throttle(function() {
    // 모바일 뷰포트 높이 조정
    const vh = window.innerHeight * 0.01;
    document.documentElement.style.setProperty('--vh', `${vh}px`);
}, 100));
