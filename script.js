/* ==========================================
           CONFIGURACIÓN (editá acá los datos)
           ========================================== */
        // Número de WhatsApp que recibe los pedidos (formato internacional, sin + ni espacios)
        // 54 = Argentina, 9 = celular, 3564 = característica, 581110 = número
        const WHATSAPP_NUMERO = "5493564581110";

        // Datos de cada artista. IMPORTANTE: revisá los precios, fechas y lugares.
        const ARTISTAS = {
            renga: {
                nombre: "La Renga",
                genero: "Rock",
                tema: "La balada del diablo y la muerte",
                precio: 15000,
                fecha: "A confirmar",
                lugar: "A confirmar",
                descripcion: "Banda de rock argentina. Su tema más conocido es \"La balada del diablo y la muerte\"."
            },
            michael: {
                nombre: "Michael Jackson",
                genero: "Pop",
                tema: "Bad",
                precio: 25000,
                fecha: "A confirmar",
                lugar: "A confirmar",
                descripcion: "Conocido como el Rey del Pop. \"Bad\" es una de sus canciones más famosas."
            },
            karina: {
                nombre: "Karina",
                genero: "Cumbia",
                tema: "Diganle",
                precio: 12000,
                fecha: "A confirmar",
                lugar: "A confirmar",
                descripcion: "Cantante de cumbia. \"Diganle\" es uno de sus temas más conocidos, del álbum \"Con la misma moneda\"."
            },
            sosa: {
                nombre: "Sosa 66s",
                genero: "Rap",
                tema: "Mi peor vicio",
                precio: 10000,
                fecha: "A confirmar",
                lugar: "A confirmar",
                descripcion: "Artista de rap. \"Mi peor vicio\" es uno de sus temas más escuchados."
            }
        };

        /* ==========================================
           ESTADO DEL CARRITO
           ========================================== */
        const CLAVE_STORAGE = "carritoEntradas";
        let carrito = {}; // { idArtista: cantidad }

        function cargarCarrito() {
            try {
                const guardado = JSON.parse(localStorage.getItem(CLAVE_STORAGE));
                if (guardado && typeof guardado === "object") {
                    Object.keys(guardado).forEach(function (id) {
                        const cant = parseInt(guardado[id], 10);
                        if (ARTISTAS[id] && cant > 0) carrito[id] = cant;
                    });
                }
            } catch (e) { /* sin storage disponible: se usa solo en memoria */ }
        }

        function guardarCarrito() {
            try { localStorage.setItem(CLAVE_STORAGE, JSON.stringify(carrito)); } catch (e) {}
        }

        /* ==========================================
           UTILIDADES
           ========================================== */
        const $ = function (id) { return document.getElementById(id); };

        function formatoPrecio(n) {
            return "$" + n.toLocaleString("es-AR");
        }

        function escapeHtml(texto) {
            return String(texto)
                .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
                .replace(/"/g, "&quot;").replace(/'/g, "&#39;");
        }

        let temporizadorAviso;
        function mostrarAviso(texto) {
            const el = $("aviso");
            el.textContent = texto;
            el.classList.add("visible");
            clearTimeout(temporizadorAviso);
            temporizadorAviso = setTimeout(function () { el.classList.remove("visible"); }, 2200);
        }

        function abrir(idOverlay) { $(idOverlay).classList.add("abierto"); }
        function cerrar(idOverlay) { $(idOverlay).classList.remove("abierto"); }

        /* ==========================================
           CARRITO
           ========================================== */
        function totalEntradas() {
            return Object.keys(carrito).reduce(function (acc, id) { return acc + carrito[id]; }, 0);
        }

        function totalPrecio() {
            return Object.keys(carrito).reduce(function (acc, id) {
                return acc + carrito[id] * ARTISTAS[id].precio;
            }, 0);
        }

        function agregarAlCarrito(id) {
            carrito[id] = (carrito[id] || 0) + 1;
            guardarCarrito();
            renderCarrito();
            mostrarAviso("✔ Entrada de " + ARTISTAS[id].nombre + " agregada al carrito");
            const btn = $("btnCarrito");
            btn.classList.remove("bump");
            void btn.offsetWidth; // reinicia la animación
            btn.classList.add("bump");
        }

        function cambiarCantidad(id, delta) {
            if (!carrito[id]) return;
            carrito[id] += delta;
            if (carrito[id] <= 0) delete carrito[id];
            guardarCarrito();
            renderCarrito();
        }

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

        function renderCarrito() {
            $("contador").textContent = totalEntradas();

            const ids = Object.keys(carrito);
            const contenedor = $("carritoItems");

            if (ids.length === 0) {
                contenedor.innerHTML = '<div class="carrito-vacio">Tu carrito está vacío.<br>Agregá entradas con el botón "Comprar entrada".</div>';
                $("carritoPie").style.display = "none";
                return;
            }

            $("carritoPie").style.display = "block";
            contenedor.innerHTML = ids.map(function (id) {
                const a = ARTISTAS[id];
                const cant = carrito[id];
                return '<div class="item-carrito">' +
                    '<span class="nombre">' + escapeHtml(a.nombre) + '</span>' +
                    '<span class="subtotal">' + formatoPrecio(cant * a.precio) + '</span>' +
                    '<span class="detalle">' + formatoPrecio(a.precio) + ' c/u</span>' +
                    '<span class="controles">' +
                        '<button type="button" data-cant="-1" data-id="' + id + '" aria-label="Quitar una">−</button>' +
                        '<span class="cantidad">' + cant + '</span>' +
                        '<button type="button" data-cant="1" data-id="' + id + '" aria-label="Agregar una">+</button>' +
                        '<button type="button" class="quitar" data-quitar="' + id + '" aria-label="Eliminar">✕</button>' +
                    '</span>' +
                '</div>';
            }).join("");

            $("carritoTotal").textContent = formatoPrecio(totalPrecio());
        }

        /* ==========================================
           MODAL "VER INFO"
           ========================================== */
        let idInfoActual = null;

        function mostrarInfo(id) {
            const a = ARTISTAS[id];
            if (!a) return;
            idInfoActual = id;
            $("infoTitulo").textContent = a.nombre;
            $("infoDatos").innerHTML =
                '<div class="dato"><span>Género</span><span>' + escapeHtml(a.genero) + '</span></div>' +
                '<div class="dato"><span>Tema más conocido</span><span>' + escapeHtml(a.tema) + '</span></div>' +
                '<div class="dato"><span>Fecha</span><span>' + escapeHtml(a.fecha) + '</span></div>' +
                '<div class="dato"><span>Lugar</span><span>' + escapeHtml(a.lugar) + '</span></div>' +
                '<div class="dato"><span>Precio por entrada</span><span>' + formatoPrecio(a.precio) + '</span></div>';
            $("infoDescripcion").textContent = a.descripcion;
            abrir("overlayInfo");
        }

        /* ==========================================
           ENVÍO POR WHATSAPP
           ========================================== */
        function armarMensaje(nombre) {
            const lineas = ["Hola! Quiero comprar las siguientes entradas:", ""];
            Object.keys(carrito).forEach(function (id) {
                const a = ARTISTAS[id];
                const cant = carrito[id];
                lineas.push("• " + cant + " x " + a.nombre + " (" + a.genero + ") - " + formatoPrecio(cant * a.precio));
            });
            lineas.push("");
            lineas.push("Total: " + formatoPrecio(totalPrecio()));
            lineas.push("Nombre: " + nombre);
            return lineas.join("\n");
        }

        function enviarPorWhatsApp() {
            if (totalEntradas() === 0) {
                mostrarAviso("El carrito está vacío");
                return;
            }

            const nombre = $("nombreCliente").value.trim();
            if (!nombre) {
                $("errorNombre").textContent = "Ingresá tu nombre para continuar.";
                $("nombreCliente").focus();
                return;
            }
            $("errorNombre").textContent = "";

            const url = "https://wa.me/" + WHATSAPP_NUMERO + "?text=" + encodeURIComponent(armarMensaje(nombre));
            const ventana = window.open(url, "_blank");
            if (!ventana) {
                // Si el navegador bloquea la ventana emergente, se abre en la misma pestaña
                window.location.href = url;
            }
        }

        /* ==========================================
           EVENTOS
           ========================================== */
        document.addEventListener("click", function (e) {
            const t = e.target;

            // Botones de las tarjetas
            if (t.dataset && t.dataset.accion === "comprar") {
                agregarAlCarrito(t.dataset.id);
                return;
            }
            if (t.dataset && t.dataset.accion === "info") {
                mostrarInfo(t.dataset.id);
                return;
            }

            // Cantidades y quitar dentro del carrito
            if (t.dataset && t.dataset.cant) {
                cambiarCantidad(t.dataset.id, parseInt(t.dataset.cant, 10));
                return;
            }
            if (t.dataset && t.dataset.quitar) {
                quitarDelCarrito(t.dataset.quitar);
                return;
            }

            // Cerrar con la X
            if (t.dataset && t.dataset.cerrar) {
                cerrar(t.dataset.cerrar);
                return;
            }

            // Cerrar al hacer click fuera del modal
            if (t.classList && t.classList.contains("overlay")) {
                t.classList.remove("abierto");
            }
        });

        $("btnCarrito").addEventListener("click", function () {
            renderCarrito();
            abrir("overlayCarrito");
        });

        $("infoComprar").addEventListener("click", function () {
            if (idInfoActual) agregarAlCarrito(idInfoActual);
            cerrar("overlayInfo");
        });

        $("btnEnviar").addEventListener("click", enviarPorWhatsApp);

        $("btnVaciar").addEventListener("click", function () {
            vaciarCarrito();
            mostrarAviso("Carrito vaciado");
        });

        $("nombreCliente").addEventListener("input", function () {
            $("errorNombre").textContent = "";
        });

        // Cerrar con la tecla Escape
        document.addEventListener("keydown", function (e) {
            if (e.key === "Escape") {
                cerrar("overlayInfo");
                cerrar("overlayCarrito");
            }
        });

        // Inicio
        cargarCarrito();
        renderCarrito();