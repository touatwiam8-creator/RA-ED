// ===========================================
// script.js - منطق منصة "رائد"
// ===========================================

// 🔗 رابط Google Apps Script الخاص بك
const GAS_URL = 'https://script.google.com/macros/s/AKfycbxVQctdbqFVbtmTX-BjO2aBsG6zZLTWElvY8ZQHUvZU1N7c2Dz0SNzknUV6eKz5oZwN/exec';

// 📊 تخزين محلي للنتائج
let diagnosesHistory = JSON.parse(localStorage.getItem('raed_diagnoses')) || [];

// ===========================================
// 1. 🎯 نظام التنقل بين الصفحات
// ===========================================

/**
 * إظهار صفحة معينة وإخفاء الباقي
 * @param {string} pageId - معرف الصفحة
 */
function showPage(pageId) {
    // إخفاء جميع الصفحات
    document.querySelectorAll('.page').forEach(page => {
        page.classList.remove('active');
    });
    
    // إخفاء جميع الأزرار النشطة
    document.querySelectorAll('.nav-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    
    // إظهار الصفحة المطلوبة
    const targetPage = document.getElementById(`${pageId}-page`);
    if (targetPage) {
        targetPage.classList.add('active');
        
        // تفعيل الزر المناسب في شريط التنقل
        const activeBtn = document.querySelector(`.nav-btn[onclick*="${pageId}"]`);
        if (activeBtn) {
            activeBtn.classList.add('active');
        }
        
        // تحريك الصفحة للأعلى
        window.scrollTo({ top: 0, behavior: 'smooth' });
        
        // تحديث عنوان الصفحة
        updatePageTitle(pageId);
        
        // تسجيل الصفحة النشطة
        localStorage.setItem('raed_last_page', pageId);
    } else {
        showAlert('⚠️ الصفحة غير موجودة', 'error');
    }
}

/**
 * تحديث عنوان المتصفح حسب الصفحة
 */
function updatePageTitle(pageId) {
    const titles = {
        'home': 'رائد - الرئيسية',
        'time': 'رائد - تشخيص الوقت',
        'social': 'رائد - تشخيص التواصل',
        'writing': 'رائد - تشخيص الكتابة',
        'sales': 'رائد - تشخيص المبيعات',
        'results': 'رائد - النتائج'
    };
    
    document.title = titles[pageId] || 'رائد - التشخيص الذكي';
}

/**
 * تبديل القائمة الجانبية (للموبايل)
 */
function toggleMenu() {
    // هذه الدالة تحتاج عنصر menu في HTML
    // سنضيفها لاحقاً إذا احتجنا
    showAlert('🚀 الموقع يعمل! جرب على الكمبيوتر لأفضل تجربة', 'info');
}

// ===========================================
// 2. ⏰ تشخيص إدارة الوقت
// ===========================================

/**
 * تحليل مشكلة إدارة الوقت
 */
async function analyzeTime() {
    const problem = document.getElementById('time-problem')?.value.trim();
    const details = document.getElementById('time-details')?.value.trim();
    
    if (!problem) {
        showAlert('⛔ الرجاء وصف مشكلتك أولاً', 'error');
        return;
    }
    
    // إظهار حالة التحميل
    const resultDiv = document.getElementById('time-result');
    if (resultDiv) {
        resultDiv.innerHTML = `
            <div class="loading-state">
                <div class="loader"></div>
                <p>جاري تحليل مشكلتك...</p>
                <small>قد يستغرق بضع ثوانٍ</small>
            </div>
        `;
    }
    
    try {
        // إرسال الطلب لـ GAS
        const response = await fetch(GAS_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                action: 'diagnose_time',
                data: {
                    problem: problem,
                    details: details || 'لا توجد تفاصيل إضافية',
                    timestamp: new Date().toISOString()
                }
            })
        });
        
        const result = await response.json();
        
        if (result.success) {
            // حفظ النتيجة
            const diagnosis = {
                id: Date.now(),
                type: 'time',
                problem: problem,
                diagnosis: result.diagnosis,
                severity: result.severity || 'medium',
                plan: result.plan || '',
                date: new Date().toLocaleDateString('ar-SA'),
                time: new Date().toLocaleTimeString('ar-SA')
            };
            
            saveDiagnosis(diagnosis);
            
            // عرض النتيجة
            displayTimeResult(result.diagnosis);
            
            showAlert('✅ تم التشخيص بنجاح!', 'success');
            
            // الانتقال تلقائياً للنتائج بعد 3 ثوان
            setTimeout(() => {
                showPage('results');
            }, 3000);
            
        } else {
            throw new Error(result.error || 'فشل في التشخيص');
        }
        
    } catch (error) {
        console.error('❌ خطأ في تشخيص الوقت:', error);
        
        // عرض نتيجة تجريبية في حالة فشل الاتصال
        const fallbackResult = `
            <div class="diagnosis-result">
                <div class="result-header">
                    <h4><i class="fas fa-clock"></i> تشخيص إدارة الوقت</h4>
                    <span class="severity-badge medium">متوسط</span>
                </div>
                <div class="result-content">
                    <p><strong>المشكلة:</strong> ${problem.substring(0, 100)}...</p>
                    <p><strong>التشخيص:</strong> بناءً على وصفك، يبدو أنك تعاني من مشكلة في تنظيم الأولويات وتوزيع الوقت.</p>
                    <div class="recommendations">
                        <h5>📋 توصيات سريعة:</h5>
                        <ol>
                            <li>حدد 3 مهام رئيسية فقط لكل يوم</li>
                            <li>استخدم تقنية بومودورو (25 دقيقة عمل، 5 دقيقة راحة)</li>
                            <li>أوقف الإشعارات أثناء فترات العمل المركز</li>
                        </ol>
                    </div>
                </div>
                <div class="result-footer">
                    <small><i class="fas fa-info-circle"></i> هذه نتيجة تجريبية. للتشخيص الدقيق، تأكد من اتصال API</small>
                </div>
            </div>
        `;
        
        displayTimeResult(fallbackResult);
        showAlert('⚠️ عرض نتيجة تجريبية (اتصال API محدود)', 'warning');
    }
}

