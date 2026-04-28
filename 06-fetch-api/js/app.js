'use strict';

/* =========================
   1. SELECCIÓN DE ELEMENTOS
========================= */
const formPost = document.querySelector('#form-post');
const inputPostId = document.querySelector('#post-id');
const inputTitulo = document.querySelector('#titulo');
const inputContenido = document.querySelector('#contenido');
const btnSubmit = document.querySelector('#btn-submit');
const btnCancelar = document.querySelector('#btn-cancelar');
const inputBuscar = document.querySelector('#input-buscar');
const btnBuscar = document.querySelector('#btn-buscar');
const btnLimpiar = document.querySelector('#btn-limpiar');
const listaPosts = document.querySelector('#lista-posts');
const mensajeEstado = document.querySelector('#mensaje-estado');
const contador = document.querySelector('#contador strong');

/* =========================
   2. ESTADO GLOBAL (arreglos locales)
========================= */
let posts = [];
let postsFiltrados = [];
let modoEdicion = false;

/* =========================
   3. FUNCIONES PRINCIPALES
========================= */
async function cargarPosts() {
  try {
    mostrarCargando(listaPosts);
    const datos = await ApiService.getPosts(20);
    posts = datos;
    postsFiltrados = [...posts];
    renderizarPosts(postsFiltrados, listaPosts);
    actualizarContador();
  } catch (error) {
    vaciarContenedor(listaPosts);
    listaPosts.appendChild(MensajeError(`No se pudieron cargar los posts: ${error.message}`));
  }
}

function actualizarContador() {
  contador.textContent = postsFiltrados.length;
}

function limpiarFormulario() {
  formPost.reset();
  inputPostId.value = '';
  modoEdicion = false;
  btnSubmit.textContent = 'Crear Post';
  btnCancelar.style.display = 'none';
}

function activarModoEdicion(post) {
  modoEdicion = true;
  inputPostId.value = post.id;
  inputTitulo.value = post.title;
  inputContenido.value = post.body;
  btnSubmit.textContent = 'Actualizar Post';
  btnCancelar.style.display = 'inline-block';
  formPost.scrollIntoView({ behavior: 'smooth', block: 'start' });
  inputTitulo.focus();
}

/* =========================
   4. CRUD
========================= */
async function guardarPost(datosPost) {
  try {
    btnSubmit.disabled = true;
    btnSubmit.textContent = modoEdicion ? 'Actualizando...' : 'Creando...';
    let resultado;

    if (modoEdicion) {
      const id = parseInt(inputPostId.value);
      resultado = await ApiService.updatePost(id, datosPost);
      // Actualizar el arreglo local
      const index = posts.findIndex(p => p.id === id);
      if (index !== -1) {
        posts[index] = { ...resultado, id };
      }
      mostrarMensajeTemporal(mensajeEstado, MensajeExito(`Post #${id} actualizado correctamente`), 3000);
    } else {
      resultado = await ApiService.createPost(datosPost);
      // JSONPlaceholder devuelve id: 101 siempre, lo aseguramos único localmente
      const nuevoPost = { ...resultado, id: resultado.id || Date.now() };
      posts.unshift(nuevoPost);
      mostrarMensajeTemporal(mensajeEstado, MensajeExito(`Post #${nuevoPost.id} creado correctamente`), 3000);
    }

    postsFiltrados = [...posts];
    renderizarPosts(postsFiltrados, listaPosts);
    actualizarContador();
    limpiarFormulario();
  } catch (error) {
    mostrarMensajeTemporal(mensajeEstado, MensajeError(`Error: ${error.message}`), 5000);
  } finally {
    btnSubmit.disabled = false;
    btnSubmit.textContent = modoEdicion ? 'Actualizar Post' : 'Crear Post';
  }
}

async function eliminarPost(id) {
  if (!confirm(`¿Eliminar el post #${id}?`)) return;
  try {
    await ApiService.deletePost(id);
    // Filtrar arreglos locales
    posts = posts.filter(p => p.id !== id);
    postsFiltrados = postsFiltrados.filter(p => p.id !== id);
    renderizarPosts(postsFiltrados, listaPosts);
    actualizarContador();
    mostrarMensajeTemporal(mensajeEstado, MensajeExito(`Post #${id} eliminado`), 3000);
  } catch (error) {
    mostrarMensajeTemporal(mensajeEstado, MensajeError(`Error: ${error.message}`), 5000);
  }
}

/* =========================
   5. BÚSQUEDA LOCAL
========================= */
function buscarPosts(termino) {
  const terminoLower = termino.toLowerCase().trim();
  if (terminoLower === '') {
    postsFiltrados = [...posts];
  } else {
    postsFiltrados = posts.filter(post => {
      return post.title.toLowerCase().includes(terminoLower) ||
             post.body.toLowerCase().includes(terminoLower);
    });
  }
  renderizarPosts(postsFiltrados, listaPosts);
  actualizarContador();
}

function limpiarBusqueda() {
  inputBuscar.value = '';
  postsFiltrados = [...posts];
  renderizarPosts(postsFiltrados, listaPosts);
  actualizarContador();
}

/* =========================
   6. EVENT LISTENERS
========================= */
formPost.addEventListener('submit', (e) => {
  e.preventDefault();
  const datosPost = {
    title: inputTitulo.value.trim(),
    body: inputContenido.value.trim(),
    userId: 1
  };
  if (!datosPost.title || !datosPost.body) {
    mostrarMensajeTemporal(mensajeEstado, MensajeError('Título y contenido son obligatorios'), 3000);
    return;
  }
  guardarPost(datosPost);
});

btnCancelar.addEventListener('click', limpiarFormulario);
btnBuscar.addEventListener('click', () => buscarPosts(inputBuscar.value));
inputBuscar.addEventListener('keydown', (e) => {
  if (e.key === 'Enter') buscarPosts(inputBuscar.value);
});
btnLimpiar.addEventListener('click', limpiarBusqueda);

// Delegación de eventos
listaPosts.addEventListener('click', (e) => {
  const action = e.target.dataset.action;
  if (!action) return;
  const id = parseInt(e.target.dataset.id);
  const post = posts.find(p => p.id === id);

  if (action === 'editar' && post) activarModoEdicion(post);
  if (action === 'eliminar') eliminarPost(id);
});

/* =========================
   7. INICIALIZACIÓN
========================= */
cargarPosts();