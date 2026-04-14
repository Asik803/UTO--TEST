const SUPABASE_URL = 'https://betrwnzuvnygwwdonxrr.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJldHJ3bnp1dm55Z3d3ZG9ueHJyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzU5ODcxNjAsImV4cCI6MjA5MTU2MzE2MH0.9AX09-aAgfcvwuHsTyvUx9UqRSVz28ufyLiA05kBEKU';
// Анықталуы (image_9e3dd0.png бойынша):
const _supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

let currentVariantId = null; // Таңдалған нұсқаны сақтау үшін

// Қолданылуы:
async function loginWithGoogle() {
    const { data, error } = await _supabase.auth.signInWithOAuth({ // Осы жерде _supabase болуы керек!
        provider: 'google',
        options: {
            redirectTo: 'https://asik803.github.io/UTO--TEST/'
        }
    });
}

const authSection = document.getElementById('auth-section');
const quizSelection = document.getElementById('quiz-selection');
let isSignUpMode = true;

function showView(viewName) {
    document.querySelectorAll('.content-view').forEach(v => v.style.display = 'none');
    document.getElementById('view-' + viewName).style.display = 'block';
    document.querySelectorAll('.menu-item').forEach(btn => btn.classList.remove('active'));
    document.getElementById('btn-' + viewName).classList.add('active');
}

function renderApp(user) {
    const meta = user.user_metadata;
    const nick = meta.display_name || user.email.split('@')[0];
    const avatar = meta.avatar_url || "https://cdn-icons-png.flaticon.com/512/149/149071.png";

    document.getElementById('user-name-display').innerText = nick;
    document.getElementById('side-avatar').src = avatar;

    // Profile inputs
    document.getElementById('edit-username').value = nick;
    document.getElementById('profile-nick-display').innerText = nick;
    document.getElementById('profile-email').value = user.email;
    document.getElementById('avatar-url-input').value = meta.avatar_url || "";
    document.getElementById('edit-avatar-preview').src = avatar;

    renderVariants();
}
async function updateProfile() {
    const newName = document.getElementById('edit-username').value;
    const newAvatar = document.getElementById('avatar-url-input').value;
    const { error } = await _supabase.auth.updateUser({
        data: { display_name: newName, avatar_url: newAvatar }
    });
    if (error) alert(error.message);
    else { alert("Сақталды! ✅"); location.reload(); }
}

_supabase.auth.onAuthStateChange((event, session) => {
    if (session) {
        authSection.style.display = 'none';
        quizSelection.style.display = 'flex';
        renderApp(session.user);
    } else {
        authSection.style.display = 'flex';
        quizSelection.style.display = 'none';
    }
});

async function handleAuth() {
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const username = document.getElementById('username').value;
    if (isSignUpMode) {
        await _supabase.auth.signUp({ email, password, options: { data: { display_name: username } } });
        alert("Почтаны тексеріңіз!");
    } else {
        const { error } = await _supabase.auth.signInWithPassword({ email, password });
        if (error) alert(error.message);
    }
}

function toggleAuthMode() {
    isSignUpMode = !isSignUpMode;
    const title = document.getElementById('auth-title');
    const btn = document.getElementById('auth-btn');
    const userInp = document.getElementById('username');
    const link = document.getElementById('toggle-link');

    title.innerText = isSignUpMode ? "Тіркелу" : "Кіру";
    btn.innerText = isSignUpMode ? "Тіркелу" : "Кіру";
    userInp.style.display = isSignUpMode ? "block" : "none";
    link.innerHTML = isSignUpMode ? 
        'Аккаунтыңыз бар ма? <span>Кіру</span>' : 
        'Аккаунтыңыз жоқ па? <span>Тіркелу</span>';
}

function togglePass() {
    const p = document.getElementById('password');
    p.type = p.type === 'password' ? 'text' : 'password';
}

async function signOut() { await _supabase.auth.signOut(); location.reload(); }