/**
 * عرض نتيجة تشخيص الوقت
 */
function displayTimeResult(content) {
    const resultDiv = document.getElementById('time-result');
    if (resultDiv) {
        resultDiv.innerHTML = content;
        resultDiv.classList.remove('result-placeholder');
    }
}

/**
 تعيين مثال سريع لمشكلة الوقت
 */
function setTimeExample(exampleType) {
    const textarea = document.getElementById('time-problem');
    if (!textarea) return;
    
    const examples = {
        'تسويف': 'أجد نفسي أؤجل المهام المهمة إلى آخر لحظة، ثم أعمل تحت الضغط.',
        'تشتت': 'أبدأ العمل على شيء ثم أتحول لشيء آخر، وينتهي اليوم دون إكمال أي شيء.',
        'إرهاق': 'أعمل ساعات طويلة لكن الإنتاجية قليلة، أشعر بالإرهاق الدائم.',
        'أولويات': 'لا أعرف كيف أرتّب أولوياتي، كل شيء يبدو مهماً بنفس الدرجة.'
    };
    
    textarea.value = examples[exampleType] || '';
    textarea.focus();
}

// ===========================================
// 3. 📱 تشخيص التواصل الاجتماعي
// ===========================================

/**
 * تحليل مشكلة التواصل
 */
