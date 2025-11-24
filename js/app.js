let carrito = [];

// Selectores del DOM
const listaProductos = document.querySelector('.lista-productos');
const itemsCarrito = document.querySelector('.items-carrito');
const totalCarrito = document.querySelector('.total');
const mensajeVacio = document.querySelector('.carrito-vacio');
const botonFinalizar = document.querySelector('.boton-finalizar');
const botonVaciar = document.querySelector('.vaciar-carrito'); // Botón nuevo

// =======================================================
// 1. EVENT LISTENERS Y CARGA INICIAL
// =======================================================

// Carga el carrito guardado al iniciar la página
document.addEventListener('DOMContentLoaded', cargarCarritoLocalStorage);

if (listaProductos) {
    listaProductos.addEventListener('click', agregarProducto);
}

// CRÍTICO: Event Listener para TODOS los clics en items (+ / - / X)
itemsCarrito.addEventListener('click', manejarClicksCarrito);

// Event Listener para FINALIZAR COMPRA
if (botonFinalizar) {
    botonFinalizar.addEventListener('click', finalizarCompra);
}

// Event Listener para VACIAR CARRITO
if (botonVaciar) {
    botonVaciar.addEventListener('click', () => {
        carrito = [];
        actualizarCarrito();
    });
}


// =======================================================
// 2. FUNCIONES PRINCIPALES
// =======================================================

function agregarProducto(e) {
    if (e.target.classList.contains('agregar-carrito')) {
    const productoCard = e.target.closest('.producto-card');

        const infoProducto = {
            id: e.target.getAttribute('data-id'),
            nombre: productoCard.querySelector('h3').textContent,
            precio: parseFloat(productoCard.querySelector('.precio').textContent.replace('$', '')),
            cantidad: 1
        };

        // Revisa si el producto ya existe en el carrito
        const existe = carrito.some(producto => producto.id === infoProducto.id);

        if (existe) {
            // Si existe, incrementa la cantidad
            carrito = carrito.map(producto => {
                if (producto.id === infoProducto.id){
                    producto.cantidad++;
                }
                return producto;
            });
        } else {
            // Si no existe, añade el producto
            carrito.push(infoProducto);
        }

        actualizarCarrito(); 
    }
}

function actualizarCarrito() {
    itemsCarrito.innerHTML = '';

    let total = 0;

    // Mostrar/Ocultar mensaje vacío
    if (carrito.length === 0) {
        mensajeVacio.style.display = 'block';
    } else {
        mensajeVacio.style.display = 'none';
    }

    carrito.forEach(producto => {
    const {nombre, precio, cantidad, id} = producto;
        const subtotal = precio * cantidad;
        total += subtotal;

        const li = document.createElement('li');
        li.classList.add('item-detalle');

        // ¡ERROR CORREGIDO AQUÍ! (Usando ` al inicio y al final)
        li.innerHTML = ` 
            <p>${nombre}</p>
            <p>
                Cant:
                <button class="menos" data-id="${id}" type="button">−</button>
                <span class="cantidad">${cantidad}</span>
                <button class="mas" data-id="${id}" type="button">+</button>
            </p>
            <p>Subtotal: <span>$${subtotal.toFixed(2)}</span></p>
            <button class="eliminar-producto" data-id="${id}" aria-label="Eliminar ${nombre}">X</button>
        `; 
        itemsCarrito.appendChild(li);

    });

    // ¡ERROR CORREGIDO AQUÍ! (La asignación de texto también debe ser un string)
    totalCarrito.textContent = `$${total.toFixed(2)}`; 

    // MEJORA UX: Desactiva el botón de Finalizar si el carrito está vacío
    if (botonFinalizar) {
        botonFinalizar.disabled = carrito.length === 0;
        botonFinalizar.style.opacity = carrito.length === 0 ? '0.6' : '1';
    }

    // CRÍTICO: GUARDAR EL CARRITO EN LOCALSTORAGE
    localStorage.setItem('carritoTienda', JSON.stringify(carrito));
}