function setTheme(theme) {
    const body = document.body;
    document.querySelectorAll('.theme-btn').forEach(b => b.classList.remove('active'));

    if (theme === 'light') {
        body.classList.add('light-theme');
    } else {
        body.classList.remove('light-theme');
    }
    // Қай батырма басылғанын анықтау үшін
    event.target.classList.add('active');
}

async function signInWithGoogle() {
    try {
        const { data, error } = await _supabase.auth.signInWithOAuth({
            provider: 'google',
            options: {
                // Соңындағы "/" белгісі өте маңызды!
                redirectTo: 'https://asik803.github.io/UTO--TEST/' 
            }
        });
        if (error) throw error;
    } catch (error) {
        console.error("Google-мен кіру қатесі:", error.message);
    }
}

function renderVariants() {
    const grid = document.getElementById('variant-grid');
    if(!grid) return;
    grid.innerHTML = '';
    for (let i = 1; i <= 14; i++) {
        // onclick қосылды, cursor:pointer басылатынын білдіреді
        grid.innerHTML += `
            <div class="v-cube" onclick="startVariant(${i})" style="cursor: pointer;">
                <span>📖</span>
                <b>${i}-нұсқа</b>
            </div>`;
    }
}

async function startVariant(variantId) {
    currentVariantId = variantId; // Нұсқа нөмірін сақтап аламыз
    console.log(variantId + "-нұсқа таңдалды");

    // Нұсқалар тізімін жасыру
    const grid = document.getElementById('variant-grid');
    if (grid) grid.style.display = 'none';

    // Тест блогын көрсету
    const quizView = document.getElementById('active-quiz-view');
    if (quizView) {
        quizView.style.display = 'block';
    } else {
        console.error("active-quiz-view блогы табылмады!");
        return;
    }

    // Сұрақтарды тарту
    await getQuestions(variantId);
}

function backToVariants() {
    // Кері қайту функциясы
    document.getElementById('variant-grid').style.display = 'grid';
    document.querySelector('.header-box').style.display = 'block';
    document.getElementById('active-quiz-view').style.display = 'none';
}

async function getQuestions(variantId) {
    const container = document.getElementById('quiz-container');
    if (!container) return;

    container.innerHTML = '<p style="color: white;">Жүктелуде...</p>';

    const { data, error } = await _supabase
        .from('questions')
        .select('*')
        .eq('variant', Number(variantId));

    if (error) {
        console.error("Supabase қатесі:", error.message);
        return;
    }

    container.innerHTML = ''; 

    if (!data || data.length === 0) {
        container.innerHTML = '<p style="color: white;">Бұл нұсқада сұрақтар жоқ.</p>';
        return;
    }

    data.forEach((q, index) => {
        const div = document.createElement('div');
        div.className = 'question-card';
        div.style.background = "rgba(255,255,255,0.1)";
        div.style.padding = "20px";
        div.style.marginBottom = "15px";
        div.style.borderRadius = "10px";
        div.style.color = "white";

        // 1. СӘЙКЕСТЕНДІРУ ТИПІ (Matching)
        if (q.type === 'matching') {
            const opts = typeof q.options === 'string' ? JSON.parse(q.options) : q.options;
            let leftHTML = '';
            let rightHTML = '';

            opts.left.forEach((text, i) => {
                const label = i === 0 ? 'А' : 'В';
                leftHTML += `
                    <div style="margin-bottom: 15px;">
                        <span style="background: #4a90e2; padding: 2px 8px; border-radius: 4px; margin-right: 5px;">${label}</span> 
                        ${text}
                        <select name="q${q.id}_${label}" style="margin-left: 10px; padding: 5px; color: black; border-radius: 5px; width: 60px;">
                            <option value="">?</option>
                            ${opts.right.map((_, j) => `<option value="${j+1}">${j+1}</option>`).join('')}
                        </select>
                    </div>`;
            });

            opts.right.forEach((text, j) => {
                rightHTML += `<div style="margin-bottom: 10px;"><b>${j+1})</b> ${text}</div>`;
            });

            div.innerHTML = `
                <h3>${index + 1}. Сәйкестендіріңіз</h3>
                <div style="display: flex; gap: 20px; flex-wrap: wrap; margin-top: 15px;">
                    <div style="flex: 1; min-width: 200px;">${leftHTML}</div>
                    <div style="flex: 1; min-width: 200px; border-left: 1px solid #555; padding-left: 20px;">${rightHTML}</div>
                </div>`;
        } 
        // 2. ҚАЛЫПТЫ ТИПТЕР (Single / Multiple)
        else {
            let optionsHTML = '';
            // Options массивін қауіпсіз түрде алу
            let options = [];
            try {
                options = typeof q.options === 'string' ? JSON.parse(q.options) : (q.options || []);
            } catch (e) {
                options = q.options || [];
            }

            const inputType = q.type === 'multiple' ? 'checkbox' : 'radio';

            options.forEach(opt => {
                optionsHTML += `
                    <label style="display:block; margin: 10px 0; cursor: pointer;">
                        <input type="${inputType}" name="q${q.id}" value="${opt}" style="margin-right: 10px;">
                        ${opt}
                    </label>`;
            });
            div.innerHTML = `<h3>${index + 1}. ${q.question_test}</h3>${optionsHTML}`;
        }

        container.appendChild(div);
    });
}