async function analyzeSocial() {
    const platform = document.getElementById('social-platform')?.value;
    const problem = document.getElementById('social-problem')?.value.trim();
    const example = document.getElementById('social-example')?.value.trim();
    
    if (!problem) {
        showAlert('⛔ الرجاء وصف مشكلة تواصلك', 'error');
        return;
    }
    
    // إظهار حالة التحميل
    const resultDiv = document.getElementById('social-result');
    if (resultDiv) {
        resultDiv.innerHTML = `
            <div class="loading-state">
                <div class="loader"></div>
                <p>جاري تحليل تواصلك...</p>
                <small>الذكاء الاصطناعي يحلل أسلوبك</small>
            </div>
        `;
    }
    
    try {
        const response = await fetch(GAS_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                action: 'diagnose_social',
                data: {
                    platform: platform,
                    problem: problem,
                    example: example || 'لا يوجد مثال',
                    timestamp: new Date().toISOString()
                }
            })
        });
        
        const result = await response.json();
        
        if (result.success) {
            // حفظ النتيجة
            const diagnosis = {
                id: Date.now(),
                type: 'social',
                platform: platform,
                problem: problem,
                diagnosis: result.diagnosis,
                date: new Date().toLocaleDateString('ar-SA'),
                time: new Date().toLocaleTimeString('ar-SA')
            };
            
            saveDiagnosis(diagnosis);
            displaySocialResult(result.diagnosis);
            showAlert('✅ تم تحليل تواصلك بنجاح!', 'success');
            
        } else {
            throw new Error(result.error || 'فشل في التحليل');
        }
        
    } catch (error) {
        console.error('❌ خطأ في تشخيص التواصل:', error);
        
        // نتيجة تجريبية
        const fallbackResult = `
            <div class="diagnosis-result">
                <h4><i class="fas fa-comments"></i> تحليل التواصل</h4>
                <p><strong>المنصة:</strong> ${platform}</p>
                <p><strong>المشكلة:</strong> ${problem.substring(0, 80)}...</p>
                <div class="social-tips">
                    <h5>💡 نصائح سريعة:</h5>
                    <ul>
                        <li>ركز على تقديم قيمة للجمهور قبل طلب التفاعل</li>
                        <li>استخدم صوراً جذابة وعناوين مثيرة للفضاء</li>
                        <li>تفاعل مع المعلقين ورد على استفساراتهم</li>
                        <li>نشر في الأوقات الذهبية (6-9 مساءً)</li>
                    </ul>
                </div>
                <small><i class="fas fa-info-circle"></i> نتيجة تجريبية</small>
            </div>
        `;
        
        displaySocialResult(fallbackResult);
        showAlert('⚠️ عرض نتيجة تجريبية', 'warning');
    }
}

/**
 * عرض نتيجة تشخيص التواصل
 */
function displaySocialResult(content) {
    const resultDiv = document.getElementById('social-result');
    if (resultDiv) {
        resultDiv.innerHTML = content;
        resultDiv.classList.remove('result-placeholder');
    }
}

// ===========================================
// 4. ✍️ تشخيص الكتابة
// ===========================================

/**
 * تحليل النص الكتابي
 */
async function analyzeWriting() {
    const purpose = document.getElementById('writing-purpose')?.value;
    const text = document.getElementById('writing-text')?.value.trim();
    
    if (!text || text.length < 10) {
        showAlert('⛔ النص قصير جداً، اكتب至少 10 أحرف', 'error');
        return;
    }
    
    // تحديث عداد الأحرف
    updateCharCounter();
    
    // إظهار حالة التحميل
    const resultDiv = document.getElementById('writing-result');
    if (resultDiv) {
        resultDiv.innerHTML = `
            <div class="loading-state">
                <div class="loader"></div>
                <p>جاري تحليل كتاباتك...</p>
                <small>جاري فحص الأسلوب والقواعد</small>
            </div>
        `;
    }
    
    try {
        const response = await fetch(GAS_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                action: 'diagnose_writing',
                data: {
                    purpose: purpose,
                    text: text.substring(0, 1000), // إرسال أول 1000 حرف فقط
                    length: text.length,
                    timestamp: new Date().toISOString()
                }
            })
        });
        
        const result = await response.json();
        
        if (result.success) {
            // حفظ النتيجة
            const diagnosis = {
                id: Date.now(),
                type: 'writing',
                purpose: purpose,
                textPreview: text.substring(0, 100) + '...',
                diagnosis: result.diagnosis,
                date: new Date().toLocaleDateString('ar-SA'),
                time: new Date().toLocaleTimeString('ar-SA')
            };
            
            saveDiagnosis(diagnosis);
            displayWritingResult(result.diagnosis);
            showAlert('✅ تم تحليل كتاباتك بنجاح!', 'success');
            
        } else {
            throw new Error(result.error || 'فشل في التحليل');
        }
        
    } catch (error) {
        console.error('❌ خطأ في تشخيص الكتابة:', error);
        
        // نتيجة تجريبية
        const fallbackResult = `
            <div class="diagnosis-result">
                <h4><i class="fas fa-feather-alt"></i> تحليل الكتابة</h4>
                <p><strong>الغرض:</strong> ${purpose}</p>
                <p><strong>طول النص:</strong> ${text.length} حرف</p>
                <div class="writing-analysis">
                    <h5>📊 تحليل سريع:</h5>
                    <p>بناءً على قراءة سريعة، نصك ${text.length > 200 ? 'طويل' : 'قصير'} نسبياً.</p>
                    <p><strong>نصيحة:</strong> حاول تقسيم النص الطويل إلى فقرات قصيرة مع عناوين فرعية.</p>
                </div>
                <small><i class="fas fa-info-circle"></i> نتيجة تجريبية - للتحليل الدقيق تأكد من اتصال API</small>
            </div>
        `;
        
        displayWritingResult(fallbackResult);
        showAlert('⚠️ عرض نتيجة تجريبية', 'warning');
    }
}

