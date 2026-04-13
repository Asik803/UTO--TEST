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

        let optionsHTML = '';
        const options = q.options || [];
        
        // --- 3-ҚАДАМДАҒЫ ӨЗГЕРІС ОСЫ ЖЕРДЕ ---
        // Егер сұрақ типі 'multiple' болса - квадрат (checkbox), әйтпесе - нүкте (radio)
        const inputType = q.type === 'multiple' ? 'checkbox' : 'radio';

        options.forEach(opt => {
            optionsHTML += `
                <label style="display:block; margin: 10px 0; cursor: pointer;">
                    <input type="${inputType}" name="q${q.id}" value="${opt}" style="margin-right: 10px;">
                    ${opt}
                </label>`;
        });
        // -------------------------------------

        div.innerHTML = `<h3>${index + 1}. ${q.question_test}</h3>${optionsHTML}`;
        container.appendChild(div);
    });
}

async function checkAnswers() {
    const container = document.getElementById('quiz-container');
    let totalScore = 0;

    // 1. Деректерді базадан алу
    const { data: questions, error } = await _supabase
        .from('questions')
        .select('*')
        .eq('variant', Number(currentVariantId));

    if (error) return alert(error.message);

    questions.forEach((q, index) => {
        // Пайдаланушы таңдаған жауаптар (массив)
        const selected = Array.from(container.querySelectorAll(`input[name="q${q.id}"]:checked`)).map(i => i.value);
        
        // Дұрыс жауаптар (базадан келетін массив)
        const correct = Array.isArray(q.correct_answer) ? q.correct_answer : JSON.parse(q.correct_answer || "[]");
        
        const correctCount = correct.length; // Дұрыс жауаптар саны
        const selectedCount = selected.length; // Белгіленген жауаптар саны
        const rightSelected = selected.filter(val => correct.includes(val)).length; // Белгіленгендердің ішіндегі дұрысы
        const wrongSelected = selectedCount - rightSelected; // Қате белгіленгендер саны

        let questionScore = 0;

        // 1-30 сұрақтар (1 балдық)
        if (index < 30) {
            if (rightSelected === 1 && selectedCount === 1) questionScore = 1;
        } 
        // 31-ден басталатын сұрақтар (2 балдық логика)
        else {
            if (correctCount === 1) {
                if (selectedCount === 1 && rightSelected === 1) questionScore = 2;
                else if (selectedCount === 2 && rightSelected === 1) questionScore = 1;
                else questionScore = 0;
            } 
            else if (correctCount === 2) {
                if (selectedCount === 2 && rightSelected === 2) questionScore = 2;
                else if (selectedCount === 1 && rightSelected === 1) questionScore = 1;
                else if (selectedCount === 3 && rightSelected === 2 && wrongSelected === 1) questionScore = 1;
                else questionScore = 0;
            }
            else if (correctCount === 3) {
                if (selectedCount === 3 && rightSelected === 3) questionScore = 2; // Сен 3 балл дедің, бірақ әдетте макс 2 балл болады, қажет болса 3-ке өзгерт
                else if (selectedCount === 2 && rightSelected === 2) questionScore = 1;
                else questionScore = 0;
            }
        }
        totalScore += questionScore;
    });

    showResult(totalScore, questions.length); // Нәтижені көрсету
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
