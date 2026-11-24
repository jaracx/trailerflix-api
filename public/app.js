const catalogGrid = document.getElementById('catalog-grid');
const notice = document.getElementById('notice');
const resultCount = document.getElementById('result-count');
const catalogTitle = document.getElementById('catalog-title');
const searchForm = document.getElementById('search-form');
const titleSearch = document.getElementById('title-search');
const actorSearchForm = document.getElementById('actor-search-form');
const actorSearch = document.getElementById('actor-search');
const filterButtons = document.querySelectorAll('.filter-button');
const previousPageButton = document.getElementById('previous-page');
const nextPageButton = document.getElementById('next-page');
const pageIndicator = document.getElementById('page-indicator');
const catalogView = document.getElementById('catalog-view');
const architectureView = document.getElementById('architecture-view');
const catalogTab = document.getElementById('catalog-tab');
const architectureTab = document.getElementById('architecture-tab');
const crudTab = document.getElementById('crud-tab');
const crudView = document.getElementById('crud-view');
const crudNotice = document.getElementById('crud-notice');
const crudResult = document.getElementById('crud-result');
const crudResultBody = document.getElementById('crud-result-body');

const ITEMS_PER_PAGE = 8;
let currentItems = [];
let currentPage = 1;

const placeholderPoster = 'https://placehold.co/600x900/111827/FFFFFF?text=Trailerflix';

function escapeHtml(value) {
  const element = document.createElement('div');
  element.textContent = value ?? '';
  return element.innerHTML;
}

function showNotice(message) {
  notice.textContent = message;
  notice.classList.remove('hidden');
}

function hideNotice() {
  notice.textContent = '';
  notice.classList.add('hidden');
}

async function fetchCatalog(url) {
  hideNotice();
  catalogGrid.innerHTML = '<p class="notice">Cargando catálogo...</p>';

  try {
    const response = await fetch(url);

    if (response.status === 404) {
      let errorMessage = 'No se encontró contenido para esa búsqueda.';

      try {
        const errorPayload = await response.json();
        if (errorPayload.error) errorMessage = errorPayload.error;
      } catch (error) {
        console.error('No se pudo leer el error de la API:', error);
      }

      currentItems = [];
      currentPage = 1;
      catalogGrid.innerHTML = '';
      showNotice(errorMessage);
      updatePagination();
      resultCount.textContent = '0 resultados';
      return;
    }

    if (!response.ok) {
      throw new Error(`La API respondió con estado ${response.status}`);
    }

    const items = await response.json();
    currentItems = Array.isArray(items) ? items : [];
    currentPage = 1;
    resultCount.textContent = `${currentItems.length} resultado${currentItems.length === 1 ? '' : 's'}`;
    renderCurrentPage();
  } catch (error) {
    console.error(error);
    currentItems = [];
    currentPage = 1;
    catalogGrid.innerHTML = '';
    showNotice('No pudimos conectar con la API. Revisá que el servidor esté activo en el puerto 3000.');
    updatePagination();
    resultCount.textContent = '0 resultados';
  }
}

function renderCurrentPage() {
  hideNotice();
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const visibleItems = currentItems.slice(startIndex, startIndex + ITEMS_PER_PAGE);

  catalogGrid.innerHTML = visibleItems.map((item) => {
    const categoryName = item.categoria?.nombre || 'Sin categoría';
    const genres = item.generos?.map((genre) => genre.nombre).join(', ') || 'Sin géneros';
    const actors = item.actores?.map((actor) => actor.nombre_completo).join(', ') || 'Sin actores registrados';
    const seasons = item.temporadas ? `${item.temporadas} temporada${item.temporadas === 1 ? '' : 's'}` : 'Película';
    const poster = item.poster || placeholderPoster;
    const trailer = item.trailer
      ? `<button class="trailer-button" type="button" data-trailer-id="${item.id}">▶ Ver trailer</button>`
      : '';

    return `
      <article class="movie-card">
        <div class="poster-wrap">
          <img
            src="${escapeHtml(poster)}"
            alt="Poster de ${escapeHtml(item.titulo)}"
            onerror="this.onerror=null;this.src='${placeholderPoster}'"
          >
        </div>
        <div class="card-body">
          <span class="card-category">${escapeHtml(categoryName)}</span>
          <h3>${escapeHtml(item.titulo)}</h3>
          <p class="sinopsis">${escapeHtml(item.sinopsis)}</p>
          <div class="card-meta">
            <p><strong>Formato:</strong> ${escapeHtml(seasons)}</p>
            <p><strong>Géneros:</strong> ${escapeHtml(genres)}</p>
            <p><strong>Reparto:</strong> ${escapeHtml(actors)}</p>
          </div>
          ${trailer}
        </div>
      </article>
    `;
  }).join('');

  updatePagination();
}

function updatePagination() {
  const totalPages = Math.max(1, Math.ceil(currentItems.length / ITEMS_PER_PAGE));

  if (currentPage > totalPages) currentPage = totalPages;

  pageIndicator.textContent = `Página ${currentPage} de ${totalPages}`;
  previousPageButton.disabled = currentPage <= 1;
  nextPageButton.disabled = currentPage >= totalPages;
  pagination.hidden = currentItems.length === 0;
}

previousPageButton.addEventListener('click', () => {
  if (currentPage > 1) {
    currentPage -= 1;
    renderCurrentPage();
  }
});

nextPageButton.addEventListener('click', () => {
  const totalPages = Math.ceil(currentItems.length / ITEMS_PER_PAGE);
  if (currentPage < totalPages) {
    currentPage += 1;
    renderCurrentPage();
  }
});