/**
 * تحديث عداد أحرف نص الكتابة
 */
function updateCharCounter() {
    const textarea = document.getElementById('writing-text');
    const counter = document.getElementById('char-counter');
    
    if (textarea && counter) {
        const count = textarea.value.length;
        counter.textContent = count;
        
        // تغيير اللون حسب الطول
        if (count < 50) {
            counter.style.color = '#ef4444'; // أحمر
        } else if (count < 200) {
            counter.style.color = '#f59e0b'; // أصفر
        } else {
            counter.style.color = '#10b981'; // أخضر
        }
    }
}

/**
 * عرض نتيجة تشخيص الكتابة
 */
function displayWritingResult(content) {
    const resultDiv = document.getElementById('writing-result');
    if (resultDiv) {
        resultDiv.innerHTML = content;
        resultDiv.classList.remove('result-placeholder');
    }
}

// ===========================================
// 5. 💰 تشخيص المبيعات
// ===========================================

/**
 * تحليل مشكلة المبيعات
 */
async function analyzeSales() {
    const scenario = document.getElementById('sales-scenario')?.value.trim();
    const problem = document.getElementById('sales-problem')?.value.trim();
    const responses = document.getElementById('sales-responses')?.value.trim();
    
    if (!scenario || !problem) {
        showAlert('⛔ الرجاء وصف سيناريو المبيعات والمشكلة', 'error');
        return;
    }
    
    // إظهار حالة التحميل
    const resultDiv = document.getElementById('sales-result');
    if (resultDiv) {
        resultDiv.innerHTML = `
            <div class="loading-state">
                <div class="loader"></div>
                <p>جاري تحليل أسلوب مبيعاتك...</p>
                <small>جاري البحث عن نقاط الضعف</small>
            </div>
        `;
    }
    
    try {
        const response = await fetch(GAS_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                action: 'diagnose_sales',
                data: {
                    scenario: scenario,
                    problem: problem,
                    responses: responses || 'لا توجد ردود محددة',
                    timestamp: new Date().toISOString()
                }
            })
        });
        
        const result = await response.json();
        
        if (result.success) {
            // حفظ النتيجة
            const diagnosis = {
                id: Date.now(),
                type: 'sales',
                scenario: scenario.substring(0, 100) + '...',
                problem: problem,
                diagnosis: result.diagnosis,
                date: new Date().toLocaleDateString('ar-SA'),
                time: new Date().toLocaleTimeString('ar-SA')
            };
            
            saveDiagnosis(diagnosis);
            displaySalesResult(result.diagnosis);
            showAlert('✅ تم تحليل مبيعاتك بنجاح!', 'success');
            
        } else {
            throw new Error(result.error || 'فشل في التحليل');
        }
        
    } catch (error) {
        console.error('❌ خطأ في تشخيص المبيعات:', error);
        
        // نتيجة تجريبية
        const fallbackResult = `
            <div class="diagnosis-result">
                <h4><i class="fas fa-handshake"></i> تحليل المبيعات</h4>
                <p><strong>السيناريو:</strong> ${scenario.substring(0, 80)}...</p>
                <div class="sales-tips">
                    <h5>🎯 تقنيات إقناع سريعة:</h5>
                    <ul>
                        <li>ركز على منفعة المنتج وليس مواصفاته</li>
                        <li>استخدم قصص نجاح عملاء سابقين</li>
                        <li>توقع اعتراضات العميل وجهز ردوداً مسبقة</li>
                        <li>اطلب البيع بثقة ولا تخف من الرفض</li>
                    </ul>
                </div>
                <small><i class="fas fa-info-circle"></i> نتيجة تجريبية</small>
            </div>
        `;
        
        displaySalesResult(fallbackResult);
        showAlert('⚠️ عرض نتيجة تجريبية', 'warning');
    }
}