async function getQuestions(variantId) {
    const container = document.getElementById('quiz-container');
    if (!container) return;

    container.innerHTML = '<p style="color: white; text-align:center;">Жүктелуде...</p>';

    const { data, error } = await _supabase
        .from('questions')
        .select('*')
        .eq('variant', Number(variantId));

    if (error) {
        console.error("Supabase қатесі:", error.message);
        container.innerHTML = `<p style="color: red;">Қате: ${error.message}</p>`;
        return;
    }

    container.innerHTML = ''; 

    if (!data || data.length === 0) {
        container.innerHTML = '<p style="color: white; text-align:center;">Бұл нұсқада сұрақтар жоқ.</p>';
        return;
    }

    data.forEach((q, index) => {
        const div = document.createElement('div');
        div.className = 'question-card';
        div.style.cssText = "background: rgba(255,255,255,0.1); padding: 20px; margin-bottom: 15px; border-radius: 10px; color: white;";

        try {
            // 1. СӘЙКЕСТЕНДІРУ ТИПІ (Matching)
            if (q.type === 'matching') {
                let opts = q.options;
                if (typeof opts === 'string') opts = JSON.parse(opts);

                let leftHTML = '';
                let rightHTML = '';

                opts.left.forEach((text, i) => {
                    const label = i === 0 ? 'А' : 'В';
                    leftHTML += `
                        <div style="margin-bottom: 15px;">
                            <span style="background: #4a90e2; padding: 2px 8px; border-radius: 4px; margin-right: 5px;">${label}</span> 
                            ${text}
                            <select name="q${q.id}_${label}" style="margin-left: 10px; padding: 5px; color: black; border-radius: 5px; width: 65px;">
                                <option value="">?</option>
                                ${opts.right.map((_, j) => `<option value="${j+1}">${j+1}</option>`).join('')}
                            </select>
                        </div>`;
                });

                opts.right.forEach((text, j) => {
                    rightHTML += `<div style="margin-bottom: 10px;"><b>${j+1})</b> ${text}</div>`;
                });

                div.innerHTML = `
                    <h3 style="margin-bottom:15px;">${index + 1}. Сәйкестендіріңіз</h3>
                    <div style="display: flex; gap: 20px; flex-wrap: wrap;">
                        <div style="flex: 1; min-width: 200px;">${leftHTML}</div>
                        <div style="flex: 1; min-width: 200px; border-left: 1px solid #555; padding-left: 20px;">${rightHTML}</div>
                    </div>`;
            } 
            // 2. ҚАЛЫПТЫ ТИПТЕР (Single / Multiple)
            else {
                let optionsHTML = '';
                let options = [];
                
                // options-ты өңдеу: егер string болса parse жасаймыз, әйтпесе сол күйінде аламыз
                if (typeof q.options === 'string') {
                    options = JSON.parse(q.options);
                } else {
                    options = q.options || [];
                }

                const inputType = q.type === 'multiple' ? 'checkbox' : 'radio';

                options.forEach(opt => {
                    optionsHTML += `
                        <label style="display:block; margin: 12px 0; cursor: pointer; background: rgba(255,255,255,0.05); padding: 10px; border-radius: 5px;">
                            <input type="${inputType}" name="q${q.id}" value="${opt}" style="margin-right: 10px; transform: scale(1.2);">
                            ${opt}
                        </label>`;
                });
                div.innerHTML = `<h3>${index + 1}. ${q.question_test || 'Сұрақ мәтіні бос'}</h3>${optionsHTML}`;
            }
        } catch (err) {
            console.error(`Қате шыққан сұрақ ID: ${q.id}`, err);
            div.innerHTML = `<p style="color: #ffbaba;">⚠️ Сұрақты жүктеу қатесі (ID: ${q.id}). Базадағы форматты тексеріңіз.</p>`;
        }

        container.appendChild(div);
    });
}

