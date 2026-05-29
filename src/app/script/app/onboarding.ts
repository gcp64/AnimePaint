export function initOnboarding(parentEl: HTMLElement): void {
    let completed = false;
    try {
        completed = localStorage.getItem('maria_core_onboarding_completed') === 'true';
    } catch (e) {
        completed = true; // Fallback: bypass overlay to guarantee app loads
    }
    
    if (completed) {
        return;
    }
    
    // Create onboarding overlay
    const overlay = document.createElement('div');
    overlay.className = 'maria-onboarding-overlay';
    
    const container = document.createElement('div');
    container.className = 'maria-onboarding-container';
    
    const slidesData = [
        {
            title: 'مشروع MARIA CORE | الإصدار المتقدم',
            desc: 'مرحباً بك في بيئة الرسم المستقبلية المطورة خصيصاً لرسامي الأنمي والمانجا. تم هندسة هذا نظام ليوفر لك أقصى درجات الاستقرار البرمجي والأداء العالي.'
        },
        {
            title: 'واجهة عائمة بنسبة 100%',
            desc: 'تم إلغاء الإطارات الصندوقية الكلاسيكية. مساحة الرسم (Canvas) تمتد الآن خلف كافة القوائم لتمنحك رؤية سينمائية كاملة ومساحة عمل غير محدودة.'
        },
        {
            title: 'إدارة الطبقات الزجاجية',
            desc: 'تجد على يمين الشاشة لوحة الطبقات (Layers Manager) العائمة. تدعم اللوحة أكثر من 16 نمط دمج وتأثيرات شفافية فورية ومعاينة حية للرسوم.'
        },
        {
            title: 'محرك الفرش ومثبت الخطوط المتقدم',
            desc: 'يحتوي شريط الأدوات الأيسر على أدوات التحبير الحادة. تم دمج خوارزمية منحنيات بيزير التكعيبية لتنعيم الخطوط تلقائياً وامتصاص اهتزاز القلم أو الفأرة.'
        },
        {
            title: 'أداة التلوين السريع (Cel-Shading)',
            desc: 'أداة السطل الذكية مدعومة بمحرك معالجة سريع يقوم بتوسيع الألوان ديناميكياً أسفل الخطوط، لمنع ظهور الفراغات البيضاء المزعجة أثناء تلوين الأنمي.'
        },
        {
            title: 'جاهز لبدء الإبداع',
            desc: 'يمكنك استخدام اختصارات لوحة المفاتيح الاحترافية للتنقل والتحجيم السريع. اضغط على الزر أدناه لإغلاق الدليل والبدء.'
        }
    ];
    
    let currentSlide = 0;
    
    const slideTitle = document.createElement('h2');
    slideTitle.className = 'maria-onboarding__title';
    
    const slideDesc = document.createElement('p');
    slideDesc.className = 'maria-onboarding__desc';
    
    // Slide progression dots
    const dotsContainer = document.createElement('div');
    dotsContainer.className = 'maria-onboarding__dots';
    
    const dots: HTMLElement[] = [];
    slidesData.forEach((_, idx) => {
        const dot = document.createElement('span');
        dot.className = 'maria-onboarding__dot';
        dot.onclick = () => showSlide(idx);
        dotsContainer.appendChild(dot);
        dots.push(dot);
    });
    
    // Actions container
    const actions = document.createElement('div');
    actions.className = 'maria-onboarding__actions';
    
    const prevBtn = document.createElement('button');
    prevBtn.className = 'maria-onboarding__btn btn-prev';
    prevBtn.innerHTML = `
        <svg viewBox="0 0 24 24" width="20" height="20" stroke="currentColor" stroke-width="2.5" fill="none" stroke-linecap="round" stroke-linejoin="round">
            <polyline points="15 18 9 12 15 6"></polyline>
        </svg>
    `;
    prevBtn.onclick = () => {
        if (currentSlide > 0) showSlide(currentSlide - 1);
    };
    
    const nextBtn = document.createElement('button');
    nextBtn.className = 'maria-onboarding__btn btn-next';
    nextBtn.innerHTML = `
        <svg viewBox="0 0 24 24" width="20" height="20" stroke="currentColor" stroke-width="2.5" fill="none" stroke-linecap="round" stroke-linejoin="round">
            <polyline points="9 18 15 12 9 6"></polyline>
        </svg>
    `;
    nextBtn.onclick = () => {
        if (currentSlide < slidesData.length - 1) showSlide(currentSlide + 1);
    };
    
    const finishBtn = document.createElement('button');
    finishBtn.className = 'maria-onboarding__finish-btn';
    finishBtn.textContent = 'ابدأ الإبداع';
    finishBtn.style.display = 'none';
    finishBtn.onclick = () => {
        try {
            localStorage.setItem('maria_core_onboarding_completed', 'true');
        } catch (e) {
            console.error('Failed to write to localStorage:', e);
        }
        overlay.classList.add('maria-onboarding-overlay--fadeout');
        setTimeout(() => {
            overlay.remove();
        }, 400);
    };
    
    function showSlide(index: number): void {
        currentSlide = index;
        const data = slidesData[currentSlide];
        
        // Update content with fade effect
        slideTitle.style.opacity = '0';
        slideDesc.style.opacity = '0';
        setTimeout(() => {
            slideTitle.textContent = data.title;
            slideDesc.textContent = data.desc;
            slideTitle.style.opacity = '1';
            slideDesc.style.opacity = '1';
        }, 150);
        
        // Update dots
        dots.forEach((dot, idx) => {
            dot.classList.toggle('maria-onboarding__dot--active', idx === currentSlide);
        });
        
        // Show/hide navigation buttons
        prevBtn.style.visibility = currentSlide === 0 ? 'hidden' : 'visible';
        
        if (currentSlide === slidesData.length - 1) {
            nextBtn.style.display = 'none';
            finishBtn.style.display = 'block';
        } else {
            nextBtn.style.display = 'block';
            finishBtn.style.display = 'none';
        }
    }
    
    showSlide(0);
    
    actions.append(prevBtn, dotsContainer, nextBtn, finishBtn);
    container.append(slideTitle, slideDesc, actions);
    overlay.append(container);
    parentEl.appendChild(overlay);
}