/**
 * عرض نتيجة تشخيص المبيعات
 */
function displaySalesResult(content) {
    const resultDiv = document.getElementById('sales-result');
    if (resultDiv) {
        resultDiv.innerHTML = content;
        resultDiv.classList.remove('result-placeholder');
    }
}

// ===========================================
// 6. 💾 إدارة البيانات والتخزين
// ===========================================

/**
 * حفظ التشخيص في السجل المحلي
 */
function saveDiagnosis(diagnosis) {
    diagnosesHistory.unshift(diagnosis); // إضافة في البداية
    
    // حفظ فقط آخر 50 تشخيص
    if (diagnosesHistory.length > 50) {
        diagnosesHistory = diagnosesHistory.slice(0, 50);
    }
    
    // حفظ في localStorage
    localStorage.setItem('raed_diagnoses', JSON.stringify(diagnosesHistory));
    
    // تحديث صفحة النتائج
    updateResultsPage();
}

/**
 * تحديث صفحة النتائج
 */
function updateResultsPage() {
    const historyList = document.getElementById('historyList');
    if (!historyList) return;
    
    // تحديث الإحصائيات
    updateStats();
    
    if (diagnosesHistory.length === 0) {
        historyList.innerHTML = `
            <div class="empty-history">
                <i class="fas fa-history"></i>
                <p>لا توجد تشخيصات سابقة بعد</p>
                <button class="btn-primary" onclick="showPage('time')">
                    <i class="fas fa-plus"></i>
                    ابدأ أول تشخيص لك
                </button>
            </div>
        `;
        return;
    }
    
    // عرض سجل التشخيصات
    let html = '<div class="history-items">';
    
    diagnosesHistory.forEach(diagnosis => {
        const typeIcons = {
            'time': 'fas fa-clock',
            'social': 'fas fa-comments',
            'writing': 'fas fa-feather-alt',
            'sales': 'fas fa-handshake'
        };
        
        const typeNames = {
            'time': 'إدارة الوقت',
            'social': 'التواصل',
            'writing': 'الكتابة',
            'sales': 'المبيعات'
        };
        
        html += `
            <div class="history-item">
                <div class="history-icon">
                    <i class="${typeIcons[diagnosis.type] || 'fas fa-stethoscope'}"></i>
                </div>
                <div class="history-content">
                    <div class="history-header">
                        <h4>${typeNames[diagnosis.type] || 'تشخيص'}</h4>
                        <span class="history-date">${diagnosis.date} ${diagnosis.time}</span>
                    </div>
                    <p class="history-problem">${diagnosis.problem?.substring(0, 100) || diagnosis.scenario?.substring(0, 100) || 'لا توجد تفاصيل'}...</p>
                    <button class="view-details-btn" onclick="viewDiagnosisDetails(${diagnosis.id})">
                        <i class="fas fa-eye"></i>
                        عرض التفاصيل
                    </button>
                </div>
            </div>
        `;
    });
    
    html += '</div>';
    historyList.innerHTML = html;
}