// FUNCIÓN REFACTORIZADA: Maneja los clics en + / - / X
function manejarClicksCarrito(e) {
    // Aseguramos que el clic fue en un botón interactivo
    if (!e.target.classList.contains('mas') && 
        !e.target.classList.contains('menos') && 
        !e.target.classList.contains('eliminar-producto')) {
        return;
    }
    
    const id = e.target.dataset.id; 

    // 1. MANEJO DEL BOTÓN SUMAR (+)
    if (e.target.classList.contains('mas')) {
        carrito = carrito.map(producto => 
            producto.id === id ? {...producto, cantidad: producto.cantidad + 1} : producto
        );
    } 
    
    // 2. MANEJO DEL BOTÓN RESTAR (-)
    else if (e.target.classList.contains('menos')) {
        carrito = carrito.map(producto => 
            // Decrementa, asegurando que la cantidad mínima sea 0
            producto.id === id ? {...producto, cantidad: Math.max(0, producto.cantidad - 1)} : producto
        )
        // Elimina el producto si su cantidad llega a 0
        .filter(producto => producto.cantidad > 0); 
    } 
    
    // 3. MANEJO DEL BOTÓN ELIMINAR COMPLETO (X)
    else if (e.target.classList.contains('eliminar-producto')) {
        // Elimina el producto COMPLETAMENTE del array, sin importar la cantidad
        carrito = carrito.filter(producto => producto.id !== id);
    }

    actualizarCarrito();
}

// Función para cargar datos al inicio
function cargarCarritoLocalStorage() {
    const carritoGuardado = localStorage.getItem('carritoTienda'); 
    
    if (carritoGuardado) {
        carrito = JSON.parse(carritoGuardado);
    }
    
    actualizarCarrito();
}

function finalizarCompra() {
    if (carrito.length === 0) {
        alert("Tu carrito está vacío. ¡Agrega productos antes de finalizar!");
        return;
    }
    
    carrito = [];
    
    actualizarCarrito(); 
    
    alert("🎉 ¡Compra finalizada con éxito! Gracias por tu pedido.");
}

// =======================================================
// 3. VALIDACIÓN DE FORMULARIO DE CONTACTO
// =======================================================

// 1. Obtener los elementos del DOM
const form = document.querySelector('.formulario-contacto');
const nombreInput = document.getElementById('nombre');
const emailInput = document.getElementById('email');
const mensajeTextarea = document.getElementById('mensaje');
const botonEnviar = document.querySelector('.boton-enviar');

if (form) {
    form.addEventListener('submit', validarFormulario);
}

function validarFormulario(e) {
    // CRÍTICO: Evita que el formulario se envíe automáticamente
    e.preventDefault(); 

    let esValido = true;
    
    // Función de ayuda para mostrar errores
    function mostrarError(elemento, mensaje) {
        const grupo = elemento.closest('.campo'); // Busca el div padre con la clase 'campo'
        let errorDiv = grupo.querySelector('.error-mensaje');

        // Si no existe, lo crea
        if (!errorDiv) {
            errorDiv = document.createElement('p');
            errorDiv.classList.add('error-mensaje');
            errorDiv.style.color = 'red';
            grupo.appendChild(errorDiv);
        }
        errorDiv.textContent = mensaje;
        elemento.style.border = '1px solid red';
    }

    // Función de ayuda para limpiar errores
    function limpiarError(elemento) {
        const grupo = elemento.closest('.campo');
        const errorDiv = grupo.querySelector('.error-mensaje');
        if (errorDiv) {
            errorDiv.remove();
        }
        elemento.style.border = '1px solid #ccc';
    }

    // Validación del Campo Nombre
    if (nombreInput.value.trim() === '') {
        mostrarError(nombreInput, 'El nombre es obligatorio.');
        esValido = false;
    } else {
        limpiarError(nombreInput);
    }

    // Validación del Campo Email (vacío y formato básico)
    if (emailInput.value.trim() === '') {
        mostrarError(emailInput, 'El correo electrónico es obligatorio.');
        esValido = false;
    } else if (!emailInput.value.includes('@') || !emailInput.value.includes('.')) {
        mostrarError(emailInput, 'Formato de correo inválido.');
        esValido = false;
    } else {
        limpiarError(emailInput);
    }

    // Validación del Campo Mensaje
    if (mensajeTextarea.value.trim() === '') {
        mostrarError(mensajeTextarea, 'El mensaje no puede ir vacío.');
        esValido = false;
    } else {
        limpiarError(mensajeTextarea);
    }


    // Si todo es válido, simula el envío y limpia el formulario
    if (esValido) {
        alert('✅ Mensaje enviado con éxito. ¡Gracias!');
        form.reset(); // Limpia todos los campos
        
        // Simular que el formulario se puede enviar al servidor real
        // Aquí iría el código para enviar los datos (usando fetch o AJAX)
    }
}