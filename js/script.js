const sections = [...document.querySelectorAll('main section')];
const navLinks = [...document.querySelectorAll('.main-nav a')];
const counter = document.getElementById('sectionCounter');

function updateSection(index) {
    counter.textContent = `${index + 1} / ${sections.length}`;
    navLinks.forEach(link => link.classList.remove('active'));
    const current = document.querySelector(`.main-nav a[href="#${sections[index].id}"]`);
    if (current) current.classList.add('active');
}

const observer = new IntersectionObserver((entries) => {
    const visible = entries
        .filter(entry => entry.isIntersecting)
        .sort((a, b) => b.intersectionRatio - a.intersectionRatio);

    if (visible.length) {
        const index = sections.indexOf(visible[0].target);
        if (index >= 0) updateSection(index);
    }
}, {
    rootMargin: "-20% 0px -55% 0px",
    threshold: [0.05, 0.2, 0.5]
});

sections.forEach(section => observer.observe(section));

document.getElementById('prevSection').addEventListener('click', () => {
    const active = document.querySelector('.main-nav a.active');
    const index = active ? navLinks.indexOf(active) : 0;
    const next = Math.max(0, index - 1);
    sections[next].scrollIntoView({behavior: 'smooth'});
});

document.getElementById('nextSection').addEventListener('click', () => {
    const active = document.querySelector('.main-nav a.active');
    const index = active ? navLinks.indexOf(active) : 0;
    const next = Math.min(sections.length - 1, index + 1);
    sections[next].scrollIntoView({behavior: 'smooth'});
});

const menuToggle = document.getElementById('menuToggle');
const mainNav = document.getElementById('mainNav');

menuToggle.addEventListener('click', () => {
    mainNav.classList.toggle('open');
});

navLinks.forEach(link => {
    link.addEventListener('click', () => mainNav.classList.remove('open'));
});

const introText = `Un canal de comunicación en telecomunicaciones es el medio por el que una señal transporta información desde un emisor hasta un receptor. Los medios guiados utilizan un soporte físico, como par trenzado, coaxial o fibra óptica. Los medios no guiados utilizan ondas electromagnéticas que se propagan por el espacio, como radio, microondas, satélite e infrarrojo.`;

const summaryText = `En telecomunicaciones existen medios guiados y no guiados. Los guiados transportan señales por cables: par trenzado, coaxial y fibra óptica. Los no guiados usan ondas electromagnéticas: radio, microondas, satélite e infrarrojo. La elección depende de capacidad, distancia, interferencias, costo, movilidad y entorno.`;

function speak(textToRead, statusElement) {
    if (!('speechSynthesis' in window)) {
        statusElement.textContent = 'Tu navegador no tiene habilitada la función de voz.';
        return;
    }
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(textToRead);
    utterance.lang = 'es-MX';
    utterance.rate = 0.98;
    utterance.pitch = 1;
    utterance.onstart = () => statusElement.textContent = '🔊 Reproduciendo explicación...';
    utterance.onend = () => statusElement.textContent = '✅ Explicación terminada.';
    window.speechSynthesis.speak(utterance);
}

document.getElementById('speakIntro').addEventListener('click', () => {
    speak(introText, document.querySelector('.hero-text'));
});

const audioStatus = document.getElementById('audioStatus');

document.getElementById('speakSummary').addEventListener('click', () => {
    speak(summaryText, audioStatus);
});

document.getElementById('stopSpeech').addEventListener('click', () => {
    if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
        audioStatus.textContent = 'Audio detenido.';
    }
});

updateSection(0);


// ===============================
// SIMULADOR DE TRANSMISIÓN
// ===============================
const canvas = document.getElementById('transmissionCanvas');
const mediumSelect = document.getElementById('mediumSelect');
const dataInput = document.getElementById('dataInput');
const speedRange = document.getElementById('speedRange');
const noiseRange = document.getElementById('noiseRange');
const speedValue = document.getElementById('speedValue');
const noiseValue = document.getElementById('noiseValue');
const simState = document.getElementById('simState');
const currentBit = document.getElementById('currentBit');
const bitPosition = document.getElementById('bitPosition');
const simTypeTag = document.getElementById('simTypeTag');
const simTitle = document.getElementById('simTitle');
const simDescription = document.getElementById('simDescription');
const signalType = document.getElementById('signalType');
const signalPath = document.getElementById('signalPath');
const signalUse = document.getElementById('signalUse');
const signalComment = document.getElementById('signalComment');

