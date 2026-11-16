
/* =================================
   DATOS DE LOS ANIMALES
================================= */

const ANIMALES = {
    gato1: {
        nombre: "Gato europeo común",
        tipo: "Gato",
        precio: 15000
    },
    gato2: {
        nombre: "Maine Coon",
        tipo: "Gato",
        precio: 25000
    },
    perro1: {
        nombre: "Golden Retriever",
        tipo: "Perro",
        precio: 30000
    },
    perro2: {
        nombre: "Ovejero Alemán",
        tipo: "Perro",
        precio: 28000
    },
    conejo1: {
        nombre: "Cabeza de León",
        tipo: "Conejo",
        precio: 12000
    },
    conejo2: {
        nombre: "Mini Lop",
        tipo: "Conejo",
        precio: 10000
    }
};

const WHATSAPP_NUMERO = "5493564581110";
const CLAVE_STORAGE = "carritoAnimales";

let carrito = {};
let idInfoActual = null;

/* =================================
   RELACIONAR ANIMALES CON HTML
================================= */

const tarjetas = {
    g: "gato1",
    g1: "gato2",
    p: "perro1",
    p1: "perro2",
    c: "conejo1",
    c1: "conejo2"
};

document.querySelectorAll(
    ".g, .g1, .p, .p1, .c, .c1"
).forEach(function(tarjeta) {

    let id = null;

    Object.keys(tarjetas).forEach(function(clase) {
        if (tarjeta.classList.contains(clase)) {
            id = tarjetas[clase];
        }
    });

    if (!id) return;

    const botones = tarjeta.querySelectorAll(
        'input[type="button"]'
    );

    if (botones[0]) {
        botones[0].dataset.accion = "info";
        botones[0].dataset.id = id;
    }

    if (botones[1]) {
        botones[1].dataset.accion = "comprar";
        botones[1].dataset.id = id;
    }
});

/* =================================
   CREAR BOTÓN DEL CARRITO
================================= */

const btnCarrito = document.createElement("button");

btnCarrito.id = "btnCarrito";
btnCarrito.type = "button";
btnCarrito.textContent = "Carrito (0)";

document.querySelector("header").appendChild(btnCarrito);

/* =================================
   GUARDAR Y CARGAR CARRITO
================================= */

function cargarCarrito() {
    try {
        carrito = JSON.parse(
            localStorage.getItem(CLAVE_STORAGE)
        ) || {};
    } catch (error) {
        carrito = {};
    }

    Object.keys(carrito).forEach(function(id) {
        if (!ANIMALES[id] || carrito[id] <= 0) {
            delete carrito[id];
        }
    });
}

function guardarCarrito() {
    localStorage.setItem(
        CLAVE_STORAGE,
        JSON.stringify(carrito)
    );
}

/* =================================
   FUNCIONES GENERALES
================================= */

function formatoPrecio(precio) {
    return "$" + precio.toLocaleString("es-AR");
}

function totalProductos() {
    return Object.values(carrito).reduce(
        function(total, cantidad) {
            return total + cantidad;
        }, 0
    );
}

function totalPrecio() {
    return Object.keys(carrito).reduce(
        function(total, id) {
            return total +
                carrito[id] * ANIMALES[id].precio;
        }, 0
    );
}

function abrir(id) {
    document.getElementById(id).classList.add("abierto");
}

function cerrar(id) {
    document.getElementById(id).classList.remove("abierto");
}

/* =================================
   AVISOS
================================= */

let temporizadorAviso;

function mostrarAviso(texto) {
    const aviso = document.getElementById("aviso");

    aviso.textContent = texto;
    aviso.classList.add("visible");

    clearTimeout(temporizadorAviso);

    temporizadorAviso = setTimeout(function() {
        aviso.classList.remove("visible");
    }, 2200);
}

/* =================================
   AGREGAR AL CARRITO
================================= */

