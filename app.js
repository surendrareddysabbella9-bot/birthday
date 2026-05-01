// Using Vercel Serverless Functions for backend operations

// --- PUZZLE LOGIC ---
const PUZZLE_SIZE = 3;
const TOTAL_TILES = PUZZLE_SIZE * PUZZLE_SIZE;
let stickyCount = 0;

function initPuzzle() {
    stickyCount = 0;
    const board = document.getElementById('puzzle-drop-board');
    const scatterArea = document.getElementById('scatter-area');
    if (!board || !scatterArea) return;
    
    board.innerHTML = '';
    scatterArea.innerHTML = '';

    // Create drop slots
    for (let i = 0; i < TOTAL_TILES; i++) {
        const slot = document.createElement('div');
        slot.classList.add('drop-slot');
        slot.dataset.index = i;
        board.appendChild(slot);
    }

    // Create draggable pieces
    const pieces = Array.from({length: TOTAL_TILES}, (_, i) => i);
    pieces.sort(() => Math.random() - 0.5);

    pieces.forEach((tileVal) => {
        const piece = document.createElement('div');
        piece.classList.add('scatter-piece');
        piece.dataset.correctIndex = tileVal;
        
        const row = Math.floor(tileVal / PUZZLE_SIZE);
        const col = tileVal % PUZZLE_SIZE;
        piece.style.backgroundPosition = `${col * 50}% ${row * 50}%`;
        
        scatterArea.appendChild(piece);
        randomizePiecePosition(piece);
        setupDrag(piece);
    });
}

function randomizePiecePosition(piece) {
    const ww = window.innerWidth;
    const wh = window.innerHeight;
    const pieceSize = 101;
    
    let x, y;
    let valid = false;
    let attempts = 0;
    while (!valid && attempts < 50) {
        x = Math.random() * (ww - pieceSize);
        y = Math.random() * (wh - pieceSize);
        
        const centerX = ww / 2;
        const centerY = wh / 2;
        const distX = Math.abs(x + pieceSize/2 - centerX);
        const distY = Math.abs(y + pieceSize/2 - centerY);
        
        // Avoid the central board area
        if (distX > 180 || distY > 180) {
            valid = true;
        }
        attempts++;
    }
    
    piece.style.left = `${x}px`;
    piece.style.top = `${y}px`;
}

function setupDrag(piece) {
    let isDragging = false;
    let startX, startY, initialLeft, initialTop;

    const onMove = (e) => {
        if (!isDragging) return;
        const clientX = e.touches ? e.touches[0].clientX : e.clientX;
        const clientY = e.touches ? e.touches[0].clientY : e.clientY;
        const dx = clientX - startX;
        const dy = clientY - startY;
        piece.style.left = `${initialLeft + dx}px`;
        piece.style.top = `${initialTop + dy}px`;
        checkHover(clientX, clientY);
    };

    const onUp = (e) => {
        if (!isDragging) return;
        isDragging = false;
        document.removeEventListener('mousemove', onMove);
        document.removeEventListener('touchmove', onMove);
        document.removeEventListener('mouseup', onUp);
        document.removeEventListener('touchend', onUp);
        
        const clientX = e.changedTouches ? e.changedTouches[0].clientX : e.clientX;
        const clientY = e.changedTouches ? e.changedTouches[0].clientY : e.clientY;
        
        checkDrop(piece, clientX, clientY);
    };

    const onDown = (e) => {
        if (piece.classList.contains('sticky')) return;
        isDragging = true;
        startX = e.touches ? e.touches[0].clientX : e.clientX;
        startY = e.touches ? e.touches[0].clientY : e.clientY;
        
        const rect = piece.getBoundingClientRect();
        initialLeft = parseFloat(piece.style.left) || rect.left;
        initialTop = parseFloat(piece.style.top) || rect.top;
        
        piece.style.zIndex = 200;
        
        document.addEventListener('mousemove', onMove, {passive: false});
        document.addEventListener('touchmove', onMove, {passive: false});
        document.addEventListener('mouseup', onUp);
        document.addEventListener('touchend', onUp);
    };

    piece.addEventListener('mousedown', onDown);
    piece.addEventListener('touchstart', onDown, {passive: false});
}

function checkHover(x, y) {
    document.querySelectorAll('.drop-slot').forEach(slot => {
        const rect = slot.getBoundingClientRect();
        if (x > rect.left && x < rect.right && y > rect.top && y < rect.bottom) {
            slot.classList.add('active');
        } else {
            slot.classList.remove('active');
        }
    });
}

function checkDrop(piece, x, y) {
    let dropped = false;
    document.querySelectorAll('.drop-slot').forEach(slot => {
        slot.classList.remove('active');
        const rect = slot.getBoundingClientRect();
        if (x > rect.left && x < rect.right && y > rect.top && y < rect.bottom) {
            if (slot.dataset.index === piece.dataset.correctIndex && !slot.hasChildNodes()) {
                snapToSlot(piece, slot);
                dropped = true;
                checkWin();
            }
        }
    });
    if (!dropped) {
        piece.style.zIndex = 100;
    }
}

function snapToSlot(piece, slot) {
    slot.appendChild(piece);
    piece.style.position = 'absolute';
    piece.style.left = '0';
    piece.style.top = '0';
    piece.classList.add('sticky');
    stickyCount++;
}

