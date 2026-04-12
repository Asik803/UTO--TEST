// Supabase баптаулары
const SUPABASE_URL = 'https://betrwnzuvnygwwdonxrr.supabase.co';
const SUPABASE_KEY = 'sb_publishable_PYIMdRevKp9fi1qPXnNijw_2uITeMpF';

// ОСЫ ЖЕРДІ ӨЗГЕРТТІК: supabase.createClient емес, window.supabase.createClient
const _supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

const authSection = document.getElementById('auth-section');
const quizSelection = document.getElementById('quiz-selection');
const variantGrid = document.getElementById('variant-grid');

// 1. Тіркелу/Кіру
async function signInWithEmail() {
    const email = document.getElementById('email').value;
    if(!email) return alert("Email жазыңыз!");

    const { error } = await _supabase.auth.signInWithOtp({ email });

    if (error) {
        alert("Қате: " + error.message);
    } else {
        alert("Почтаңызға кіру сілтемесі жіберілді! Почтаны ашып, сілтемені басыңыз.");
    }
}

// 2. Пайдаланушының күйін тексеру
_supabase.auth.onAuthStateChange((event, session) => {
    if (session) {
        showQuizzes();
    } else {
        showAuth();
    }
});

function showQuizzes() {
    authSection.style.display = 'none';
    quizSelection.style.display = 'block';
    
    variantGrid.innerHTML = '';
    for (let i = 1; i <= 14; i++) {
        variantGrid.innerHTML += `<div class="variant-btn" style="cursor:pointer" onclick="alert('${i}-нұсқа таңдалды')">${i}-нұсқа</div>`;
    }
}

function showAuth() {
    authSection.style.display = 'block';
    quizSelection.style.display = 'none';
}

async function signOut() {
    await _supabase.auth.signOut();
    location.reload(); // Бетті жаңарту
}