function agregarAlCarrito(id) {
    if (!ANIMALES[id]) return;

    carrito[id] = (carrito[id] || 0) + 1;

    guardarCarrito();
    renderCarrito();

    mostrarAviso(
        ANIMALES[id].nombre + " agregado al carrito"
    );
}

/* =================================
   CAMBIAR CANTIDAD
================================= */

function cambiarCantidad(id, cantidad) {
    if (!carrito[id]) return;

    carrito[id] += cantidad;

    if (carrito[id] <= 0) {
        delete carrito[id];
    }

    guardarCarrito();
    renderCarrito();
}

/* =================================
   ELIMINAR PRODUCTOS
================================= */

function quitarDelCarrito(id) {
    delete carrito[id];

    guardarCarrito();
    renderCarrito();
}

function vaciarCarrito() {
    carrito = {};

    guardarCarrito();
    renderCarrito();
}

/* =================================
   MOSTRAR CARRITO
================================= */

function renderCarrito() {

    const contador = document.getElementById("contador");

    // El HTML original no tiene contador.
    // Lo mostramos directamente en el botón.
    btnCarrito.textContent =
        "Carrito (" + totalProductos() + ")";

    const contenedor =
        document.getElementById("carritoItems");

    const pie =
        document.getElementById("carritoPie");

    const ids = Object.keys(carrito);

    if (ids.length === 0) {
        contenedor.textContent = "Tu carrito está vacío.";
        pie.style.display = "none";
        return;
    }

    pie.style.display = "block";

    contenedor.innerHTML = ids.map(function(id) {

        const animal = ANIMALES[id];
        const cantidad = carrito[id];

        return `
            <div class="item-carrito">
                <h4>${animal.nombre}</h4>

                <p>Precio: ${formatoPrecio(animal.precio)}</p>

                <p>Subtotal:
                ${formatoPrecio(animal.precio * cantidad)}</p>

                <button type="button"
                    data-cant="-1"
                    data-id="${id}">-</button>

                <span>${cantidad}</span>

                <button type="button"
                    data-cant="1"
                    data-id="${id}">+</button>

                <button type="button"
                    data-quitar="${id}">Eliminar</button>
            </div>
        `;
    }).join("");

    document.getElementById("carritoTotal").textContent =
        formatoPrecio(totalPrecio());
}

/* =================================
   VENTANA DE INFORMACIÓN
================================= */

function mostrarInfo(id) {

    const animal = ANIMALES[id];

    if (!animal) return;

    idInfoActual = id;

    document.getElementById("infoTitulo").textContent =
        animal.nombre;

    document.getElementById("infoDatos").innerHTML =
        "<p>Tipo: " + animal.tipo + "</p>" +
        "<p>Precio: " + formatoPrecio(animal.precio) + "</p>";

    document.getElementById("infoDescripcion").textContent =
        "Conocé más sobre " + animal.nombre + ".";

    // Cambiar el texto del botón sin tocar el HTML
    document.getElementById("infoComprar").textContent =
        "Agregar al carrito";

    abrir("overlayInfo");
}

/* =================================
   EVENTOS DE LOS BOTONES
================================= */

document.addEventListener("click", function(e) {

    const t = e.target;

    // Comprar mascota
    if (t.dataset.accion === "comprar") {
        agregarAlCarrito(t.dataset.id);
        return;
    }

    // Ver información
    if (t.dataset.accion === "info") {
        mostrarInfo(t.dataset.id);
        return;
    }

    // Aumentar o disminuir cantidad
    if (t.dataset.cant) {
        cambiarCantidad(
            t.dataset.id,
            parseInt(t.dataset.cant)
        );
        return;
    }

    // Eliminar producto
    if (t.dataset.quitar) {
        quitarDelCarrito(t.dataset.quitar);
        return;
    }

    // Cerrar ventanas
    if (t.dataset.cerrar) {
        cerrar(t.dataset.cerrar);
        return;
    }

    // Cerrar al hacer clic fuera
    if (t.classList.contains("overlay")) {
        t.classList.remove("abierto");
    }
});