searchForm.addEventListener('submit', (event) => {
  event.preventDefault();
  const title = titleSearch.value.trim();

  if (!title) {
    catalogTitle.textContent = 'Todo el contenido';
    fetchCatalog('/api/catalogo');
    return;
  }

  catalogTitle.textContent = `Resultados para "${title}"`;
  fetchCatalog(`/api/titulo/${encodeURIComponent(title)}`);
});

actorSearchForm.addEventListener('submit', (event) => {
  event.preventDefault();
  const actorName = actorSearch.value.trim();

  if (!actorName) {
    catalogTitle.textContent = 'Todo el contenido';
    fetchCatalog('/api/catalogo');
    return;
  }

  catalogTitle.textContent = `Reparto: ${actorName}`;
  fetchCatalog(`/api/reparto/${encodeURIComponent(actorName)}`);
});

filterButtons.forEach((button) => {
  button.addEventListener('click', () => {
    filterButtons.forEach((item) => item.classList.remove('active'));
    button.classList.add('active');

    const category = button.dataset.category;
    titleSearch.value = '';

    if (category === 'Todas') {
      catalogTitle.textContent = 'Todo el contenido';
      fetchCatalog('/api/catalogo');
      return;
    }

    catalogTitle.textContent = `Contenido de ${category === 'Película' ? 'películas' : 'series'}`;
    fetchCatalog(`/api/categoria/${encodeURIComponent(category)}`);
  });
});

function showView(viewName) {
  catalogTab.classList.toggle('active', viewName === 'catalog');
  crudTab.classList.toggle('active', viewName === 'crud');
  architectureTab.classList.toggle('active', viewName === 'architecture');

  catalogView.classList.toggle('hidden', viewName !== 'catalog');
  document.querySelector('.catalog-section').classList.toggle('hidden', viewName !== 'catalog');
  crudView.classList.toggle('hidden', viewName !== 'crud');
  architectureView.classList.toggle('hidden', viewName !== 'architecture');
}

catalogTab.addEventListener('click', () => showView('catalog'));
crudTab.addEventListener('click', () => showView('crud'));
architectureTab.addEventListener('click', () => showView('architecture'));

catalogGrid.addEventListener('click', async (event) => {
  const trailerButton = event.target.closest('[data-trailer-id]');
  if (!trailerButton) return;

  try {
    const response = await fetch(`/api/trailer/${trailerButton.dataset.trailerId}`);
    const payload = await response.json();

    if (!response.ok) {
      showNotice(payload.error || 'No se pudo obtener el tráiler.');
      return;
    }

    if (payload.trailer) {
      window.open(payload.trailer, '_blank', 'noopener,noreferrer');
    } else {
      showNotice(payload.mensaje || 'El tráiler no está disponible para este título.');
    }
  } catch (error) {
    console.error(error);
    showNotice('No se pudo consultar el tráiler.');
  }
});

function parseIdList(value) {
  const trimmed = value.trim();
  if (!trimmed) return undefined;
  return trimmed.split(',').map((item) => Number(item.trim())).filter(Number.isInteger);
}

function showCrudResponse(payload) {
  crudResult.classList.remove('hidden');
  crudResultBody.textContent = JSON.stringify(payload, null, 2);
}

async function sendCrudRequest(url, options) {
  crudNotice.classList.add('hidden');

  try {
    const response = await fetch(url, options);
    const payload = await response.json();

    if (!response.ok) {
      crudNotice.textContent = payload.error || 'La operación no pudo completarse.';
      crudNotice.classList.remove('hidden');
    }

    showCrudResponse({ status: response.status, ...payload });
  } catch (error) {
    console.error(error);
    crudNotice.textContent = 'No se pudo conectar con la API.';
    crudNotice.classList.remove('hidden');
  }
}

document.getElementById('create-form').addEventListener('submit', (event) => {
  event.preventDefault();
  const form = new FormData(event.currentTarget);
  const generos = parseIdList(form.get('generos') || '');
  const actores = parseIdList(form.get('actores') || '');

  const body = {
    titulo: form.get('titulo'),
    sinopsis: form.get('sinopsis'),
    temporadas: form.get('temporadas') || null,
    poster: form.get('poster'),
    trailer: form.get('trailer'),
    id_categoria: Number(form.get('id_categoria'))
  };

  if (generos !== undefined) body.generos = generos;
  if (actores !== undefined) body.actores = actores;

  sendCrudRequest('/api/catalogo', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body)
  });
});

document.getElementById('update-form').addEventListener('submit', (event) => {
  event.preventDefault();
  const form = new FormData(event.currentTarget);
  const id = form.get('id');
  const generos = parseIdList(form.get('generos') || '');
  const actores = parseIdList(form.get('actores') || '');
  const body = {};

  if (form.get('titulo')) body.titulo = form.get('titulo');
  if (form.get('sinopsis')) body.sinopsis = form.get('sinopsis');
  if (form.get('temporadas')) body.temporadas = Number(form.get('temporadas'));
  if (form.get('poster')) body.poster = form.get('poster');
  if (form.get('trailer')) body.trailer = form.get('trailer');
  if (form.get('id_categoria')) body.id_categoria = Number(form.get('id_categoria'));
  if (generos !== undefined) body.generos = generos;
  if (actores !== undefined) body.actores = actores;

  sendCrudRequest(`/api/catalogo/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body)
  });
});

document.getElementById('delete-form').addEventListener('submit', (event) => {
  event.preventDefault();
  const form = new FormData(event.currentTarget);
  const id = form.get('id');

  sendCrudRequest(`/api/catalogo/${id}`, { method: 'DELETE' });
});

fetchCatalog('/api/catalogo');
