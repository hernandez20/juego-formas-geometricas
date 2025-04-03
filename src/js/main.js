const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
let isDrawing = false;
let puntos = [];
let figuraActual = null;
let figuras = [
    { tipo: 'cuadrado', ancho: 200, alto: 200 },

    { tipo: 'triangulo', ancho: 200, alto: 200 },
    { tipo: 'circulo', radio: 100 },
];
let indiceFigura = 0;

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

window.addEventListener('resize', () => {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    dibujarFigura();
});

dibujarFigura();

canvas.addEventListener('mousedown', (e) => {
    e.preventDefault();
    isDrawing = true;
    puntos = [{ x: e.offsetX, y: e.offsetY }];
});

canvas.addEventListener('mousemove', (e) => {
    if (isDrawing) {
        puntos.push({ x: e.offsetX, y: e.offsetY });
        ctx.beginPath();
        ctx.strokeStyle = 'yellow';
        ctx.lineWidth = 10;
        ctx.moveTo(puntos[puntos.length - 2].x, puntos[puntos.length - 2].y);
        ctx.lineTo(e.offsetX, e.offsetY);
        ctx.stroke();
    }
});

canvas.addEventListener('mouseup', () => {
    isDrawing = false;
    verificarTrazo();
    puntos = [];
});


canvas.addEventListener('touchstart', (e) => {

    e.preventDefault();
    isDrawing = true;
    puntos = [{ x: e.touches[0].clientX, y: e.touches[0].clientY }];
});

canvas.addEventListener('touchmove', (e) => {
    e.preventDefault();
    if (isDrawing) {
        puntos.push({ x: e.touches[0].clientX, y: e.touches[0].clientY });
        ctx.beginPath();
        ctx.strokeStyle = 'yellow';
        ctx.lineWidth = 10;
        ctx.moveTo(puntos[puntos.length - 2].x, puntos[puntos.length - 2].y);
        ctx.lineTo(e.touches[0].clientX, e.touches[0].clientY);
        ctx.stroke();
    }
});

canvas.addEventListener('touchend', () => {
    isDrawing = false;
    verificarTrazo();
    puntos = [];
});




function dibujarFigura() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    figuraActual = figuras[indiceFigura];

    const centroX = canvas.width / 2;
    const centroY = canvas.height / 2;

    switch (figuraActual.tipo) {
        case 'triangulo':
            figuraActual.vertices = [
                { x: centroX - figuraActual.ancho / 2, y: centroY + figuraActual.alto / 2 },
                { x: centroX + figuraActual.ancho / 2, y: centroY + figuraActual.alto / 2 },
                { x: centroX, y: centroY - figuraActual.alto / 2 }
            ];

            ctx.beginPath();
            ctx.strokeStyle = 'gray';
            ctx.lineWidth = 10;
            ctx.moveTo(figuraActual.vertices[0].x, figuraActual.vertices[0].y);
            ctx.lineTo(figuraActual.vertices[1].x, figuraActual.vertices[1].y);
            ctx.lineTo(figuraActual.vertices[2].x, figuraActual.vertices[2].y);
            ctx.closePath();
            ctx.stroke();
            break;

        case 'circulo':
            figuraActual.centro = { x: centroX, y: centroY };
            ctx.beginPath();
            ctx.strokeStyle = 'gray';
            ctx.lineWidth = 10;
            ctx.arc(centroX, centroY, figuraActual.radio, 0, 2 * Math.PI);
            ctx.stroke();
            break;

        case 'cuadrado':
            figuraActual.x = centroX - figuraActual.ancho / 2;
            figuraActual.y = centroY - figuraActual.alto / 2;
            ctx.beginPath();
            ctx.strokeStyle = 'gray';
            ctx.lineWidth = 10;
            ctx.rect(figuraActual.x, figuraActual.y, figuraActual.ancho, figuraActual.alto);
            ctx.stroke();
            break;
    }
}

function verificarTrazo() {
    let longitudCubierta = 0;
    let longitudTotalBorde = 0;

    switch (figuraActual.tipo) {
        case 'triangulo':
            const vertices = figuraActual.vertices;
            longitudCubierta = verificarCercaniaAlTriangulo(puntos, vertices, 20);
            longitudTotalBorde = calcularLongitudTriangulo(vertices);
            break;

        case 'circulo':
            longitudCubierta = verificarCercaniaAlCirculo(puntos, figuraActual.centro, figuraActual.radio, 10);
            longitudTotalBorde = 2 * Math.PI * figuraActual.radio;
            break;

        case 'cuadrado':
            longitudCubierta = verificarCercaniaAlCuadrado(puntos, figuraActual, 10);
            longitudTotalBorde = 2 * (figuraActual.ancho + figuraActual.alto);
            break;
    }

    const porcentajeCubierto = (longitudCubierta / longitudTotalBorde) * 100;
    if (porcentajeCubierto >= 70) {
        alert(`¡Bien! Has cubierto al menos el 70% del borde del ${figuraActual.tipo}.`);
        avanzarFigura();
    } else {
        alert(`No has cubierto al menos el 70% del borde del ${figuraActual.tipo}. Intenta nuevamente.`);
    }
}

