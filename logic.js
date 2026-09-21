const RONDAS_TOTALES = 5;
const MONEDAS_INICIALES = 100;
const APUESTAS_FIJAS = [10, 25, 50];
const RACHA_MINIMA_BONUS = 2;
const MULTIPLICADOR_RACHA = 1.5;
const META = 100;
const INTERVALO_MS = 100;
const MAX_RANKING = 10;

// "ventaja" es un empujón fijo por tick: cuanto más favorito, más ventaja y menos cuota.
// Con estos valores ganan aprox. un 35 %, 27 %, 21 % y 16 % de las carreras.
const CABALLOS = [
    { nombre: 'Trueno', cuota: 2.5, ventaja: 0.06, color: '#60a5fa' },
    { nombre: 'Relámpago', cuota: 3.5, ventaja: 0.04, color: '#f472b6' },
    { nombre: 'Bronco', cuota: 4.5, ventaja: 0.02, color: '#fbbf24' },
    { nombre: 'Rocinante', cuota: 6, ventaja: 0, color: '#a78bfa' }
];

const estado = {
    ronda: 1,
    monedas: MONEDAS_INICIALES,
    racha: 0,
    caballoElegido: null,
    apuesta: 0,
    ranking: []
};

const pista = document.getElementById('pista');
const spanRonda = document.getElementById('ronda');
const spanMonedas = document.getElementById('monedas');
const spanRacha = document.getElementById('racha');
const panelApuesta = document.getElementById('panel-apuesta');
const panelResultado = document.getElementById('panel-resultado');
const panelFin = document.getElementById('panel-fin');
const botonesCaballos = document.getElementById('botones-caballos');
const botonesApuesta = document.getElementById('botones-apuesta');
const btnCorrer = document.getElementById('btn-correr');
const btnSiguiente = document.getElementById('btn-siguiente');
const btnReiniciar = document.getElementById('btn-reiniciar');
const mensaje = document.getElementById('mensaje');
const mensajeFinal = document.getElementById('mensaje-final');
const formRanking = document.getElementById('form-ranking');
const inputNombre = document.getElementById('nombre');
const listaRanking = document.getElementById('lista-ranking');
const rankingVacio = document.getElementById('ranking-vacio');

const carriles = [];
const corredores = [];

function crearPista() {
    CABALLOS.forEach((caballo) => {
        const carril = document.createElement('div');
        carril.className = 'carril';
        carril.style.setProperty('--color', caballo.color);

        const nombre = document.createElement('span');
        nombre.className = 'carril-nombre';
        nombre.textContent = `${caballo.nombre} (x${caballo.cuota})`;

        const recorrido = document.createElement('div');
        recorrido.className = 'recorrido';

        const corredor = document.createElement('span');
        corredor.className = 'corredor';
        corredor.textContent = '🏇';

        recorrido.appendChild(corredor);
        carril.append(nombre, recorrido);
        pista.appendChild(carril);

        carriles.push(carril);
        corredores.push(corredor);
    });
}

function reiniciarPista() {
    carriles.forEach((carril) => carril.classList.remove('ganador'));
    corredores.forEach((corredor) => {
        corredor.style.left = '0%';
    });
}

function mostrarPanel(panel) {
    [panelApuesta, panelResultado, panelFin].forEach((p) => {
        p.hidden = p !== panel;
    });
}

function actualizarMarcador() {
    spanRonda.textContent = estado.ronda;
    spanMonedas.textContent = estado.monedas;
    spanRacha.textContent = estado.racha;
}

function actualizarBotonCorrer() {
    btnCorrer.disabled = estado.caballoElegido === null || estado.apuesta === 0;
}

function marcarSeleccion(contenedor, botonActivo) {
    contenedor.querySelectorAll('button').forEach((boton) => {
        const activo = boton === botonActivo;
        boton.classList.toggle('seleccionado', activo);
        boton.setAttribute('aria-pressed', String(activo));
    });
}

function pintarBotonesCaballos() {
    botonesCaballos.replaceChildren();
    CABALLOS.forEach((caballo, indice) => {
        const boton = document.createElement('button');
        boton.type = 'button';
        boton.textContent = `${caballo.nombre} (x${caballo.cuota})`;
        boton.addEventListener('click', () => {
            estado.caballoElegido = indice;
            marcarSeleccion(botonesCaballos, boton);
            actualizarBotonCorrer();
        });
        botonesCaballos.appendChild(boton);
    });
}