/* =================================
   ABRIR CARRITO
================================= */

btnCarrito.addEventListener("click", function() {
    renderCarrito();
    abrir("overlayCarrito");
});

/* =================================
   COMPRAR DESDE INFORMACIÓN
================================= */

document.getElementById("infoComprar")
.addEventListener("click", function() {

    if (idInfoActual) {
        agregarAlCarrito(idInfoActual);
    }

    cerrar("overlayInfo");
});

/* =================================
   VACIAR CARRITO
================================= */

document.getElementById("btnVaciar")
.addEventListener("click", function() {

    vaciarCarrito();
    mostrarAviso("Carrito vaciado");
});

/* =================================
   ENVIAR PEDIDO POR WHATSAPP
================================= */

document.getElementById("btnEnviar")
.addEventListener("click", function() {

    if (totalProductos() === 0) {
        mostrarAviso("El carrito está vacío");
        return;
    }

    const nombre =
        document.getElementById("nombreCliente").value.trim();

    if (nombre === "") {
        document.getElementById("errorNombre").textContent =
            "Ingresá tu nombre para continuar.";
        return;
    }

    document.getElementById("errorNombre").textContent = "";

    let mensaje = "Hola! Quiero consultar por estos animales:\n\n";

    Object.keys(carrito).forEach(function(id) {

        const animal = ANIMALES[id];

        mensaje += carrito[id] + " x " +
            animal.nombre + " - " +
            formatoPrecio(carrito[id] * animal.precio) +
            "\n";
    });

    mensaje += "\nTotal: " + formatoPrecio(totalPrecio());
    mensaje += "\nNombre: " + nombre;

    const url = "https://wa.me/" +
        WHATSAPP_NUMERO +
        "?text=" + encodeURIComponent(mensaje);

    window.open(url, "_blank");
});

/* =================================
   LIMPIAR ERROR DEL NOMBRE
================================= */

document.getElementById("nombreCliente")
.addEventListener("input", function() {

    document.getElementById("errorNombre").textContent = "";
});

/* =================================
   CERRAR CON ESCAPE
================================= */

document.addEventListener("keydown", function(e) {

    if (e.key === "Escape") {
        cerrar("overlayInfo");
        cerrar("overlayCarrito");
    }
});

/* =================================
   ESTILOS DE LAS VENTANAS
   Se agregan desde JavaScript porque
   el HTML no conecta style.css.
================================= */

const estilos = document.createElement("style");

estilos.textContent = `
    #btnCarrito {
        background-color: white;
        color: #1e3a40;
        border: none;
        border-radius: 20px;
        padding: 10px 18px;
        font-weight: bold;
        cursor: pointer;
    }

    .overlay {
        display: none;
        position: fixed;
        inset: 0;
        background: rgba(0,0,0,0.7);
        justify-content: center;
        align-items: center;
        z-index: 1000;
        padding: 15px;
    }

    .overlay.abierto {
        display: flex;
    }

    .modal {
        background: white;
        padding: 25px;
        border-radius: 12px;
        width: 100%;
        max-width: 450px;
        max-height: 85vh;
        overflow-y: auto;
    }

    .modal button {
        cursor: pointer;
        padding: 8px 12px;
        margin: 4px;
        border-radius: 6px;
    }

    .item-carrito {
        border-bottom: 1px solid #ccc;
        padding: 12px;
    }

    .aviso {
        display: none;
        position: fixed;
        bottom: 20px;
        left: 50%;
        transform: translateX(-50%);
        background: #1e3a40;
        color: white;
        padding: 12px 20px;
        border-radius: 8px;
        z-index: 1100;
    }

    .aviso.visible {
        display: block;
    }
`;

document.head.appendChild(estilos);

/* =================================
   INICIAR
================================= */

cargarCarrito();
renderCarrito();