function showDetailedResult(score, total, review) {
    const container = document.getElementById('quiz-container');
    const percent = Math.round((score / total) * 100);
    
    let html = `
        <div style="text-align: center; color: white; padding: 30px; background: rgba(255,255,255,0.1); border-radius: 15px; margin-bottom: 25px;">
            <h2 style="font-size: 35px; margin: 0;">Нәтиже: ${score} / ${total}</h2>
            <p style="font-size: 20px; opacity: 0.8;">Көрсеткіш: ${percent}%</p>
            <button onclick="location.reload()" style="margin-top: 15px; padding: 10px 25px; cursor: pointer; border-radius: 8px; border: none; background: #4a90e2; color: white;">🏠 Басты мәзір</button>
        </div>
        <h3 style="color: white; border-bottom: 1px solid #444; padding-bottom: 10px;">🔍 Қатемен жұмыс:</h3>
    `;

    review.forEach((item, i) => {
        const isCorrect = item.score === item.max;
        const color = isCorrect ? '#4CAF50' : (item.score > 0 ? '#FFC107' : '#F44336');
        
        html += `
            <div style="background: rgba(255,255,255,0.05); padding: 15px; border-radius: 10px; margin-bottom: 12px; border-left: 5px solid ${color}; color: white;">
                <p><strong>${i + 1}. ${item.question}</strong></p>
                <div style="font-size: 0.9em; margin-top: 8px;">
                    <p style="margin: 3px 0;"><span style="color: #bbb;">Сіздің жауабыңыз:</span> <span style="color: ${color}">${item.user}</span></p>
                    <p style="margin: 3px 0;"><span style="color: #bbb;">Дұрыс жауап:</span> <span style="color: #4CAF50">${item.correct}</span></p>
                </div>
                <p style="text-align: right; font-size: 0.8em; margin: 0; opacity: 0.7;">Балл: ${item.score} / ${item.max}</p>
            </div>
        `;
    });

    container.innerHTML = html;
    window.scrollTo(0, 0); // Экранды жоғарыға шығару
}

function showResult(score, total) {
    const container = document.getElementById('quiz-container');
    const percent = Math.round((score / total) * 100);
    
    container.innerHTML = `
        <div style="text-align: center; color: white; padding: 40px; background: rgba(255,255,255,0.1); border-radius: 20px; margin-top: 20px;">
            <h2 style="font-size: 40px;">📊 Нәтиже</h2>
            <p style="font-size: 24px;">Дұрыс жауап: ${score} / ${total}</p>
            <p style="font-size: 20px;">Көрсеткіш: ${percent}%</p>
            <button onclick="location.reload()" class="primary-btn" style="margin-top: 20px; background: #4a90e2; color: white; border: none; padding: 10px 20px; border-radius: 5px; cursor: pointer;">
                🏠 Басты мәзірге қайту
            </button>
        </div>
    `;
    
    // Аяқтау батырмасын жасыру
    const finishBtn = document.querySelector('button[onclick="checkAnswers()"]');
    if (finishBtn) finishBtn.style.display = 'none';
}