function pintarBotonesApuesta() {
    botonesApuesta.replaceChildren();
    const cantidades = APUESTAS_FIJAS.filter((cantidad) => cantidad < estado.monedas);
    cantidades.push(estado.monedas);

    cantidades.forEach((cantidad) => {
        const boton = document.createElement('button');
        boton.type = 'button';
        boton.textContent = cantidad === estado.monedas ? `Todo (${cantidad})` : String(cantidad);
        boton.addEventListener('click', () => {
            estado.apuesta = cantidad;
            marcarSeleccion(botonesApuesta, boton);
            actualizarBotonCorrer();
        });
        botonesApuesta.appendChild(boton);
    });
}

function iniciarRonda() {
    estado.caballoElegido = null;
    estado.apuesta = 0;
    reiniciarPista();
    pintarBotonesCaballos();
    pintarBotonesApuesta();
    actualizarMarcador();
    actualizarBotonCorrer();
    mostrarPanel(panelApuesta);
}

function correrCarrera() {
    const posiciones = CABALLOS.map(() => 0);

    mensaje.className = 'mensaje';
    mensaje.textContent = '¡Y salen los caballos!';
    btnSiguiente.hidden = true;
    mostrarPanel(panelResultado);

    const temporizador = setInterval(() => {
        CABALLOS.forEach((caballo, indice) => {
            posiciones[indice] += caballo.ventaja + Math.random() * 3;
            corredores[indice].style.left = `${Math.min(META, posiciones[indice])}%`;
        });

        if (posiciones.some((posicion) => posicion >= META)) {
            clearInterval(temporizador);
            resolverCarrera(posiciones.indexOf(Math.max(...posiciones)));
        }
    }, INTERVALO_MS);
}

function partidaTerminada() {
    return estado.ronda >= RONDAS_TOTALES || estado.monedas <= 0;
}

function resolverCarrera(ganador) {
    const caballo = CABALLOS[ganador];
    carriles[ganador].classList.add('ganador');

    if (ganador === estado.caballoElegido) {
        estado.racha += 1;
        const conBonus = estado.racha >= RACHA_MINIMA_BONUS;
        const beneficio = estado.apuesta * (caballo.cuota - 1);
        const ganancia = Math.round(conBonus ? beneficio * MULTIPLICADOR_RACHA : beneficio);
        const textoBonus = conBonus ? ` (bonus de racha x${MULTIPLICADOR_RACHA})` : '';

        estado.monedas += ganancia;
        mensaje.className = 'mensaje acierto';
        mensaje.textContent = `¡Ganó ${caballo.nombre}! Ganas ${ganancia} monedas${textoBonus}.`;
    } else {
        estado.racha = 0;
        estado.monedas -= estado.apuesta;
        mensaje.className = 'mensaje fallo';
        mensaje.textContent = `Ganó ${caballo.nombre}. Pierdes ${estado.apuesta} monedas.`;
    }

    actualizarMarcador();
    btnSiguiente.textContent = partidaTerminada() ? 'Ver resultado final' : 'Siguiente carrera';
    btnSiguiente.hidden = false;
}

function terminarPartida() {
    mensajeFinal.textContent = `Has acabado con ${estado.monedas} monedas.`;
    inputNombre.value = '';
    formRanking.hidden = false;
    mostrarPanel(panelFin);
}

function pintarRanking() {
    listaRanking.replaceChildren();
    estado.ranking.forEach((entrada) => {
        const item = document.createElement('li');
        item.textContent = `${entrada.nombre} — ${entrada.monedas} monedas`;
        listaRanking.appendChild(item);
    });
    rankingVacio.hidden = estado.ranking.length > 0;
}

function guardarPuntuacion(evento) {
    evento.preventDefault();
    estado.ranking.push({
        nombre: inputNombre.value.trim() || 'Jinete anónimo',
        monedas: estado.monedas
    });
    estado.ranking.sort((a, b) => b.monedas - a.monedas);
    estado.ranking.splice(MAX_RANKING);
    pintarRanking();
    formRanking.hidden = true;
}

function reiniciarPartida() {
    estado.ronda = 1;
    estado.monedas = MONEDAS_INICIALES;
    estado.racha = 0;
    iniciarRonda();
}

btnCorrer.addEventListener('click', correrCarrera);
btnSiguiente.addEventListener('click', () => {
    if (partidaTerminada()) {
        terminarPartida();
    } else {
        estado.ronda += 1;
        iniciarRonda();
    }
});
btnReiniciar.addEventListener('click', reiniciarPartida);
formRanking.addEventListener('submit', guardarPuntuacion);

// Pulsar "B" alterna entre modo claro y oscuro (salvo si se está escribiendo en un campo).
document.addEventListener('keydown', (evento) => {
    const escribiendo = evento.target.closest('input, textarea');
    const conModificador = evento.ctrlKey || evento.metaKey || evento.altKey;
    if (evento.key.toLowerCase() === 'b' && !escribiendo && !conModificador) {
        document.documentElement.classList.toggle('oscuro');
    }
});

crearPista();
pintarRanking();
iniciarRonda();
