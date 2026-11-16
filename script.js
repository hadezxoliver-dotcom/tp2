
/* PRODUCTOS DE LA TIENDA */

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

/* CARRITO */

let carrito = {};

const CLAVE_STORAGE = "carritoAnimales";
 
function cargarCarrito() {
    try {
        carrito = JSON.parse(localStorage.getItem(CLAVE_STORAGE)) || {};
    } catch (e) {
        carrito = {};
    }

    Object.keys(carrito).forEach(function(id) {
        if (!ANIMALES[id] || carrito[id] <= 0) {
            delete carrito[id];
        }
    });
}

function guardarCarrito() {
    localStorage.setItem(CLAVE_STORAGE, JSON.stringify(carrito));
}

function formatoPrecio(precio) {
    return "$" + precio.toLocaleString("es-AR");
}

function totalProductos() {
    return Object.values(carrito).reduce(function(total, cantidad) {
        return total + cantidad;
    }, 0);
}

function totalPrecio() {
    return Object.keys(carrito).reduce(function(total, id) {
        return total + carrito[id] * ANIMALES[id].precio;
    }, 0);
}

/* AGREGAR PRODUCTOS */

function agregarAlCarrito(id) {
    if (!ANIMALES[id]) return;

    carrito[id] = (carrito[id] || 0) + 1;

    guardarCarrito();
    renderCarrito();

    mostrarAviso("¡Mascota agregada al carrito!");
}

/* CAMBIAR CANTIDAD */

function cambiarCantidad(id, cantidad) {
    if (!carrito[id]) return;

    carrito[id] += cantidad;

    if (carrito[id] <= 0) {
        delete carrito[id];
    }

    guardarCarrito();
    renderCarrito();
}

/* ELIMINAR PRODUCTO */

function quitarDelCarrito(id) {
    delete carrito[id];

    guardarCarrito();
    renderCarrito();
}

/* VACIAR CARRITO */

function vaciarCarrito() {
    carrito = {};

    guardarCarrito();
    renderCarrito();
}

/* MOSTRAR CARRITO */

function renderCarrito() {
    document.getElementById("contador").textContent = totalProductos();

    const contenedor = document.getElementById("carritoItems");
    const pie = document.getElementById("carritoPie");

    const ids = Object.keys(carrito);

    if (ids.length === 0) {
        contenedor.innerHTML = "<p>Tu carrito está vacío.</p>";
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

                <p>Subtotal: ${formatoPrecio(animal.precio * cantidad)}</p>

                <button data-cant="-1" data-id="${id}">-</button>

                <span>${cantidad}</span>

                <button data-cant="1" data-id="${id}">+</button>

                <button data-quitar="${id}">Eliminar</button>
            </div>
        `;
    }).join("");

    document.getElementById("carritoTotal").textContent =
        formatoPrecio(totalPrecio());
}

/* MOSTRAR INFORMACIÓN */

let idInfoActual = null;

function mostrarInfo(id) {
    const animal = ANIMALES[id];

    if (!animal) return;

    idInfoActual = id;

    document.getElementById("infoTitulo").textContent = animal.nombre;

    document.getElementById("infoDatos").innerHTML =
        "<p>Tipo: " + animal.tipo + "</p>" +
        "<p>Precio: " + formatoPrecio(animal.precio) + "</p>";

    document.getElementById("infoDescripcion").textContent =
        "Conocé más sobre " + animal.nombre + ".";

    abrir("overlayInfo");
}

/* ABRIR Y CERRAR VENTANAS */

function abrir(id) {
    document.getElementById(id).classList.add("abierto");
}

function cerrar(id) {
    document.getElementById(id).classList.remove("abierto");
}

/* AVISOS */

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

/* BOTONES DE LA PÁGINA */

document.addEventListener("click", function(e) {
    const t = e.target;

    if (t.dataset.accion === "comprar") {
        agregarAlCarrito(t.dataset.id);
        return;
    }

    if (t.dataset.accion === "info") {
        mostrarInfo(t.dataset.id);
        return;
    }

    if (t.dataset.cant) {
        cambiarCantidad(
            t.dataset.id,
            parseInt(t.dataset.cant)
        );
        return;
    }

    if (t.dataset.quitar) {
        quitarDelCarrito(t.dataset.quitar);
        return;
    }

    if (t.dataset.cerrar) {
        cerrar(t.dataset.cerrar);
        return;
    }

    if (t.classList.contains("overlay")) {
        t.classList.remove("abierto");
    }
});

/* BOTÓN DEL CARRITO */

document.getElementById("btnCarrito").addEventListener("click", function() {
    renderCarrito();
    abrir("overlayCarrito");
});

/* BOTÓN COMPRAR DESDE INFORMACIÓN */

document.getElementById("infoComprar").addEventListener("click", function() {
    if (idInfoActual) {
        agregarAlCarrito(idInfoActual);
        cerrar("overlayInfo");
    }
});

/* VACIAR CARRITO */

document.getElementById("btnVaciar").addEventListener("click", function() {
    vaciarCarrito();
    mostrarAviso("Carrito vaciado");
});

/* ENVÍO DEL PEDIDO */

document.getElementById("btnEnviar").addEventListener("click", function() {
    if (totalProductos() === 0) {
        mostrarAviso("El carrito está vacío");
        return;
    }

    const nombre = document.getElementById("nombreCliente").value.trim();

    if (nombre === "") {
        document.getElementById("errorNombre").textContent =
            "Ingresá tu nombre para continuar.";
        return;
    }

    document.getElementById("errorNombre").textContent = "";

    let mensaje = "Hola! Quiero consultar por estos productos:\n\n";

    Object.keys(carrito).forEach(function(id) {
        const animal = ANIMALES[id];

        mensaje += carrito[id] + " x " + animal.nombre +
            " - " + formatoPrecio(carrito[id] * animal.precio) + "\n";
    });

    mensaje += "\nTotal: " + formatoPrecio(totalPrecio());
    mensaje += "\nNombre: " + nombre;

    const numero = "5493564581110";

    window.open(
        "https://wa.me/" + numero + "?text=" + encodeURIComponent(mensaje),
        "_blank"
    );
});

/* INICIO */

document.getElementById("nombreCliente").addEventListener("input", function() {
    document.getElementById("errorNombre").textContent = "";
});

document.addEventListener("keydown", function(e) {
    if (e.key === "Escape") {
        cerrar("overlayInfo");
        cerrar("overlayCarrito");
    }
});

cargarCarrito();
renderCarrito();