/**
 * تحديث الإحصائيات
 */
function updateStats() {
    const timeSaved = diagnosesHistory.filter(d => d.type === 'time').length * 5; // تقديري
    const strengthsFound = diagnosesHistory.length * 2; // تقديري
    
    document.querySelectorAll('.stat-value').forEach((el, index) => {
        if (index === 0) el.textContent = diagnosesHistory.length;
        if (index === 1) el.textContent = '30%'; // ثابت مؤقتاً
        if (index === 2) el.textContent = timeSaved;
        if (index === 3) el.textContent = strengthsFound;
    });
}

/**
 * عرض تفاصيل تشخيص محدد
 */
function viewDiagnosisDetails(id) {
    const diagnosis = diagnosesHistory.find(d => d.id === id);
    if (!diagnosis) return;
    
    const modalContent = `
        <div class="diagnosis-details">
            <h3><i class="fas fa-file-medical"></i> تفاصيل التشخيص</h3>
            <div class="details-content">
                <p><strong>النوع:</strong> ${diagnosis.type}</p>
                <p><strong>التاريخ:</strong> ${diagnosis.date} ${diagnosis.time}</p>
                <p><strong>المشكلة:</strong> ${diagnosis.problem || diagnosis.scenario || 'لا توجد'}</p>
                <div class="full-diagnosis">
                    <h4>التشخيص الكامل:</h4>
                    <div class="diagnosis-text">${diagnosis.diagnosis || 'لا توجد تفاصيل'}</div>
                </div>
            </div>
            <button class="close-modal-btn" onclick="closeModal()">
                <i class="fas fa-times"></i>
                إغلاق
            </button>
        </div>
    `;
    
    // إنشاء وعرض المودال
    showModal(modalContent);
}

// ===========================================
// 7. 🎪 أدوات مساعدة
// ===========================================

/**
 * عرض رسالة تنبيه
 */
function showAlert(message, type = 'info') {
    const container = document.getElementById('alertContainer');
    if (!container) return;
    
    const alertId = 'alert-' + Date.now();
    const icon = {
        'success': 'fas fa-check-circle',
        'error': 'fas fa-exclamation-circle',
        'warning': 'fas fa-exclamation-triangle',
        'info': 'fas fa-info-circle'
    }[type] || 'fas fa-info-circle';
    
    const alertHTML = `
        <div class="alert alert-${type}" id="${alertId}">
            <i class="${icon}"></i>
            <span>${message}</span>
            <button class="alert-close" onclick="document.getElementById('${alertId}').remove()">
                <i class="fas fa-times"></i>
            </button>
        </div>
    `;
    
    container.insertAdjacentHTML('beforeend', alertHTML);
    
    // إزالة تلقائية بعد 5 ثوان
    setTimeout(() => {
        const alertEl = document.getElementById(alertId);
        if (alertEl) {
            alertEl.style.opacity = '0';
            setTimeout(() => alertEl.remove(), 300);
        }
    }, 5000);
}

/**
 * عرض نافذة منبثقة (مودال)
 */
function showModal(content) {
    // إزالة أي مودال سابق
    const existingModal = document.getElementById('raed-modal');
    if (existingModal) existingModal.remove();
    
    const modalHTML = `
        <div class="modal-overlay" id="raed-modal">
            <div class="modal-content">
                ${content}
            </div>
        </div>
    `;
    
    document.body.insertAdjacentHTML('beforeend', modalHTML);
    
    // منع التمرير خلف المودال
    document.body.style.overflow = 'hidden';
}

/**
 * إغلاق المودال
 */
function closeModal() {
    const modal = document.getElementById('raed-modal');
    if (modal) modal.remove();
    document.body.style.overflow = 'auto';
}

/**
 * عرض مثال توضيحي
 */
