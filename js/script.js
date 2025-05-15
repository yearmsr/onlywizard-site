document.addEventListener('DOMContentLoaded', () => {

    console.log('Сайт Only Wizard загружен!');

    // --- Автоматическое обновление года в копирайте ---
    const yearSpan = document.getElementById('currentYear');
    if (yearSpan) {
        yearSpan.textContent = new Date().getFullYear();
    }
    // --- КОНЕЦ Обновление года ---

    // --- Функционал Бургер-меню ---
    const burgerButton = document.querySelector('.burger-menu');
    const mobileMenu = document.getElementById('mobileMenu');
    if (burgerButton && mobileMenu) {
        burgerButton.addEventListener('click', () => {
            burgerButton.classList.toggle('is-active');
            mobileMenu.classList.toggle('is-active');
            const isExpanded = burgerButton.getAttribute('aria-expanded') === 'true';
            burgerButton.setAttribute('aria-expanded', !isExpanded);
        });
        mobileMenu.querySelectorAll('a').forEach(link => {
            link.addEventListener('click', () => {
                if (mobileMenu.classList.contains('is-active')) {
                    burgerButton.classList.remove('is-active');
                    mobileMenu.classList.remove('is-active');
                    burgerButton.setAttribute('aria-expanded', 'false');
                }
            });
        });
    }
    // --- КОНЕЦ Бургер-меню ---

    // --- Функционал ТОЛЬКО для Блока 2 (Клубы/Филиалы) ---
    // Используем ID блока #block2 для специфичности селекторов
    const block2 = document.getElementById('block2');
    if (block2) { // Проверяем, существует ли Блок 2
        const locationTabsBlock2 = block2.querySelectorAll('.location-tabs .tab-button'); // Кнопки ТОЛЬКО в Блоке 2
        const locationContentsBlock2 = block2.querySelectorAll('.location-content-area .location-content'); // Контент ТОЛЬКО в Блоке 2
        const contentAreaBlock2 = block2.querySelector('.location-content-area'); // Область контента ТОЛЬКО в Блоке 2

        if (locationTabsBlock2.length > 0 && locationContentsBlock2.length > 0 && contentAreaBlock2) {

            // 1. Переключение табов филиалов в Блоке 2
            locationTabsBlock2.forEach(tab => {
                tab.addEventListener('click', () => {
                    const targetLocation = tab.dataset.location;
                    if (!targetLocation) return;

                    // Деактивируем все основные табы и их контент
                    locationTabsBlock2.forEach(t => t.classList.remove('active'));
                    locationContentsBlock2.forEach(c => c.classList.remove('active'));
                    
                    // Также деактивируем все вложенные sub-content и их активаторы (zone-selector)
                    contentAreaBlock2.querySelectorAll('.sub-content').forEach(subContent => subContent.classList.remove('active'));
                    contentAreaBlock2.querySelectorAll('.zone-selector').forEach(sel => sel.classList.remove('active'));
                    contentAreaBlock2.querySelectorAll('.zone-info').forEach(info => info.classList.remove('active'));
                    // Сбрасываем активные .sub-tab-button, чтобы при переключении филиала они не оставались "нажатыми"
                    contentAreaBlock2.querySelectorAll('.sub-tab-button').forEach(subBtn => subBtn.classList.remove('active'));


                    // Активируем кликнутый таб и его контент
                    tab.classList.add('active');
                    const targetContent = block2.querySelector(`#content-${targetLocation}`); // Ищем ID внутри Блока 2
                    if (targetContent) {
                        targetContent.classList.add('active');
                        
                        // При смене филиала, если есть блок железа, активируем первую зону по умолчанию
                        const hardwareSubContent = targetContent.querySelector('.sub-content[data-type="hardware"]');
                        if (hardwareSubContent) {
                            const defaultZoneSelector = hardwareSubContent.querySelector('.zone-selector');
                            const defaultZoneInfo = hardwareSubContent.querySelector('.zone-info');
                            if (defaultZoneSelector) defaultZoneSelector.classList.add('active');
                            if (defaultZoneInfo) defaultZoneInfo.classList.add('active');
                        }
                    }
                });
            }); // Конец forEach для locationTabs

            // 2. Обработчик кликов внутри контентной области Блока 2 (делегирование событий)
            contentAreaBlock2.addEventListener('click', (event) => {
                const parentContentBlock = event.target.closest('.location-content'); // Находим родительский .location-content для текущего клика
                if (!parentContentBlock) return; // Если клик был не внутри .location-content, выходим

                // А. Клик по кнопке "Цены", "Железо", "Связаться" (.sub-tab-button)
                if (event.target.matches('.sub-tab-button')) {
                    const button = event.target;
                    const contentToShow = button.dataset.content;

                    if (contentToShow) {
                        const targetSubContent = parentContentBlock.querySelector(`.sub-content[data-type="${contentToShow}"]`);
                        const isButtonAlreadyActive = button.classList.contains('active');

                        // Сначала деактивируем ВСЕ кнопки sub-tab и ВСЕ блоки sub-content внутри текущего родительского блока
                        parentContentBlock.querySelectorAll('.sub-tab-button').forEach(btn => {
                            btn.classList.remove('active');
                        });
                        parentContentBlock.querySelectorAll('.sub-content').forEach(sc => {
                            sc.classList.remove('active');
                        });

                        // Если нажатая кнопка НЕ была уже активной (или ни одна кнопка не была активной),
                        // тогда делаем ее и ее контент активными.
                        // Если она УЖЕ была активной, повторное нажатие ее деактивирует (и ее контент уже был скрыт выше).
                        if (!isButtonAlreadyActive) {
                            button.classList.add('active');
                            if (targetSubContent) {
                                targetSubContent.classList.add('active');
                            }
                        }
                        // Если isButtonAlreadyActive было true, то кнопка и ее контент теперь неактивны (очищены выше).
                        // Это обрабатывает как выбор новой вкладки, так и отключение текущей вкладки.
                    }
                }

                // Б. Клик по селектору зоны (.zone-selector) внутри блока "Железо"
                else if (event.target.matches('.sub-content[data-type="hardware"] .zone-selector')) {
                    const clickedSelector = event.target;
                    const targetZone = clickedSelector.dataset.zone;
                    const hardwareBlock = clickedSelector.closest('.sub-content[data-type="hardware"]');

                    if (hardwareBlock && targetZone) {
                        // Убираем active со всех селекторов зон ВНУТРИ ЭТОГО БЛОКА железа
                        hardwareBlock.querySelectorAll('.zone-selector').forEach(sel => sel.classList.remove('active'));
                        // Добавляем active кликнутому селектору
                        clickedSelector.classList.add('active');

                        // Убираем active со всех блоков с информацией о зонах ВНУТРИ ЭТОГО БЛОКА железа
                        hardwareBlock.querySelectorAll('.zone-hardware-details .zone-info').forEach(info => info.classList.remove('active'));
                        // Находим и показываем нужный блок с информацией
                        const targetInfoBlock = hardwareBlock.querySelector(`.zone-hardware-details .zone-info[data-zone-details="${targetZone}"]`);
                        if (targetInfoBlock) {
                            targetInfoBlock.classList.add('active');
                        }
                    }
                }
            }); // Конец обработчика для contentAreaBlock2
        } // Конец if для элементов Блока 2
    } // Конец if (block2)
    // --- КОНЕЦ Функционала для Блока 2 ---

    // --- Функционал ТОЛЬКО для Блока 3 (Бар/Снеки) ---
    const block3 = document.getElementById('block3');
    if (block3) {
        const barCarousels = block3.querySelectorAll('.bar-carousel');
        barCarousels.forEach(carouselElement => {
            if (carouselElement) {
                new Swiper(carouselElement, { direction: 'horizontal', loop: true, autoplay: { delay: 3500, disableOnInteraction: false, pauseOnMouseEnter: true, }, slidesPerView: 1, spaceBetween: 0, });
            }
        });

        const barLocationTabs = block3.querySelectorAll('.bar-location-tabs .tab-button');
        const barContents = block3.querySelectorAll('.bar-content-area .bar-location-content');
        const barContentArea = block3.querySelector('.bar-content-area');

        if (barLocationTabs.length > 0 && barContents.length > 0 && barContentArea) {
            
            const setDefaultCategories = (activeLocationContent) => {
                if (!activeLocationContent) return;

                // Для колонки напитков
                const drinksColumn = activeLocationContent.querySelector('.drinks-column');
                if (drinksColumn) {
                    drinksColumn.querySelectorAll('.bar-category-button').forEach(btn => btn.classList.remove('active'));
                    drinksColumn.querySelectorAll('.bar-category-content').forEach(cont => cont.classList.remove('active'));
                    
                    const firstDrinkCategoryButton = drinksColumn.querySelector('.bar-category-button');
                    if (firstDrinkCategoryButton) {
                        firstDrinkCategoryButton.classList.add('active');
                        const category = firstDrinkCategoryButton.dataset.category;
                        const correspondingContent = drinksColumn.querySelector(`.bar-category-content[data-category-details="${category}"]`);
                        if (correspondingContent) correspondingContent.classList.add('active');
                    }
                }
                // Для колонки снеков
                const snacksColumn = activeLocationContent.querySelector('.snacks-column');
                if (snacksColumn) {
                    snacksColumn.querySelectorAll('.bar-category-button').forEach(btn => btn.classList.remove('active'));
                    snacksColumn.querySelectorAll('.bar-category-content').forEach(cont => cont.classList.remove('active'));

                    const firstSnackCategoryButton = snacksColumn.querySelector('.bar-category-button');
                    if (firstSnackCategoryButton) {
                        firstSnackCategoryButton.classList.add('active');
                        const category = firstSnackCategoryButton.dataset.category;
                        const correspondingContent = snacksColumn.querySelector(`.bar-category-content[data-category-details="${category}"]`);
                        if (correspondingContent) correspondingContent.classList.add('active');
                    }
                }
            };

            // Переключение основных табов филиалов
            barLocationTabs.forEach(tab => {
                tab.addEventListener('click', () => {
                    const targetBarLocation = tab.dataset.targetBar;
                    if (!targetBarLocation) return;

                    barLocationTabs.forEach(t => t.classList.remove('active'));
                    tab.classList.add('active');

                    barContents.forEach(content => content.classList.remove('active'));
                    const targetContent = barContentArea.querySelector(`.bar-location-content[data-bar-location="${targetBarLocation}"]`);
                    if (targetContent) {
                        targetContent.classList.add('active');
                        setDefaultCategories(targetContent); // Активируем дефолтные категории для нового филиала
                    }
                });
            });

            // Делегирование событий для кнопок категорий внутри .bar-content-area
            barContentArea.addEventListener('click', (event) => {
                if (event.target.matches('.bar-category-button')) {
                    const clickedButton = event.target;
                    const categoryType = clickedButton.dataset.category;
                    // Ищем родительскую колонку (.drinks-column или .snacks-column)
                    const parentSnacksColumn = clickedButton.closest('.bar-snacks-column'); 

                    if (parentSnacksColumn && categoryType) {
                        // Деактивируем все кнопки и контент ВНУТРИ ЭТОЙ КОЛОНКИ
                        parentSnacksColumn.querySelectorAll('.bar-category-button').forEach(btn => btn.classList.remove('active'));
                        parentSnacksColumn.querySelectorAll('.bar-category-content').forEach(content => content.classList.remove('active'));

                        // Активируем нажатую кнопку
                        clickedButton.classList.add('active');

                        // Активируем соответствующий контент
                        const targetContent = parentSnacksColumn.querySelector(`.bar-category-content[data-category-details="${categoryType}"]`);
                        if (targetContent) {
                            targetContent.classList.add('active');
                        }
                    }
                }
            });

            // Инициализация дефолтных категорий для активного по умолчанию филиала при загрузке страницы
            const initialActiveLocationContent = block3.querySelector('.bar-location-content.active');
            if (initialActiveLocationContent) {
                setDefaultCategories(initialActiveLocationContent);
            }
        }
    }
    // --- КОНЕЦ Функционала для Блока 3 ---

    // --- Функционал для Блока 4 (Галерея Lounge Bar) ---
    const loungeGallery = document.querySelector('.lounge-gallery');
    if (loungeGallery) {
        new Swiper(loungeGallery, { direction: 'horizontal', loop: true, slidesPerView: 1, spaceBetween: 20, breakpoints: { 768: { slidesPerView: 2, spaceBetween: 25 }, 992: { slidesPerView: 3, spaceBetween: 30 } }, navigation: { nextEl: '.lounge-arrow-next', prevEl: '.lounge-arrow-prev', }, });
    }
    // --- КОНЕЦ Функционала для Блока 4 ---

    // --- Функционал ТОЛЬКО для Блока 5 (Акции) ---
    const block5 = document.getElementById('block5');
    if (block5) {
        const promoLocationTabs = block5.querySelectorAll('.promo-location-tabs .tab-button');
        const promoContents = block5.querySelectorAll('.promo-content-area .promo-location-content');
        const promoContentArea = block5.querySelector('.promo-content-area');

        if (promoLocationTabs.length > 0 && promoContents.length > 0 && promoContentArea) {
            promoLocationTabs.forEach(tab => {
                tab.addEventListener('click', () => {
                    const targetPromoLocation = tab.dataset.targetPromo;
                    if (!targetPromoLocation) return;
                    promoLocationTabs.forEach(t => t.classList.remove('active'));
                    tab.classList.add('active');
                    promoContents.forEach(content => content.classList.remove('active'));
                    const targetContent = promoContentArea.querySelector(`.promo-location-content[data-promo-location="${targetPromoLocation}"]`);
                    if (targetContent) {
                        targetContent.classList.add('active');
                        const firstPromoItem = targetContent.querySelector('.promo-list-item');
                        // const firstPromoDetails = targetContent.querySelector('.promo-details'); // Удалено, так как активация по ID надежнее
                        targetContent.querySelectorAll('.promo-list-item').forEach(item => item.classList.remove('active'));
                        targetContent.querySelectorAll('.promo-details').forEach(detail => detail.classList.remove('active'));
                        if (firstPromoItem) {
                            firstPromoItem.classList.add('active');
                             // Активируем соответствующий .promo-details
                            const correspondingDetails = targetContent.querySelector(`.promo-details[data-promo-details-id="${firstPromoItem.dataset.promoId}"]`);
                            if(correspondingDetails) correspondingDetails.classList.add('active');
                        }
                    }
                });
            });
        }

        if (promoContentArea) {
            promoContentArea.addEventListener('click', (event) => {
                const clickedPromoItem = event.target.closest('.promo-list-item');
                if (clickedPromoItem) {
                    const parentContentBlock = clickedPromoItem.closest('.promo-location-content');
                    if (!parentContentBlock) return;
                    const promoId = clickedPromoItem.dataset.promoId;
                    if (!promoId) return;
                    parentContentBlock.querySelectorAll('.promo-list-item').forEach(item => item.classList.remove('active'));
                    clickedPromoItem.classList.add('active');
                    parentContentBlock.querySelectorAll('.promo-details-column .promo-details').forEach(detail => detail.classList.remove('active'));
                    const targetDetails = parentContentBlock.querySelector(`.promo-details-column .promo-details[data-promo-details-id="${promoId}"]`);
                    if (targetDetails) targetDetails.classList.add('active');
                }
            });
        }
    }
    // --- КОНЕЦ Функционала для Блока 5 ---

    // --- Функционал для Блока 7 (Отзывы) ---
    const block7 = document.getElementById('block7');
    if (block7) {
        const reviewsSwiperElement = block7.querySelector('.reviews-swiper');
        if (reviewsSwiperElement) {
            new Swiper(reviewsSwiperElement, {
                direction: 'horizontal',
                loop: true, // Бесконечная прокрутка
                slidesPerView: 1, // По умолчанию 1 слайд
                spaceBetween: 20, // Отступ между слайдами
                grabCursor: true, // Курсор в виде руки
                autoplay: {
                    delay: 4000, // Задержка в мс
                    disableOnInteraction: false, // Не останавливать при ручном переключении
                    pauseOnMouseEnter: true,     // Пауза при наведении мыши
                },
                // Пагинация (если раскомментируете в HTML)
                /* pagination: {
                    el: '.reviews-pagination',
                    clickable: true,
                }, */
                // Адаптивность для количества слайдов
                breakpoints: {
                    // >= 768px
                    768: {
                      slidesPerView: 2,
                      spaceBetween: 25
                    },
                    // >= 1024px (или 992px, как у вас в других блоках)
                    1024: {
                      slidesPerView: 3,
                      spaceBetween: 30
                    }
                }
            });
        }
    }
    // --- КОНЕЦ Функционала для Блока Отзывов ---

    // --- Функционал ТОЛЬКО для Блока 8 (Контакты и Карта) ---
    const block8 = document.getElementById('block8');
    if (block8) {
        const contactLocationTabs = block8.querySelectorAll('.contact-location-tabs .tab-button');
        const contactDetailItems = block8.querySelectorAll('.contact-details .contact-detail-item');
        const mapElementId = 'yandex-map';
        const locationsData = {
            'yamasheva-contact': { coords: [55.826028, 49.148805], zoom: 17, hint: 'Only Wizard на Ямашева', balloon: '<strong>Only Wizard</strong><br>г. Казань, пр. Ямашева, д. 93<br>Круглосуточно' },
            'prospekt-contact': { coords: [55.768891, 49.220832], zoom: 17, hint: 'Only Wizard на Проспекте', balloon: '<strong>Only Wizard</strong><br>г. Казань, пр. Победы, д. 100<br>Круглосуточно' },
            'zelenodolsk-contact': { coords: [55.854673, 48.503330], zoom: 17, hint: 'Only Wizard в Зеленодольске', balloon: '<strong>Only Wizard</strong><br>г. Зеленодольск, ул. Татарстана, д. 30<br>Круглосуточно' }
        };
        let myMap;

        function initMap() {
            if (!document.getElementById(mapElementId)) { console.error("Элемент карты #" + mapElementId + " не найден!"); return; }
            console.log("Инициализация карты...");
            ymaps.borders.load('RU', { lang: 'ru', quality: 2 }).then(function (result) {
                 fetch('js/map_style.json') // Убедитесь, что map_style.json находится в папке js
                     .then(response => { if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`); return response.json(); })
                     .then(customStyle => {
                         console.log("Стиль карты JSON успешно загружен.");
                         createMapInstance(locationsData['yamasheva-contact'], customStyle);
                     })
                     .catch(error => {
                         console.error("Ошибка загрузки/применения стиля карты (JSON). Используется упрощенный вид:", error);
                         createMapInstance(locationsData['yamasheva-contact'], null); // null вместо undefined для customStyle
                     });
            }).catch(error => {
                 console.error("Ошибка загрузки границ Яндекса:", error);
                 createMapInstance(locationsData['yamasheva-contact'], null); // null вместо undefined
            });
        }

       function createMapInstance(initialLocationData, customStyle) {
           if (myMap) return; // Предотвращаем повторную инициализацию
            try {
                myMap = new ymaps.Map(mapElementId, { 
                        center: initialLocationData.coords, 
                        zoom: initialLocationData.zoom, 
                        controls: ['zoomControl', 'fullscreenControl'] 
                    },
                    { 
                        searchControlProvider: 'yandex#search', 
                        // Если customStyle существует, передаем его как опцию styles
                        ...(customStyle && { styles: customStyle }) // ИЗМЕНЕНО: json на styles
                    }
                );
                console.log("Экземпляр карты создан.");
                // Если customStyle не был применен (например, ошибка загрузки), можно установить базовый темный фон
                if (!customStyle && myMap.options) { // Добавлена проверка myMap.options
                     console.log("Применяется базовый темный фон карты, так как кастомный стиль не загружен.");
                     myMap.options.set('mapStateAutoApply', true); // Может помочь с применением опций
                     // Вместо mapBackgroundColor, который влияет на фон контейнера, а не на тайлы,
                     // лучше полагаться на стили или не делать ничего, если стили не загрузились,
                     // так как стандартная карта без стилей будет отображаться.
                     // myMap.options.set('mapBackgroundColor', '#1a1a1a'); // Эта опция имеет ограниченное влияние
                }
                finalizeMapSetup(initialLocationData);
            } catch (e) { console.error("Критическая ошибка при создании карты:", e); }
       }

      function finalizeMapSetup(locationData) {
           if (!myMap) return;
           console.log("Завершение настройки карты для:", locationData.hint);
           addPlacemark(locationData);
           myMap.controls.remove('geolocationControl'); myMap.controls.remove('searchControl'); myMap.controls.remove('trafficControl'); myMap.controls.remove('typeSelector'); myMap.controls.remove('rulerControl'); myMap.controls.remove('routeButtonControl');
           console.log("Лишние контролы карты удалены.");
      }

      function addPlacemark(locationData) {
           if (!myMap || !locationData || !locationData.coords) { console.error("Невозможно добавить метку: карта не готова или неверные данные локации.", locationData); return; }
           console.log("Добавление кастомной метки для:", locationData.hint, "Координаты:", locationData.coords);
           const CustomPlacemarkLayout = ymaps.templateLayoutFactory.createClass('<div class="custom-placemark-layout"><div class="custom-placemark"></div></div>');
           const placemark = new ymaps.Placemark(locationData.coords, { hintContent: locationData.hint, balloonContent: locationData.balloon },
               { iconLayout: CustomPlacemarkLayout, iconShape: { type: 'Circle', coordinates: [0, 0], radius: 10 } }
           );
           myMap.geoObjects.removeAll();
           myMap.geoObjects.add(placemark);
           console.log("Кастомная метка добавлена.");
       }

        // Инициализация карты после загрузки API Яндекс.Карт
        if (typeof ymaps !== 'undefined') {
            ymaps.ready(initMap);
        } else {
            console.error("API Яндекс.Карт не загружено.");
            // Можно добавить обработку, если API не загрузится, например, показать сообщение пользователю
        }


        if (contactLocationTabs.length > 0 && contactDetailItems.length > 0) {
            contactLocationTabs.forEach(tab => {
                tab.addEventListener('click', () => {
                    const targetContactLocation = tab.dataset.targetContact;
                    if (!targetContactLocation || !locationsData[targetContactLocation]) return;
                    contactLocationTabs.forEach(t => t.classList.remove('active'));
                    tab.classList.add('active');
                    contactDetailItems.forEach(item => item.classList.remove('active'));
                    const targetDetail = block8.querySelector(`.contact-detail-item[data-contact-details="${targetContactLocation}"]`);
                    if (targetDetail) targetDetail.classList.add('active');
                    
                    const newLocationData = locationsData[targetContactLocation];
                    if (myMap && newLocationData && newLocationData.coords) {
                        myMap.panTo(newLocationData.coords, { flying: true, duration: 800 })
                        .then(() => {
                            if (myMap.getZoom() !== newLocationData.zoom) {
                                myMap.setZoom(newLocationData.zoom, { duration: 300 });
                            }
                            addPlacemark(newLocationData); // Обновляем метку после панорамирования и зума
                         }).catch(error => {
                              console.error("Ошибка анимации panTo:", error);
                              // В случае ошибки просто устанавливаем центр и зум
                              myMap.setCenter(newLocationData.coords, newLocationData.zoom);
                              addPlacemark(newLocationData);
                         });
                    } else if (!myMap && newLocationData) {
                        // Если карта еще не инициализирована (маловероятно, если initMap уже вызывался),
                        // можно попробовать инициализировать ее здесь, но это может привести к проблемам с асинхронностью.
                        // Лучше убедиться, что initMap вызывается корректно.
                        console.warn("Карта не инициализирована, попытка переключения локации отложена.");
                        // Можно сохранить newLocationData и применить после инициализации карты,
                        // либо вызвать initMap с новыми данными (но это создаст новую карту, что нежелательно).
                        // В текущей логике, если myMap нет, ничего не произойдет, что неидеально.
                        // Правильнее было бы, чтобы к моменту клика на таб карта уже была.
                        // Однако, если ymaps.ready(initMap) уже был, myMap должен быть создан.
                        // Этот else if (!myMap && newLocationData) может быть избыточен или указывать на проблему с инициализацией.
                        // Удаляем initializeSimpleMap, так как основная карта должна быть уже создана
                    }
                });
            });
        }
    }
    // --- КОНЕЦ Функционала для Блока 8 ---

    // --- Функционал для Блока 9 (FAQ) ---
    const block9 = document.getElementById('block9');
    if (block9) {
        const faqQuestions = block9.querySelectorAll('.faq-question'); // Теперь ищем только вопросы
        const faqCountSpan = document.getElementById('faq-count');

        if (faqCountSpan && faqQuestions.length > 0) {
            faqCountSpan.textContent = faqQuestions.length;
        } else if (faqCountSpan) {
             faqCountSpan.textContent = '0'; 
        }

        faqQuestions.forEach(question => {
            // Ответ теперь является следующим элементом после вопроса
            const answer = question.nextElementSibling; 
            // const arrow = question.querySelector('.faq-arrow'); // Стрелка остается внутри вопроса

            if (answer && answer.classList.contains('faq-answer')) { // Убедимся, что следующий элемент - это ответ
                question.addEventListener('click', () => {
                    // Опционально: Закрыть все другие открытые ответы (режим аккордеона)
                    /*
                    faqQuestions.forEach(otherQuestion => {
                        if (otherQuestion !== question && otherQuestion.classList.contains('active')) {
                            otherQuestion.classList.remove('active');
                            otherQuestion.setAttribute('aria-expanded', 'false');
                            const otherAnswer = otherQuestion.nextElementSibling;
                            if (otherAnswer && otherAnswer.classList.contains('faq-answer')) {
                                otherAnswer.classList.remove('active');
                                otherAnswer.setAttribute('aria-hidden', 'true');
                            }
                        }
                    });
                    */
                    
                    question.classList.toggle('active');
                    answer.classList.toggle('active'); // Также переключаем класс у ответа
                    
                    const isActive = question.classList.contains('active');
                    question.setAttribute('aria-expanded', isActive ? 'true' : 'false');
                    answer.setAttribute('aria-hidden', isActive ? 'false' : 'true');
                });

                // Для доступности: обработка нажатия Enter/Space на вопросе
                question.addEventListener('keydown', (event) => {
                    if (event.key === 'Enter' || event.key === ' ') {
                        event.preventDefault(); 
                        question.click(); 
                    }
                });
            }
        });
    }
    // --- КОНЕЦ Функционала для Блока 9 ---

    // --- Функционал кнопки "Наверх" ---
    const scrollToTopBtn = document.getElementById("scrollToTopBtn");
    const scrollThreshold = 50;
    if (scrollToTopBtn) {
        window.addEventListener("scroll", () => {
            scrollToTopBtn.classList.toggle("show", window.scrollY > scrollThreshold);
        });
        scrollToTopBtn.addEventListener("click", () => {
            window.scrollTo({ top: 0, behavior: "smooth" });
        });
    }
    // --- КОНЕЦ Функционала кнопки "Наверх" ---

    // --- Функционал для Модального окна "Хорошее место" ---
    const openModalBtns = document.querySelectorAll('.js-open-yandex-modal'); // Используем querySelectorAll и класс
    const modalOverlay = document.getElementById('yandex-badge-modal');
    const closeModalBtn = modalOverlay ? modalOverlay.querySelector('.modal-close-btn') : null;

    if (openModalBtns.length > 0 && modalOverlay && closeModalBtn) { // Проверяем, что кнопки найдены
        openModalBtns.forEach(btn => { // Перебираем все найденные кнопки
            btn.addEventListener('click', (event) => {
                event.preventDefault(); // Предотвращаем переход по ссылке #
                modalOverlay.classList.add('active');
                modalOverlay.setAttribute('aria-hidden', 'false');
                // Фокус на кнопку закрытия для доступности
                if (closeModalBtn) closeModalBtn.focus();
            });
        });

        // Закрыть модальное окно по кнопке "крестик"
        if (closeModalBtn) {
            closeModalBtn.addEventListener('click', () => {
                modalOverlay.classList.remove('active');
                modalOverlay.setAttribute('aria-hidden', 'true');
                // Попытаемся вернуть фокус на первый элемент, который может открыть модалку
                if (openModalBtns.length > 0) openModalBtns[0].focus(); 
            });
        }

        // Закрыть модальное окно по клику на оверлей
        modalOverlay.addEventListener('click', (event) => {
            if (event.target === modalOverlay) { // Клик был именно на оверлее, а не на контенте
                modalOverlay.classList.remove('active');
                modalOverlay.setAttribute('aria-hidden', 'true');
                if (openModalBtns.length > 0) openModalBtns[0].focus();
            }
        });

        // Закрыть модальное окно по клавише Escape
        document.addEventListener('keydown', (event) => {
            if (event.key === 'Escape' && modalOverlay.classList.contains('active')) {
                modalOverlay.classList.remove('active');
                modalOverlay.setAttribute('aria-hidden', 'true');
                if (openModalBtns.length > 0) openModalBtns[0].focus();
            }
        });
    }
    // --- КОНЕЦ Функционала для Модального окна ---

}); // Конец DOMContentLoaded