function verificarCercaniaAlTriangulo(puntos, vertices, tolerancia) {
    const lados = [
        calcularEcuacionLinea(vertices[0], vertices[1]),
        calcularEcuacionLinea(vertices[1], vertices[2]),
        calcularEcuacionLinea(vertices[2], vertices[0])
    ];

    let longitudCubierta = 0;

    for (let i = 0; i < puntos.length - 1; i++) {
        const punto1 = puntos[i];
        const punto2 = puntos[i + 1];

        for (const lado of lados) {
            if (calcularDistanciaALinea(punto1, lado) <= tolerancia ||
                calcularDistanciaALinea(punto2, lado) <= tolerancia) {
                longitudCubierta += calcularDistancia(punto1, punto2);
                break;
            }
        }
    }

    return longitudCubierta;
}

function verificarCercaniaAlCirculo(puntos, centro, radio, tolerancia) {
    let longitudCubierta = 0;

    for (let i = 0; i < puntos.length - 1; i++) {
        const distancia1 = Math.abs(calcularDistancia(puntos[i], centro) - radio);
        const distancia2 = Math.abs(calcularDistancia(puntos[i + 1], centro) - radio);

        if (distancia1 <= tolerancia || distancia2 <= tolerancia) {
            longitudCubierta += calcularDistancia(puntos[i], puntos[i + 1]);
        }
    }

    return longitudCubierta;
}

function verificarCercaniaAlCuadrado(puntos, figura, tolerancia) {
    let longitudCubierta = 0;

    for (let i = 0; i < puntos.length - 1; i++) {
        const punto1 = puntos[i];
        const punto2 = puntos[i + 1];

        const cercaLadoIzquierdo =
            Math.abs(punto1.x - figura.x) <= tolerancia &&
            Math.abs(punto2.x - figura.x) <= tolerancia &&
            punto1.y >= figura.y &&
            punto1.y <= figura.y + figura.alto &&
            punto2.y >= figura.y &&
            punto2.y <= figura.y + figura.alto;

        const cercaLadoDerecho =
            Math.abs(punto1.x - (figura.x + figura.ancho)) <= tolerancia &&
            Math.abs(punto2.x - (figura.x + figura.ancho)) <= tolerancia &&
            punto1.y >= figura.y &&
            punto1.y <= figura.y + figura.alto &&
            punto2.y >= figura.y &&
            punto2.y <= figura.y + figura.alto;

        const cercaLadoSuperior =
            Math.abs(punto1.y - figura.y) <= tolerancia &&
            Math.abs(punto2.y - figura.y) <= tolerancia &&
            punto1.x >= figura.x &&
            punto1.x <= figura.x + figura.ancho &&
            punto2.x >= figura.x &&
            punto2.x <= figura.x + figura.ancho;

        const cercaLadoInferior =
            Math.abs(punto1.y - (figura.y + figura.alto)) <= tolerancia &&
            Math.abs(punto2.y - (figura.y + figura.alto)) <= tolerancia &&
            punto1.x >= figura.x &&
            punto1.x <= figura.x + figura.ancho &&
            punto2.x >= figura.x &&
            punto2.x <= figura.x + figura.ancho;

        if (
            cercaLadoIzquierdo ||
            cercaLadoDerecho ||
            cercaLadoSuperior ||
            cercaLadoInferior
        ) {
            longitudCubierta += calcularDistancia(punto1, punto2);
        }
    }

    return longitudCubierta;
}







function calcularEcuacionLinea(p1, p2) {
    const A = p2.y - p1.y;
    const B = p1.x - p2.x;
    const C = p2.x * p1.y - p1.x * p2.y;
    return { A, B, C };
}

function calcularDistanciaALinea(punto, linea) {
    const { A, B, C } = linea;
    return Math.abs(A * punto.x + B * punto.y + C) / Math.sqrt(A ** 2 + B ** 2);
}

function calcularLongitudTriangulo(vertices) {
    return calcularDistancia(vertices[0], vertices[1]) +
        calcularDistancia(vertices[1], vertices[2]) +
        calcularDistancia(vertices[2], vertices[0]);
}

function calcularDistancia(p1, p2) {
    return Math.sqrt(Math.pow(p2.x - p1.x, 2) + Math.pow(p2.y - p1.y, 2));
}

function avanzarFigura() {
    indiceFigura++;
    if (indiceFigura >= figuras.length) {
        alert('¡Has completado todas las figuras!');
    } else {
        dibujarFigura();
    }
}
