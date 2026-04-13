const SUPABASE_URL = 'https://betrwnzuvnygwwdonxrr.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJldHJ3bnp1dm55Z3d3ZG9ueHJyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzU5ODcxNjAsImV4cCI6MjA5MTU2MzE2MH0.9AX09-aAgfcvwuHsTyvUx9UqRSVz28ufyLiA05kBEKU';
// Анықталуы (image_9e3dd0.png бойынша):
const _supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

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
        
        options.forEach(opt => {
            optionsHTML += `
                <label style="display:block; margin: 10px 0; cursor: pointer;">
                    <input type="radio" name="q${q.id}" value="${opt}" style="margin-right: 10px;">
                    ${opt}
                </label>`;
        });

        div.innerHTML = `<h3>${index + 1}. ${q.question_test}</h3>${optionsHTML}`;
        container.appendChild(div);
    });
}