if (canvas && mediumSelect) {
    const ctx = canvas.getContext('2d');
    const W = canvas.width;
    const H = canvas.height;

    const MEDIA = {
        twisted: {
            type: 'MEDIO GUIADO', title: 'Par trenzado',
            description: 'La señal eléctrica se representa desplazándose por dos conductores trenzados.',
            signal: 'Eléctrica', path: 'Cobre trenzado', use: 'Redes LAN',
            comment: 'El trenzado ayuda a reducir parte de la interferencia.', color: '#5f8cff'
        },
        coax: {
            type: 'MEDIO GUIADO', title: 'Cable coaxial',
            description: 'La señal eléctrica se representa dentro de un conductor central rodeado por una pantalla.',
            signal: 'Eléctrica', path: 'Cable coaxial', use: 'HFC / TV / CCTV',
            comment: 'La pantalla conductora ayuda a proteger la señal.', color: '#b68cff'
        },
        fiber: {
            type: 'MEDIO GUIADO', title: 'Fibra óptica',
            description: 'Un pulso luminoso viaja por la fibra y lleva los bits hacia el receptor.',
            signal: 'Luz', path: 'Fibra óptica', use: 'FTTH / backbone',
            comment: 'El pulso se representa como luz dentro de la fibra.', color: '#56e0ea'
        },
        radio: {
            type: 'MEDIO NO GUIADO', title: 'Ondas de radio',
            description: 'La información se representa mediante ondas electromagnéticas que se propagan por el espacio.',
            signal: 'Ondas EM', path: 'Espacio / aire', use: 'Wi‑Fi / móvil / IoT',
            comment: 'La señal se dispersa desde la antena hacia el receptor.', color: '#7fd8ff'
        },
        microwave: {
            type: 'MEDIO NO GUIADO', title: 'Microondas',
            description: 'Un haz direccional conecta dos antenas a distancia.',
            signal: 'Ondas EM', path: 'Espacio / aire', use: 'Enlace punto a punto',
            comment: 'La representación enfatiza la dirección del enlace.', color: '#98aaff'
        },
        satellite: {
            type: 'MEDIO NO GUIADO', title: 'Satélite',
            description: 'La señal sube desde una estación terrestre, pasa por el satélite y baja al receptor.',
            signal: 'Ondas EM', path: 'Espacio / satélite', use: 'Cobertura amplia',
            comment: 'Se muestra el trayecto de subida y bajada.', color: '#9deff2'
        },
        infrared: {
            type: 'MEDIO NO GUIADO', title: 'Infrarrojo',
            description: 'Un haz de corto alcance representa el envío de información mediante radiación infrarroja.',
            signal: 'Luz IR', path: 'Aire / corto alcance', use: 'Sensores / controles',
            comment: 'Los obstáculos pueden bloquear el enlace.', color: '#ffba7e'
        }
    };

    let bits = '10110010';
    let running = false;
    let raf = 0;
    let lastTime = performance.now();
    let elapsed = 0;
    let progress = 0;
    let activeBitIndex = 0;
    let completedCycles = 0;

    function sanitizeBits() {
        let clean = dataInput.value.replace(/[^01]/g, '').slice(0, 16);
        if (!clean) clean = '10110010';
        bits = clean;
        dataInput.value = clean;
        activeBitIndex = 0;
        progress = 0;
        completedCycles = 0;
        updateReadout();
    }

    function currentMedia() {
        return MEDIA[mediumSelect.value] || MEDIA.twisted;
    }

    function updateReadout() {
        const m = currentMedia();
        simTypeTag.textContent = m.type;
        simTitle.textContent = m.title;
        simDescription.textContent = m.description;
        signalType.textContent = m.signal;
        signalPath.textContent = m.path;
        signalUse.textContent = m.use;
        signalComment.textContent = m.comment;
        speedValue.textContent = `${Number(speedRange.value).toFixed(1)}×`;
        noiseValue.textContent = `${noiseRange.value}%`;
        currentBit.textContent = bits[activeBitIndex] ?? '—';
        bitPosition.textContent = `${Math.min(activeBitIndex + 1, bits.length)} / ${bits.length}`;
    }

    function line(x1, y1, x2, y2, stroke, width=2, alpha=1, dash=[]) {
        ctx.save();
        ctx.globalAlpha = alpha;
        ctx.strokeStyle = stroke;
        ctx.lineWidth = width;
        ctx.setLineDash(dash);
        ctx.beginPath();
        ctx.moveTo(x1, y1);
        ctx.lineTo(x2, y2);
        ctx.stroke();
        ctx.restore();
    }

    function circle(x, y, r, fill, alpha=1, shadow=0) {
        ctx.save();
        ctx.globalAlpha = alpha;
        if (shadow) {
            ctx.shadowColor = fill;
            ctx.shadowBlur = shadow;
        }
        ctx.fillStyle = fill;
        ctx.beginPath();
        ctx.arc(x, y, r, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
    }

    function roundedRect(x, y, w, h, r, fill, stroke=null, alpha=1) {
        ctx.save();
        ctx.globalAlpha = alpha;
        ctx.fillStyle = fill;
        ctx.beginPath();
        ctx.roundRect(x, y, w, h, r);
        ctx.fill();
        if (stroke) {
            ctx.strokeStyle = stroke;
            ctx.lineWidth = 1;
            ctx.stroke();
        }
        ctx.restore();
    }

    function text(txt, x, y, size, fill, align='left', weight='500') {
        ctx.save();
        ctx.font = `${weight} ${size}px Inter, Segoe UI, sans-serif`;
        ctx.fillStyle = fill;
        ctx.textAlign = align;
        ctx.fillText(txt, x, y);
        ctx.restore();
    }

    function drawGrid() {
        ctx.clearRect(0, 0, W, H);
        ctx.fillStyle = '#0d1522';
        ctx.fillRect(0, 0, W, H);
        for (let x=40; x<W; x+=50) line(x, 30, x, H-30, '#20304a', 1, .28);
        for (let y=45; y<H; y+=42) line(30, y, W-30, y, '#20304a', 1, .22);
    }

    function drawStations() {
        roundedRect(48, 178, 112, 116, 17, '#152238', '#2e405c');
        roundedRect(W-160, 178, 112, 116, 17, '#152238', '#2e405c');
        circle(104, 220, 26, '#273c5b');
        circle(W-104, 220, 26, '#273c5b');
        text('TX', 104, 227, 15, '#dce7f6', 'center', '800');
        text('RX', W-104, 227, 15, '#dce7f6', 'center', '800');
        text('Datos', 104, 264, 12, '#88a0bf', 'center');
        text('Información', W-104, 264, 12, '#88a0bf', 'center');
    }

    function drawBitBar() {
        const y = H - 56;
        const x0 = 195;
        const x1 = W - 195;
        roundedRect(x0, y-17, x1-x0, 34, 10, '#131f32', '#24344d');
        const cellW = (x1-x0) / bits.length;
        bits.split('').forEach((b, i) => {
            const x = x0 + i*cellW;
            const isActive = i === activeBitIndex;
            if (i > 0) line(x, y-17, x, y+17, '#24344d', 1, .75);
            roundedRect(x+3, y-12, cellW-6, 24, 7, isActive ? '#254b8f' : '#17263d');
            text(b, x+cellW/2, y+6, 13, isActive ? '#ffffff' : '#90a6c4', 'center', '800');
        });
        text('TRAMA DE DATOS', x0, y-26, 10, '#7b8fae', 'left', '800');
    }

    function drawTwisted(m) {
        const y1=154, y2=248, x0=175, x1=W-175;
        const steps=120;
        ctx.save();
        ctx.lineWidth=7;
        ctx.strokeStyle='#c88e54';
        ctx.beginPath();
        for(let i=0;i<=steps;i++){
            const x=x0+(x1-x0)*i/steps;
            const y=y1 + Math.sin(i/steps*Math.PI*10 + elapsed*0.015)*15;
            i===0?ctx.moveTo(x,y):ctx.lineTo(x,y);
        }
        ctx.stroke();
        ctx.strokeStyle='#6da2ff';
        ctx.beginPath();
        for(let i=0;i<=steps;i++){
            const x=x0+(x1-x0)*i/steps;
            const y=y2 + Math.sin(i/steps*Math.PI*10 + elapsed*0.015 + Math.PI)*15;
            i===0?ctx.moveTo(x,y):ctx.lineTo(x,y);
        }
        ctx.stroke();
        ctx.restore();
        drawPulseOnPath((t)=>({x:x0+(x1-x0)*t, y:y1 + Math.sin(t*Math.PI*10 + elapsed*0.015)*15}), m.color);
    }

    function drawCoax(m) {
        const x0=175, x1=W-175, y=200;
        line(x0, y, x1, y, '#66758f', 30, .32);
        line(x0, y, x1, y, '#a7b1c0', 18, .33);
        line(x0, y, x1, y, '#e0b269', 6, 1);
        line(x0, y-4, x1, y-4, '#7c92b3', 14, .4);
        drawPulseOnPath((t)=>({x:x0+(x1-x0)*t,y:y}), m.color);
        text('Conductor central', x0, y-35, 11, '#7e91ad');
    }

    function drawFiber(m) {
        const x0=175, x1=W-175;
        ctx.save();
        ctx.lineCap='round';
        line(x0, 201, x1, 201, '#293b57', 34, 1);
        line(x0, 201, x1, 201, '#152238', 24, 1);
        line(x0, 201, x1, 201, '#7ce9f2', 5, .55);
        ctx.restore();
        const t=Math.max(.02, progress);
        const x=x0+(x1-x0)*t;
        circle(x, 201, 10, m.color, .8, 26);
        circle(x, 201, 5, '#effcff', 1, 18);
        text('Pulso de luz', x0, 250, 11, '#79bfc9');
    }

    function drawRadio(m) {
        const ax=175, bx=W-175, y=200;
        line(ax, y-38, ax, y+42, '#7f91ac', 6, 1);
        line(bx, y-38, bx, y+42, '#7f91ac', 6, 1);
        circle(ax, y-42, 8, m.color, 1, 12);
        circle(bx, y-42, 8, m.color, 1, 12);
        const p=progress;
        for(let k=1;k<=4;k++){
            const startX=ax+12;
            const endX=bx-12;
            const phase=(p*1.8 - k*0.18);
            const alpha=.25 + k*.12;
            ctx.save();
            ctx.strokeStyle=m.color;
            ctx.globalAlpha=Math.min(.9, alpha);
            ctx.lineWidth=2.4;
            ctx.beginPath();
            for(let i=0;i<=100;i++){
                const t=i/100;
                const x=startX+(endX-startX)*t;
                const amp=28/(k*.7);
                const yy=y + Math.sin(t*Math.PI*12 - elapsed*.02* (1 + k*.05) + phase)*amp;
                i===0?ctx.moveTo(x,yy):ctx.lineTo(x,yy);
            }
            ctx.stroke();
            ctx.restore();
        }
        drawMovingDotOnLine(ax+10, bx-10, y, y, progress, m.color);
    }

    function drawMicrowave(m) {
        const ax=180, bx=W-180, y=205;
        line(ax, 120, ax, 300, '#7387a5', 7);
        line(bx, 120, bx, 300, '#7387a5', 7);
        line(ax, y, bx, y, '#3a4b64', 2, .5, [8, 8]);
        for(let i=0;i<6;i++){
            const offset=i*18;
            const x=ax+30+offset+(bx-ax-60)*progress*.45;
            ctx.save();
            ctx.strokeStyle=m.color;
            ctx.globalAlpha=.12+.11*i;
            ctx.lineWidth=3;
            ctx.beginPath();
            ctx.moveTo(x, y-26);
            ctx.lineTo(x+25, y);
            ctx.lineTo(x, y+26);
            ctx.stroke();
            ctx.restore();
        }
        drawMovingDotOnLine(ax+10, bx-10, y, y, progress, m.color);
        text('Enlace direccional', (ax+bx)/2, 257, 11, '#8ea2c2', 'center');
    }

    function drawSatellite(m) {
        const tx=190, rx=W-190, sy=125;
        line(tx, 250, tx, 310, '#7489a8', 6);
        line(rx, 250, rx, 310, '#7489a8', 6);
        circle(200, sy, 31, '#253850');
        roundedRect(180, 105, 40, 40, 8, '#a6bacd');
        line(130, 113, 172, 113, '#8dcde3', 8);
        line(228, 137, 270, 137, '#8dcde3', 8);
        ctx.save();
        ctx.strokeStyle=m.color;
        ctx.lineWidth=3;
        ctx.globalAlpha=.88;
        ctx.beginPath();
        ctx.moveTo(tx, 250);
        ctx.quadraticCurveTo(tx+30, 155, 200, sy+30);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(200, sy+30);
        ctx.quadraticCurveTo(rx-30, 155, rx, 250);
        ctx.stroke();
        ctx.restore();
        const p=progress;
        if(p<=.5){
            const t=p*2;
            const x=tx+(200-tx)*t;
            const y=(1-t)*(1-t)*250+2*(1-t)*t*155+t*t*(sy+30);
            circle(x,y,7,m.color,1,22);
        }else{
            const t=(p-.5)*2;
            const x=200+(rx-200)*t;
            const y=(1-t)*(1-t)*(sy+30)+2*(1-t)*t*155+t*t*250;
            circle(x,y,7,m.color,1,22);
        }
        text('Satélite', 200, 175, 11, '#9caec6', 'center');
    }

    function drawInfrared(m) {
        const ax=176, bx=W-176, y=202;
        roundedRect(ax-35, y-55, 70, 100, 15, '#18283f', '#344964');
        roundedRect(bx-35, y-55, 70, 100, 15, '#18283f', '#344964');
        circle(ax, y-8, 14, '#ff8d63', .9, 18);
        circle(bx, y-8, 14, '#ff8d63', .9, 18);
        line(ax+40, y-8, bx-40, y-8, m.color, 7, .18);
        for(let i=0;i<4;i++){
            const t=Math.min(1, Math.max(0, progress+i*.14));
            const x=ax+40+(bx-ax-80)*t% (bx-ax-80);
            circle(x, y-8, 5, m.color, .8, 12);
        }
        text('Haz de corto alcance', (ax+bx)/2, 255, 11, '#aa9a8b', 'center');
    }

    function drawPulseOnPath(pointFn, color) {
        const t=progress;
        const pt=pointFn(t);
        circle(pt.x, pt.y, 9, color, .28, 30);
        circle(pt.x, pt.y, 4.8, '#ffffff', 1, 14);
    }

    function drawMovingDotOnLine(x0,y0,x1,y1,t,color){
        circle(x0+(x1-x0)*t, y0+(y1-y0)*t, 7, color, 1, 22);
    }

    function drawNoise(amount) {
        if(amount<=0) return;
        const m=currentMedia();
        const count=Math.round(amount*0.6);
        const x0=176, x1=W-176;
        for(let i=0;i<count;i++){
            const x=x0+Math.random()*(x1-x0);
            const y=75+Math.random()*270;
            circle(x,y,1.4,'#f28b55',.22);
        }
        if(amount>=24){
            line(x0, 315, x1, 315, '#f28b55', 1, .22, [3,6]);
        }
    }

    function render() {
        const m=currentMedia();
        drawGrid();
        drawStations();
        if(mediumSelect.value==='twisted') drawTwisted(m);
        if(mediumSelect.value==='coax') drawCoax(m);
        if(mediumSelect.value==='fiber') drawFiber(m);
        if(mediumSelect.value==='radio') drawRadio(m);
        if(mediumSelect.value==='microwave') drawMicrowave(m);
        if(mediumSelect.value==='satellite') drawSatellite(m);
        if(mediumSelect.value==='infrared') drawInfrared(m);
        drawNoise(Number(noiseRange.value));
        drawBitBar();
    }

    function tick(now) {
        const dt=Math.min(50, now-lastTime);
        lastTime=now;
        if(running){
            const speed=Number(speedRange.value);
            elapsed += dt*speed;
            progress += (dt/1750)*speed;
            if(progress>=1){
                progress=0;
                activeBitIndex++;
                if(activeBitIndex>=bits.length){
                    activeBitIndex=0;
                    completedCycles++;
                }
                currentBit.textContent=bits[activeBitIndex];
                bitPosition.textContent=`${activeBitIndex+1} / ${bits.length}`;
            }
        }
        render();
        raf=requestAnimationFrame(tick);
    }

    document.getElementById('startSim').addEventListener('click', () => {
        running=true;
        simState.textContent='Transmitiendo';
    });
    document.getElementById('pauseSim').addEventListener('click', () => {
        running=false;
        simState.textContent='Pausado';
    });
    document.getElementById('resetSim').addEventListener('click', () => {
        running=false;
        progress=0;
        activeBitIndex=0;
        completedCycles=0;
        simState.textContent='Listo';
        updateReadout();
        render();
    });

    dataInput.addEventListener('input', sanitizeBits);
    dataInput.addEventListener('blur', sanitizeBits);
    mediumSelect.addEventListener('change', () => {
        updateReadout();
        render();
    });
    speedRange.addEventListener('input', updateReadout);
    noiseRange.addEventListener('input', () => {
        updateReadout();
        render();
    });

    updateReadout();
    render();
    raf=requestAnimationFrame(tick);
}
