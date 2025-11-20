/* --- SISTEMA DE SOM 8-BIT (Web Audio API) --- */
const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
let isMuted = false;

function toggleMute() {
    isMuted = !isMuted;
    document.querySelector('.mute-control').textContent = isMuted ? "[SOM: OFF]" : "[SOM: ON]";
}

function resumeAudio() {
    if (audioCtx.state === 'suspended') {
        audioCtx.resume();
    }
}

function playTone(freq, type, duration, startTime = 0) {
    if (isMuted) return;
    resumeAudio();

    const oscillator = audioCtx.createOscillator();
    const gainNode = audioCtx.createGain();

    oscillator.type = type; 
    oscillator.frequency.value = freq;

    oscillator.connect(gainNode);
    gainNode.connect(audioCtx.destination);

    const now = audioCtx.currentTime + startTime;
    
    gainNode.gain.setValueAtTime(0.1, now);
    gainNode.gain.exponentialRampToValueAtTime(0.001, now + duration);

    oscillator.start(now);
    oscillator.stop(now + duration);
}

function sfxHit() {
    playTone(150, 'sawtooth', 0.1);
    playTone(100, 'square', 0.1, 0.05);
}

function sfxLevelUp() {
    playTone(440, 'square', 0.1, 0);    
    playTone(554, 'square', 0.1, 0.1);  
    playTone(659, 'square', 0.1, 0.2);  
    playTone(880, 'square', 0.4, 0.3);  
}

function sfxError() {
    playTone(150, 'sawtooth', 0.3);
    setTimeout(() => playTone(100, 'sawtooth', 0.3), 150);
}

/* --- LÓGICA DO JOGO --- */

function animarPersonagem(tipo) {
    const hero = document.getElementById('heroSvg');
    hero.classList.remove('attack-anim', 'levelup-anim');
    
    void hero.offsetWidth;

    if (tipo === 'attack') {
        hero.classList.add('attack-anim');
    } else if (tipo === 'levelup') {
        hero.classList.add('levelup-anim');
    }
}

function classificarHeroi() {
    resumeAudio();
    let nome = document.getElementById('nomeHeroi').value;
    let xp = parseInt(document.getElementById('xpHeroi').value);
    let nivel = "";

    if (nome === "" || isNaN(xp)) {
        sfxError();
        document.getElementById('resultado').innerHTML = `<span style='color: var(--color-error);'>Erro: Nome ou XP inválidos!</span>`;
        return;
    }

    if (xp < 1000) nivel = "Ferro";
    else if (xp <= 2000) nivel = "Bronze";
    else if (xp <= 5000) nivel = "Prata";
    else if (xp <= 7000) nivel = "Ouro";
    else if (xp <= 8000) nivel = "Platina";
    else if (xp <= 9000) nivel = "Ascendente";
    else if (xp <= 10000) nivel = "Imortal";
    else nivel = "Radiante";

    sfxLevelUp();
    animarPersonagem('levelup');

    const mensagem = `O Herói <span class="highlight">${nome}</span> alcançou o nível <span class="highlight">${nivel}</span>!`;
    
    const resultadoDiv = document.getElementById('resultado');
    resultadoDiv.innerHTML = `
        <div>${mensagem}</div>
        <div class="hero-badge">${nivel.toUpperCase()}</div>
    `;
}

async function simularBatalhas() {
    resumeAudio();
    let xpInput = document.getElementById('xpHeroi');
    let xpAtual = parseInt(xpInput.value) || 0;
    let nomeHeroi = document.getElementById('nomeHeroi').value;

    if (nomeHeroi === "") {
        sfxError();
        document.getElementById('resultado').innerHTML = `<span style='color: var(--color-error);'>Erro: Insira o nome do herói!</span>`;
        return;
    }
    
    const numBatalhas = 5;
    let logBatalhas = `<div>${nomeHeroi} entrou na masmorra...</div>`;
    document.getElementById('resultado').innerHTML = logBatalhas;
    
    animarPersonagem('attack');

    for (let i = 1; i <= numBatalhas; i++) {
        const xpGanho = Math.floor(Math.random() * (300 - 100 + 1)) + 100;
        xpAtual += xpGanho;
        
        sfxHit();

        logBatalhas += `<div style="font-size:0.7rem; margin-top:2px;">Batalha #${i}: Monstro derrotado! +${xpGanho} XP</div>`;
        document.getElementById('resultado').innerHTML = logBatalhas;
        
        await new Promise(r => setTimeout(r, 250));
    }

    xpInput.value = xpAtual;
    
    document.getElementById('resultado').innerHTML += `
        <div style="margin-top:10px; border-top: 2px dashed #666; padding-top:5px;">
            Fim da jornada! Total: <span class="highlight">${xpAtual} XP</span>
        </div>
    `;
    
    setTimeout(() => classificarHeroi(), 800); 
}