function showDemo() {
    const demoContent = `
        <div class="demo-modal">
            <h3><i class="fas fa-play-circle"></i> مثال على التشخيص</h3>
            <div class="demo-example">
                <p><strong>المشكلة:</strong> "أعمل 10 ساعات يومياً ولكن لا أنجز شيئاً"</p>
                <div class="demo-result">
                    <h4>📋 نتيجة التشخيص:</h4>
                    <p>تشخيصك يشير إلى <strong>مرض التسويف المزمن</strong> مع <strong>نسبة خطورة 75%</strong>.</p>
                    <p>🔍 السبب: تركيزك على المهام السهلة وتأجيل المهام الصعبة.</p>
                    <p>💊 العلاج: ابدأ يومك بالمهمة الأصعب، واستخدم تقنية بومودورو.</p>
                </div>
            </div>
            <button class="btn-primary" onclick="closeModal(); showPage('time');">
                <i class="fas fa-play"></i>
                جرب بنفسك
            </button>
        </div>
    `;
    
    showModal(demoContent);
}

// ===========================================
// 8. 🚀 التهيئة عند تحميل الصفحة
// ===========================================

/**
 * تهيئة الموقع عند التحميل
 */
function initializeApp() {
    console.log('🚀 رائد - التشخيص الذكي لأعمالك');
    
    // تحميل آخر صفحة زارها المستخدم
    const lastPage = localStorage.getItem('raed_last_page') || 'home';
    showPage(lastPage);
    
    // تحميل سجل التشخيصات
    diagnosesHistory = JSON.parse(localStorage.getItem('raed_diagnoses')) || [];
    updateResultsPage();
    
    // إعداد مستمعات الأحداث
    setupEventListeners();
    
    // إظهار رسالة ترحيب
    setTimeout(() => {
        if (diagnosesHistory.length === 0) {
            showAlert('👋 مرحباً! ابدأ بتشخيص عملك الأول', 'info');
        }
    }, 1000);
}

/**
 * إعداد مستمعات الأحداث
 */
function setupEventListeners() {
    // تحديث عداد أحرف الكتابة
    const writingText = document.getElementById('writing-text');
    if (writingText) {
        writingText.addEventListener('input', updateCharCounter);
    }
    
    // الأزرار السريعة لتشخيص الوقت
    document.querySelectorAll('.quick-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            const example = this.getAttribute('data-example');
            setTimeExample(example);
        });
    });
    
    // إدخال البيانات في حقول الوقت
    const timeInputs = ['time-problem', 'time-details'];
    timeInputs.forEach(id => {
        const input = document.getElementById(id);
        if (input) {
            input.addEventListener('keypress', function(e) {
                if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    analyzeTime();
                }
            });
        }
    });
}

// ===========================================
// 9. 📱 تجاوب الموبايل
// ===========================================

/**
 * التحقق من إذا كان الجهاز جوال
 */
function isMobile() {
    return window.innerWidth <= 768;
}

/**
 * تكبير النص على الجوال
 */
function adjustForMobile() {
    if (isMobile()) {
        document.documentElement.style.fontSize = '14px';
        
        // إخفاء بعض العناصر على الجوال
        document.querySelectorAll('.desktop-only').forEach(el => {
            el.style.display = 'none';
        });
    }
}

// ===========================================
// 10. 🎮 تشغيل التطبيق
// ===========================================

// تشغيل التطبيق عند تحميل الصفحة
document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
    adjustForMobile();
    
    // إعادة ضبط عند تغيير حجم النافذة
    window.addEventListener('resize', adjustForMobile);
    
    // اختبار اتصال GAS عند التحميل
    testGASConnection();
});

/**
 * اختبار اتصال GAS
 */
async function testGASConnection() {
    try {
        const response = await fetch(GAS_URL + '?test=1');
        const data = await response.json();
        
        if (data.success) {
            console.log('✅ اتصال GAS ناجح:', data.message);
        } else {
            console.warn('⚠️ اتصال GAS محدود:', data.error);
        }
    } catch (error) {
        console.warn('⚠️ لا يمكن الاتصال بـ GAS:', error.message);
        showAlert('⚠️ الاتصال بالخادم محدود - جاري استخدام النسخة المحلية', 'warning');
    }
}

// ===========================================
// 🎉 انتهى الكود! الموقع جاهز للتشغيل
// ===========================================