function checkWin() {
    if (stickyCount === TOTAL_TILES) {
        document.querySelector('.puzzle-container').classList.add('solved');
        document.querySelector('.glitch-text').innerText = "ACCESS GRANTED";
        document.querySelector('.glitch-text').style.color = "var(--neon-green)";
        document.querySelector('.glitch-text').style.textShadow = "0 0 15px var(--neon-green)";
        setTimeout(() => {
            showSection('section-hero');
        }, 1200);
    }
}

// --- UI INTERACTIONS ---
function showSection(id) {
    document.querySelectorAll('section').forEach(sec => sec.classList.remove('active'));
    document.getElementById(id).classList.add('active');
    
    // Scroll to top
    document.getElementById('app').scrollTo({top: 0, behavior: 'smooth'});
}

// Navigation Listeners
document.getElementById('btn-reset-puzzle').addEventListener('click', () => {
    document.querySelector('.puzzle-container').classList.remove('solved');
    document.querySelector('.glitch-text').innerText = "ACCESS REQUIRED";
    document.querySelector('.glitch-text').style.color = "";
    document.querySelector('.glitch-text').style.textShadow = "";
    shufflePuzzle();
});

document.getElementById('btn-skip-puzzle').addEventListener('click', () => {
    showSection('section-hero');
});

document.getElementById('btn-continue').addEventListener('click', () => {
    showSection('section-feedback');
});

document.getElementById('btn-replay').addEventListener('click', () => {
    document.getElementById('feedback-form').reset();
    
    document.querySelector('.puzzle-container').classList.remove('solved');
    document.querySelector('.glitch-text').innerText = "ACCESS REQUIRED";
    document.querySelector('.glitch-text').style.color = "";
    document.querySelector('.glitch-text').style.textShadow = "";
    
    initPuzzle();
    showSection('section-puzzle');
});

// --- FINAL QUOTES LOGIC ---
const finalQuotes = [
    {
        quote: "Built with strength,<br>powered by friendships.",
        thanks: "Thank you for being a part of my journey. Let's crush more goals together!"
    },
    {
        quote: "Great things are never done<br>by one person.",
        thanks: "Your support means the world to me. Thanks for making this day special!"
    },
    {
        quote: "Surround yourself with those<br>who lift you higher.",
        thanks: "I appreciate you taking the time. Stay relentless, stay awesome."
    },
    {
        quote: "Every rep, every set,<br>every friendship counts.",
        thanks: "Grateful for your honest feedback and your epic wishes!"
    },
    {
        quote: "Success is sweeter<br>when shared with the right people.",
        thanks: "Thanks for celebrating with me. Here is to another year of gains!"
    },
    {
        quote: "Energy flows<br>where intention goes.",
        thanks: "Your words motivate me more than you know. Thanks for the birthday love!"
    }
];

function setRandomFinalQuote() {
    const randomIdx = Math.floor(Math.random() * finalQuotes.length);
    const selected = finalQuotes[randomIdx];
    document.getElementById('dynamic-quote').innerHTML = selected.quote;
    document.getElementById('dynamic-thanks').innerHTML = selected.thanks;
}

// Form Submission
document.getElementById('feedback-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const btn = e.target.querySelector('button[type="submit"]');
    const btnSpan = btn.querySelector('span');
    const originalText = btnSpan.innerText;

    btnSpan.innerText = 'Transmitting...';
    btn.disabled = true;

    try {
        const payload = {
            name: document.getElementById('name').value.trim(),
            liked_about_me: document.getElementById('liked').value.trim(),
            dislike_about_me: document.getElementById('disliked').value.trim(),
            birthday_message: document.getElementById('message').value.trim(),
            fun_answer_1: document.getElementById('fun1').value.trim(),
            fun_answer_2: document.getElementById('fun2').value.trim(),
            timestamp: new Date().toISOString()
        };

        const response = await fetch(`/api/submitFeedback`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(payload)
        });

        if (!response.ok) {
            const errData = await response.json().catch(() => ({}));
            console.error("Server Error Details:", errData);
            throw new Error(`HTTP error! status: ${response.status} - ${errData.details || 'Unknown Error'}`);
        }
        
        setRandomFinalQuote();
        showSection('section-final');
    } catch (error) {
        console.error("Error adding document: ", error);
        // Continue to the final screen even if Firebase fails, so the user can see the end result
        setRandomFinalQuote();
        showSection('section-final');
    } finally {
        btnSpan.innerText = originalText;
        btn.disabled = false;
    }
});

// --- INITIALIZATION ---
document.addEventListener('DOMContentLoaded', () => {
    initPuzzle();
    
    // Initialize Particles.js
    if(window.particlesJS) {
        particlesJS("particles-js", {
            "particles": {
                "number": { "value": 60, "density": { "enable": true, "value_area": 800 } },
                "color": { "value": ["#00ff88", "#ff3b3b", "#ffffff"] },
                "shape": { "type": "circle" },
                "opacity": { "value": 0.4, "random": true },
                "size": { "value": 2.5, "random": true },
                "line_linked": { "enable": true, "distance": 150, "color": "#ffffff", "opacity": 0.05, "width": 1 },
                "move": { "enable": true, "speed": 1.5, "direction": "none", "random": true, "out_mode": "out" }
            },
            "interactivity": {
                "detect_on": "window",
                "events": {
                    "onhover": { "enable": true, "mode": "grab" },
                    "onclick": { "enable": true, "mode": "push" }
                },
                "modes": {
                    "grab": { "distance": 140, "line_linked": { "opacity": 0.5 } },
                    "push": { "particles_nb": 3 }
                }
            },
            "retina_detect": true
        });
    }
});
