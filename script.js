
    

   
        // Данные товаров
        const products = [
            {
                image: "https://avatars.mds.yandex.net/i?id=6deff19a2722275b9a03f50d8bb4ff17325aa20d-9103674-images-thumbs&n=13",
                price: "48θρ/сутки",
                title: "Личность на антимага"
            },
            {
                image: "https://avatars.mds.yandex.net/i?id=6deff19a2722275b9a03f50d8bb4ff17325aa20d-9103674-images-thumbs&n=13",
                price: "48θρ/сутки",
                title: "Аркана на фантомку"
            },
            {
                image: "https://avatars.mds.yandex.net/i?id=6deff19a2722275b9a03f50d8bb4ff17325aa20d-9103674-images-thumbs&n=13",
                price: "48θρ/сутки",
                title: "Аркана на цику"
            },
            {
                image: "https://avatars.mds.yandex.net/i?id=6deff19a2722275b9a03f50d8bb4ff17325aa20d-9103674-images-thumbs&n=13",
                price: "50θρ/сутки",
                title: "Комплект на PA"
            },
            {
                image: "https://avatars.mds.yandex.net/i?id=6deff19a2722275b9a03f50d8bb4ff17325aa20d-9103674-images-thumbs&n=13",
                price: "45θρ/сутки",
                title: "Скин на Juggernaut"
            },
            {
                image: "https://avatars.mds.yandex.net/i?id=6deff19a2722275b9a03f50d8bb4ff17325aa20d-9103674-images-thumbs&n=13",
                price: "55θρ/сутки",
                title: "Аркана на Rubick"
            }
        ];
        
        // Переменные слайдера
        let currentIndex = 0;
        let slideWidth = 0;
        let slidesToShow = 3;
        let sliderTrack = document.getElementById('sliderTrack');
        let autoSlideInterval;
        
        // Инициализация слайдера
        function initSlider() {
            // Определяем количество отображаемых слайдов в зависимости от ширины экрана
            if (window.innerWidth < 992 && window.innerWidth >= 576) {
                slidesToShow = 2;
            } else if (window.innerWidth < 576) {
                slidesToShow = 1;
            } else {
                slidesToShow = 3;
            }
            
            // Очищаем трек
            sliderTrack.innerHTML = '';
            
            // Добавляем клоны для бесконечной прокрутки
            const startClones = products.slice(-slidesToShow).map(createProductCard);
            const endClones = products.slice(0, slidesToShow).map(createProductCard);
            
            // Добавляем клоны и основные карточки в трек
            startClones.forEach(card => sliderTrack.appendChild(card));
            products.forEach(product => {
                sliderTrack.appendChild(createProductCard(product));
            });
            endClones.forEach(card => sliderTrack.appendChild(card));
            
            // Устанавливаем начальную позицию
            currentIndex = slidesToShow;
            slideWidth = document.querySelector('.product-card').offsetWidth + 20; // + margin
            updateSliderPosition();
            
            // Запускаем автопрокрутку
            startAutoSlide();
        }
        
        // Создание карточки товара
        function createProductCard(product) {
            const card = document.createElement('div');
            card.className = 'product-card';
            card.innerHTML = `
                <img src="${product.image}" alt="${product.title}" class="product-image">
                <div class="product-price">${product.price}</div>
                <div class="product-title">${product.title}</div>
            `;
            return card;
        }
        
        // Обновление позиции слайдера
        function updateSliderPosition() {
            sliderTrack.style.transform = `translateX(-${currentIndex * slideWidth}px)`;
        }
        
        // Перемещение слайдера
        function moveSlider(direction) {
            // Останавливаем автопрокрутку при ручном управлении
            stopAutoSlide();
            
            currentIndex += direction;
            updateSliderPosition();
            
            // Проверка на достижение конца/начала для бесконечной прокрутки
            const totalSlides = products.length + 2 * slidesToShow;
            
            if (currentIndex <= 0) {
                setTimeout(() => {
                    currentIndex = products.length + slidesToShow;
                    sliderTrack.style.transition = 'none';
                    updateSliderPosition();
                    setTimeout(() => {
                        sliderTrack.style.transition = 'transform 0.5s ease';
                    }, 50);
                }, 500);
            } else if (currentIndex >= totalSlides - slidesToShow) {
                setTimeout(() => {
                    currentIndex = slidesToShow;
                    sliderTrack.style.transition = 'none';
                    updateSliderPosition();
                    setTimeout(() => {
                        sliderTrack.style.transition = 'transform 0.5s ease';
                    }, 50);
                }, 500);
            }
            
            // Перезапускаем автопрокрутку
            startAutoSlide();
        }
        
        // Автопрокрутка
        function startAutoSlide() {
            stopAutoSlide();
            autoSlideInterval = setInterval(() => {
                moveSlider(1);
            }, 3000);
        }
        
        function stopAutoSlide() {
            clearInterval(autoSlideInterval);
        }
        
        // Обработчики событий
        window.addEventListener('resize', () => {
            initSlider();
        });
        
        // Инициализация при загрузке
        document.addEventListener('DOMContentLoaded', initSlider);
    