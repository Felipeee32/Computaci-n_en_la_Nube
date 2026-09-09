const firebaseConfig = {
  apiKey: "AIzaSyCyt6_JybYNI27xmNWZuaaYfEoY6SOZV6c",
  authDomain: "cloudstock-fab2a.firebaseapp.com",
  projectId: "cloudstock-fab2a",
  storageBucket: "cloudstock-fab2a.firebasestorage.app",
  messagingSenderId: "410826632306",
  appId: "1:410826632306:web:bbc0f94b166b433396a6eb",
  measurementId: "G-NP2WBKHSLQ"
};


firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();
const coleccion = db.collection("productos");

const form = document.getElementById("form-producto");
const inputNombre = document.getElementById("input-nombre");
const inputStock = document.getElementById("input-stock");
const mensajeError = document.getElementById("mensaje-error");
const cuerpoTabla = document.getElementById("cuerpo-tabla");
const estadoCarga = document.getElementById("estado-carga");
const inputFiltro = document.getElementById("input-filtro");
const checkBajoStock = document.getElementById("check-bajo-stock");

let productos = []; // caché local de lo último recibido desde Firestore

function mostrarError(texto) {
    mensajeError.textContent = texto;
    setTimeout(() => (mensajeError.textContent = ""), 4000);
}

function validarProducto(nombre, stock) {
    if (!nombre || nombre.trim().length === 0) {
        return "El nombre no puede estar vacío.";
    }
    if (Number.isNaN(stock) || stock < 0 || !Number.isInteger(stock)) {
        return "El stock debe ser un número entero mayor o igual a 0.";
    }
    return null;
}

// Crear o actualizar producto
form.addEventListener("submit", async (evento) => {
    evento.preventDefault();

    const nombre = inputNombre.value.trim();
    const stock = parseInt(inputStock.value, 10);
    const idEdicion = form.dataset.editandoId;

    const error = validarProducto(nombre, stock);
    if (error) {
        mostrarError(error);
        return;
    }

    try {
        if (idEdicion) {
            await coleccion.doc(idEdicion).update({ nombre, stock });
            delete form.dataset.editandoId;
            form.querySelector("button").textContent = "Guardar";
        } else {
            await coleccion.add({ nombre, stock });
        }
        form.reset();
    } catch (err) {
        console.error(err);
        mostrarError("No se pudo guardar el producto. Revisa tu conexión e inténtalo de nuevo.");
    }
});

// Escuchar cambios en tiempo real: así se ve el cambio desde otro dispositivo
coleccion.onSnapshot(
    (snapshot) => {
        estadoCarga.style.display = "none";
        productos = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
        renderizarTabla();
    },
    (err) => {
        console.error(err);
        estadoCarga.textContent = "No se pudieron cargar los productos. Revisa tu conexión.";
        estadoCarga.style.display = "block";
    }
);

function renderizarTabla() {
    const filtro = inputFiltro.value.trim().toLowerCase();
    const soloBajoStock = checkBajoStock.checked;

    const filtrados = productos.filter((p) => {
        const coincideNombre = p.nombre.toLowerCase().includes(filtro);
        const cumpleStock = soloBajoStock ? p.stock < 5 : true;
        return coincideNombre && cumpleStock;
    });

    cuerpoTabla.innerHTML = "";

    if (filtrados.length === 0) {
        cuerpoTabla.innerHTML = `<tr><td colspan="3">No hay productos que mostrar.</td></tr>`;
        return;
    }

    filtrados.forEach((producto) => {
        const fila = document.createElement("tr");
        fila.innerHTML = `
            <td>${producto.nombre}</td>
            <td>${producto.stock}</td>
            <td>
                <button class="btn-editar" data-id="${producto.id}">Editar</button>
                <button class="btn-eliminar" data-id="${producto.id}">Eliminar</button>
            </td>
        `;
        cuerpoTabla.appendChild(fila);
    });
}

// Editar / eliminar (delegación de eventos)
cuerpoTabla.addEventListener("click", async (evento) => {
    const id = evento.target.dataset.id;
    if (!id) return;

    if (evento.target.classList.contains("btn-eliminar")) {
        const confirmar = confirm("¿Eliminar este producto?");
        if (!confirmar) return;
        try {
            await coleccion.doc(id).delete();
        } catch (err) {
            console.error(err);
            mostrarError("No se pudo eliminar. Revisa tu conexión.");
        }
    }

    if (evento.target.classList.contains("btn-editar")) {
        const producto = productos.find((p) => p.id === id);
        if (!producto) return;
        inputNombre.value = producto.nombre;
        inputStock.value = producto.stock;
        form.dataset.editandoId = id;
        form.querySelector("button").textContent = "Actualizar";
    }
});

inputFiltro.addEventListener("input", renderizarTabla);
checkBajoStock.addEventListener("change", renderizarTabla);
