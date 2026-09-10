/**
 * BaworLingua - Interactive Scripts
 * Dual Language Bilingual System, Search/Filter & Audio Features
 */

document.addEventListener('DOMContentLoaded', () => {
  const body = document.body;
  const navbar = document.getElementById('main-navbar');
  const langBtn = document.getElementById('lang-selector-btn');
  const langLabel = document.getElementById('lang-label');
  const mascotImg = document.getElementById('bawor-mascot-img');
  const speechBubble = document.getElementById('hero-speech-bubble');

  // Load language preference from localStorage (default: 'id')
  const savedLang = localStorage.getItem('baworlingua_lang') || localStorage.getItem('language') || 'id';
  setLanguage(savedLang);

  function setLanguage(lang) {
    body.setAttribute('data-lang', lang);
    if (langLabel) {
      langLabel.textContent = lang.toUpperCase();
    }
    localStorage.setItem('baworlingua_lang', lang);
    localStorage.setItem('language', lang);

    // Update kuliner search input placeholder if present
    const kulinerSearchInput = document.getElementById('kuliner-search-input');
    if (kulinerSearchInput) {
      kulinerSearchInput.placeholder = lang === 'en' ? 'Search Banyumas cuisine...' : 'Cari kuliner Banyumas...';
      kulinerSearchInput.setAttribute('aria-label', lang === 'en' ? 'Search Banyumas cuisine' : 'Cari kuliner Banyumas');
    }

    // Update kuliner sorting select options if present
    const optTerbaru = document.getElementById('opt-terbaru');
    const optTerlama = document.getElementById('opt-terlama');
    const optRating = document.getElementById('opt-rating');
    if (optTerbaru) optTerbaru.textContent = lang === 'en' ? 'Newest' : 'Terbaru';
    if (optTerlama) optTerlama.textContent = lang === 'en' ? 'Oldest' : 'Terlama';
    // Update translation page textareas if present
    const transInputText = document.getElementById('trans-input-text');
    const transOutputText = document.getElementById('trans-output-text');
    if (transInputText) {
      transInputText.placeholder = lang === 'en' ? 'Type or paste text here...' : 'Ketik atau tempel teks di sini...';
    }
    if (transOutputText) {
      transOutputText.placeholder = lang === 'en' ? 'Translation result will appear here...' : 'Hasil terjemahan akan muncul di sini...';
    }
  }

  // Language selector button click event
  if (langBtn) {
    langBtn.addEventListener('click', () => {
      const currentLang = body.getAttribute('data-lang') || 'id';
      const newLang = currentLang === 'id' ? 'en' : 'id';
      setLanguage(newLang);
    });
  }

  // Sticky Navbar shadow effect on scroll
  if (navbar) {
    window.addEventListener('scroll', () => {
      if (window.scrollY > 20) {
        navbar.style.boxShadow = '0 4px 20px rgba(15, 118, 110, 0.12)';
      } else {
        navbar.style.boxShadow = '0 2px 10px rgba(15, 118, 110, 0.08)';
      }
    });
  }

  // Mascot & speech bubble interaction (Belajar page)
  const learnMascotImg = document.getElementById('learn-bawor-img');
  const learnSpeechBubble = document.getElementById('learn-speech-bubble');
  if (learnMascotImg && learnSpeechBubble) {
    learnMascotImg.addEventListener('mouseenter', () => {
      learnSpeechBubble.style.transform = 'scale(1.08) translateY(-4px)';
      learnSpeechBubble.style.borderColor = '#14B8A6';
    });

    learnMascotImg.addEventListener('mouseleave', () => {
      learnSpeechBubble.style.transform = 'none';
      learnSpeechBubble.style.borderColor = '#0F766E';
    });
  }

  // --- SELECT LANGUAGE PAGE CARD ACTIONS ---
  const selectLangBtns = document.querySelectorAll('.btn-select-lang');
  selectLangBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const selectedLang = btn.getAttribute('data-lang-select') || 'id';
      setLanguage(selectedLang);
      window.location.href = 'index.html';
    });
  });

  // --- LEVEL TAB INTERACTION (BELAJAR PAGE) ---
  const levelTabs = document.querySelectorAll('.level-tab-btn');
  const tabPanels = document.querySelectorAll('.tab-content-panel');

  if (levelTabs.length > 0) {
    levelTabs.forEach(tab => {
      tab.addEventListener('click', () => {
        const targetTab = tab.getAttribute('data-tab');

        // Remove active class from all tabs & panels
        levelTabs.forEach(t => t.classList.remove('active'));
        tabPanels.forEach(p => p.classList.remove('active'));

        // Add active class to clicked tab
        tab.classList.add('active');

        // Show target panel
        const targetPanel = document.getElementById(`panel-${targetTab}`);
        if (targetPanel) {
          targetPanel.classList.add('active');
        }

        // Refresh material count badges dynamically from database
        updateDynamicMaterialCardCounts();
      });
    });
  }

  // ==========================================================================
  // DYNAMIC MATERIAL DATABASE SERVICE & CONTROLLER (TAHAP 3)
  // ==========================================================================
  const LESSONS_API_ENDPOINT = '/api/lessons'; // Production database REST API endpoint placeholder
  const LESSONS_STORAGE_KEY = 'baworlingua_lessons_db';

  class MaterialDatabaseService {
    /**
     * Fetch all material lessons from Database (API) with LocalStorage fallback.
     * @returns {Promise<Array>} Array of lesson objects [{ id, category, title, level }]
     */
    async getLessonsFromDB() {
      try {
        const response = await fetch(LESSONS_API_ENDPOINT);
        if (response.ok) {
          const data = await response.json();
          return Array.isArray(data) ? data : [];
        }
      } catch (err) {
        // Backend API is unattached / unavailable.
        // Fallback to client database (localStorage) without fabricating fake count numbers.
      }

      const storedDB = localStorage.getItem(LESSONS_STORAGE_KEY);
      if (storedDB) {
        try {
          const parsed = JSON.parse(storedDB);
          return Array.isArray(parsed) ? parsed : [];
        } catch (e) {
          return [];
        }
      }
      return [];
    }

    /**
     * Calculates dynamic material count per category slug from database.
     * Returns 0 if category has no lessons in the database.
     * @param {string} categorySlug 
     * @returns {Promise<number>}
     */
    async getMaterialCountByCategory(categorySlug) {
      const lessons = await this.getLessonsFromDB();
      if (!lessons || lessons.length === 0) return 0;

      const normalizedSlug = categorySlug.toLowerCase().trim();
      const count = lessons.filter(item => {
        if (!item || !item.category) return false;
        const itemCat = item.category.toLowerCase().trim();
        return itemCat === normalizedSlug || itemCat.replace(/\s+/g, '-') === normalizedSlug;
      }).length;

      return count;
    }

    /**
     * Helper to add a new lesson item to local database storage (e.g. when Admin adds lesson).
     * @param {Object} lessonObj { category, title, level }
     */
    async addLessonToDatabase(lessonObj) {
      const lessons = await this.getLessonsFromDB();
      const newLesson = {
        id: 'lesson_' + Date.now() + '_' + Math.random().toString(36).substr(2, 4),
        category: lessonObj.category || 'kosakata-dasar',
        title: lessonObj.title || 'Materi Baru',
        level: lessonObj.level || 'pemula',
        createdAt: new Date().toISOString()
      };
      lessons.push(newLesson);
      localStorage.setItem(LESSONS_STORAGE_KEY, JSON.stringify(lessons));
      await updateDynamicMaterialCardCounts();
      return newLesson;
    }

    /**
     * Clear all lessons from client database storage (resets counts to 0).
     */
    async clearDatabase() {
      localStorage.removeItem(LESSONS_STORAGE_KEY);
      await updateDynamicMaterialCardCounts();
    }
  }

  const BaworMaterialService = new MaterialDatabaseService();
  window.BaworMaterialService = BaworMaterialService; // Expose globally for administrative/testing access

  /**
   * Dynamically updates all card badge counts based on live database queries.
   */
  async function updateDynamicMaterialCardCounts() {
    const countBadges = document.querySelectorAll('.badge-count[data-category]');
    if (countBadges.length === 0) return;

    const lessons = await BaworMaterialService.getLessonsFromDB();
    
    // Group counts by category in one pass
    const categoryCounts = {};
    lessons.forEach(item => {
      if (!item || !item.category) return;
      const cat = item.category.toLowerCase().trim().replace(/\s+/g, '-');
      categoryCounts[cat] = (categoryCounts[cat] || 0) + 1;
    });

    countBadges.forEach(badge => {
      const categorySlug = badge.getAttribute('data-category');
      if (categorySlug) {
        const normalizedSlug = categorySlug.toLowerCase().trim();
        const count = categoryCounts[normalizedSlug] || 0;
        badge.textContent = count.toString();
      }
    });
  }

  // Initial calculation on page load
  updateDynamicMaterialCardCounts();



  // ==========================================================================
  // VISITOR COUNTER SERVICE & CONTROLLER
  // ==========================================================================
  const visitorCountElement = document.getElementById('visitor-count-value');

  /**
   * Configurable backend API endpoint for visitor counter.
   * To connect to a real backend, update VISITOR_API_ENDPOINT URL.
   */
  const VISITOR_API_ENDPOINT = '/api/visitors'; // Production API endpoint placeholder

  if (visitorCountElement) {
    initVisitorCounter();
  }

  async function initVisitorCounter() {
    try {
      let count = await fetchVisitorCountFromAPI();
      displayVisitorCount(count);
    } catch (err) {
      console.log('Backend Visitor API unavailable. Using development mock data source.');
      let fallbackCount = getMockVisitorCount();
      displayVisitorCount(fallbackCount);
    }
  }

  /**
   * Fetches visitor count from backend API.
   * Uses sessionStorage guard to ensure the visit increment is requested ONLY ONCE
   * per user session (preventing counts on re-renders/component state updates).
   */
  async function fetchVisitorCountFromAPI() {
    const isNewSession = !sessionStorage.getItem('baworlingua_visit_counted');
    const method = isNewSession ? 'POST' : 'GET';

    const response = await fetch(VISITOR_API_ENDPOINT, {
      method: method,
      headers: { 'Content-Type': 'application/json' }
    });

    if (!response.ok) {
      throw new Error(`API returned status ${response.status}`);
    }

    const data = await response.json();
    if (isNewSession) {
      sessionStorage.setItem('baworlingua_visit_counted', 'true');
    }
    return data.count;
  }

  /**
   * Development Mock/Fallback Data Source.
   * Simulates incrementing visitor count per fresh session when backend is not connected.
   */
  function getMockVisitorCount() {
    const STORAGE_KEY = 'baworlingua_mock_visitor_count';
    const SESSION_KEY = 'baworlingua_visit_counted';

    let currentCount = parseInt(localStorage.getItem(STORAGE_KEY), 10) || 128;
    const isNewSession = !sessionStorage.getItem(SESSION_KEY);

    if (isNewSession) {
      currentCount += 1;
      localStorage.setItem(STORAGE_KEY, currentCount.toString());
      sessionStorage.setItem(SESSION_KEY, 'true');
    }

    return currentCount;
  }

  function displayVisitorCount(count) {
    if (!visitorCountElement) return;
    const formatted = Number(count).toLocaleString('id-ID');
    visitorCountElement.textContent = formatted;
  }

  // ==========================================================================
  // DYNAMIC KULINER DATABASE SERVICE & CONTROLLER (TAHAP B)
  // ==========================================================================
  const KULINER_API_ENDPOINT = '/api/kuliner'; // Production database REST API endpoint placeholder
  const KULINER_STORAGE_KEY = 'baworlingua_kuliner_db';

  const DEFAULT_KULINER_DATABASE = [
    {
      id: 'kul_1',
      name_id: 'Mendoan Banyumas',
      name_en: 'Banyumas Mendoan',
      description_id: 'Tempe tipis khas Banyumas digoreng setengah matang berbalut adonan tepung gurih berlapis daun bawang, nikmat disantap hangat dengan sambal kecap pedas manis.',
      description_en: 'Authentic Banyumas thin soybean cakes fried half-cooked in scallion-infused spiced batter, served hot with sweet soy sauce chili dip.',
      category: 'makanan',
      image: 'assets/kuliner/mendoan.jpg',
      rating: 4.9,
      review_count: 248,
      location: 'Purwokerto, Banyumas',
      created_at: '2026-03-05T09:00:00Z'
    },
    {
      id: 'kul_2',
      name_id: 'Sroto Sokaraja',
      name_en: 'Sokaraja Sroto',
      description_id: 'Soto khas Sokaraja berkuah gurih kental kacang tanah dengan irisan ketupat, daging sapi atau ayam, dan kerupuk cantir warna-warni yang khas.',
      description_en: 'Signature Sokaraja style aromatic soup featuring rich peanut broth, rice cakes, tender beef or chicken, and traditional colorful cantir crackers.',
      category: 'makanan',
      image: 'assets/kuliner/soto_sokaraja.jpg',
      rating: 4.8,
      review_count: 185,
      location: 'Sokaraja, Banyumas',
      created_at: '2026-03-04T11:30:00Z'
    },
    {
      id: 'kul_3',
      name_id: 'Getuk Goreng Sokaraja',
      name_en: 'Sokaraja Fried Getuk',
      description_id: 'Olahan singkong manis khas Sokaraja beraroma gula kelapa alami yang digoreng renyah di luar dan sangat lembut di dalam.',
      description_en: 'Famous Sokaraja sweet cassava delicacy cooked with natural coconut sugar, crisp on the outside and soft and chewy inside.',
      category: 'jajanan',
      image: 'assets/kuliner/getuk_goreng.jpg',
      rating: 4.7,
      review_count: 210,
      location: 'Sokaraja, Banyumas',
      created_at: '2026-03-02T14:15:00Z'
    },
    {
      id: 'kul_4',
      name_id: 'Es Dawet Ayu',
      name_en: 'Dawet Ayu Ice',
      description_id: 'Minuman segar cendol beras lembut berpadu kuah santan gurih dan sirup gula merah asli Banyumas yang manis legit menggugah selera.',
      description_en: 'Refreshing traditional iced beverage made with delicate rice flour jelly, creamy coconut milk, and aromatic palm sugar syrup.',
      category: 'minuman',
      image: 'assets/kuliner/Es_Dawet.jpg',
      rating: 4.9,
      review_count: 162,
      location: 'Purwokerto, Banyumas',
      created_at: '2026-03-03T15:45:00Z'
    },
    {
      id: 'kul_5',
      name_id: 'Kraca Banyumas',
      name_en: 'Banyumas Spiced Snails (Kraca)',
      description_id: 'Sajian keong sawah berkuah bumbu rempah melimpah pedas gurih seperti serai, jahe, dan pala yang memberikan rasa sangat khas.',
      description_en: 'Traditional savory field snails stewed in rich, aromatic spicy herbal broth infused with lemongrass, ginger, and nutmeg.',
      category: 'makanan',
      image: 'assets/kuliner/Kraca.jpg',
      rating: 4.6,
      review_count: 94,
      location: 'Banyumas, Central Java',
      created_at: '2026-03-01T08:20:00Z'
    }
  ];

  class KulinerDatabaseService {
    /**
     * Fetch all culinary data from Database (API) with LocalStorage fallback.
     * @returns {Promise<Array>} Array of culinary objects matching DB schema
     */
    async getKulinerFromDB() {
      try {
        const response = await fetch(KULINER_API_ENDPOINT);
        if (response.ok) {
          const data = await response.json();
          if (Array.isArray(data)) return data;
        }
      } catch (err) {
        // Backend API unavailable, fall back to local database storage
      }

      const storedDB = localStorage.getItem(KULINER_STORAGE_KEY);
      if (storedDB !== null) {
        try {
          const parsed = JSON.parse(storedDB);
          return Array.isArray(parsed) ? parsed : [];
        } catch (e) {
          return [];
        }
      }

      // Initialize default dataset in storage if uninitialized
      localStorage.setItem(KULINER_STORAGE_KEY, JSON.stringify(DEFAULT_KULINER_DATABASE));
      return DEFAULT_KULINER_DATABASE;
    }

    /**
     * Query data with search, category filter, and sorting from database.
     * @param {Object} options { search, category, sort }
     * @returns {Promise<Array>}
     */
    async queryKuliner({ search = '', category = 'semua', sort = 'terbaru' } = {}) {
      let items = await this.getKulinerFromDB();
      if (!Array.isArray(items) || items.length === 0) return [];

      // 1. Search Filter (by name_id, name_en, description_id, description_en)
      if (search && search.trim() !== '') {
        const q = search.toLowerCase().trim();
        items = items.filter(item => {
          if (!item) return false;
          const nameId = (item.name_id || '').toLowerCase();
          const nameEn = (item.name_en || '').toLowerCase();
          const descId = (item.description_id || '').toLowerCase();
          const descEn = (item.description_en || '').toLowerCase();
          return nameId.includes(q) || nameEn.includes(q) || descId.includes(q) || descEn.includes(q);
        });
      }

      // 2. Category Filter (semua, makanan, minuman, jajanan)
      if (category && category.toLowerCase() !== 'semua') {
        const catQ = category.toLowerCase().trim();
        items = items.filter(item => {
          if (!item || !item.category) return false;
          return item.category.toLowerCase().trim() === catQ;
        });
      }

      // 3. Sorting (terbaru, terlama, rating)
      items = items.sort((a, b) => {
        if (sort === 'terbaru') {
          return new Date(b.created_at || 0) - new Date(a.created_at || 0);
        } else if (sort === 'terlama') {
          return new Date(a.created_at || 0) - new Date(b.created_at || 0);
        } else if (sort === 'rating') {
          return (Number(b.rating) || 0) - (Number(a.rating) || 0);
        }
        return 0;
      });

      return items;
    }

    /**
     * Helper method to insert a new culinary item into DB
     */
    async addKulinerToDatabase(item) {
      const db = await this.getKulinerFromDB();
      const newItem = {
        id: 'kul_' + Date.now() + '_' + Math.random().toString(36).substr(2, 4),
        name_id: item.name_id || '',
        name_en: item.name_en || '',
        description_id: item.description_id || '',
        description_en: item.description_en || '',
        category: item.category || 'makanan',
        image: item.image || '',
        rating: item.rating || 5.0,
        review_count: item.review_count || 0,
        location: item.location || 'Banyumas',
        created_at: new Date().toISOString()
      };
      db.push(newItem);
      localStorage.setItem(KULINER_STORAGE_KEY, JSON.stringify(db));
      return newItem;
    }
  }

  const BaworKulinerService = new KulinerDatabaseService();
  window.BaworKulinerService = BaworKulinerService; // Global reference for dev/backend tests

  // Controller for /kuliner page UI
  const cardsGridContainer = document.getElementById('kuliner-cards-grid');
  if (cardsGridContainer) {
    initKulinerPage();
  }

  function initKulinerPage() {
    const searchInput = document.getElementById('kuliner-search-input');
    const clearSearchBtn = document.getElementById('kuliner-search-clear');
    const categoryChips = document.querySelectorAll('#kuliner-category-filters .filter-chip');
    const sortSelect = document.getElementById('kuliner-sort-select');

    let searchState = '';
    let categoryState = 'semua';
    let sortState = sortSelect ? sortSelect.value : 'terbaru';

    // Event: Search Input
    if (searchInput) {
      // Set initial placeholder based on active language
      const activeLang = document.body.getAttribute('data-lang') || 'id';
      searchInput.placeholder = activeLang === 'en' ? 'Search Banyumas cuisine...' : 'Cari kuliner Banyumas...';

      searchInput.addEventListener('input', (e) => {
        searchState = e.target.value;
        if (clearSearchBtn) {
          clearSearchBtn.style.display = searchState.trim().length > 0 ? 'flex' : 'none';
        }
        updateKulinerGrid();
      });
    }

    // Event: Clear Search Button
    if (clearSearchBtn) {
      clearSearchBtn.addEventListener('click', () => {
        if (searchInput) {
          searchInput.value = '';
          searchState = '';
        }
        clearSearchBtn.style.display = 'none';
        updateKulinerGrid();
      });
    }

    // Event: Category Filters
    categoryChips.forEach(chip => {
      chip.addEventListener('click', () => {
        categoryChips.forEach(c => c.classList.remove('active'));
        chip.classList.add('active');
        categoryState = chip.getAttribute('data-category') || 'semua';
        updateKulinerGrid();
      });
    });

    // Event: Sort Select Dropdown
    if (sortSelect) {
      sortSelect.addEventListener('change', (e) => {
        sortState = e.target.value;
        updateKulinerGrid();
      });
    }

    // Initial grid render
    updateKulinerGrid();

    async function updateKulinerGrid() {
      const items = await BaworKulinerService.queryKuliner({
        search: searchState,
        category: categoryState,
        sort: sortState
      });

      if (!items || items.length === 0) {
        // Empty State requirement
        cardsGridContainer.innerHTML = `
          <div class="kuliner-empty-state" id="kuliner-empty-state">
            <div class="empty-icon">
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
                <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
              </svg>
            </div>
            <div class="bilingual-text empty-message">
              <p class="text-id">Belum ada data kuliner.</p>
              <p class="text-en">No cuisine data available yet.</p>
            </div>
          </div>
        `;
        return;
      }

      // Render items
      cardsGridContainer.innerHTML = items.map(item => createKulinerCardHTML(item)).join('');
    }
  }

  function createKulinerCardHTML(item) {
    const categoryNameId = item.category === 'minuman' ? 'Minuman' : (item.category === 'jajanan' ? 'Jajanan' : 'Makanan');
    const categoryNameEn = item.category === 'minuman' ? 'Drinks' : (item.category === 'jajanan' ? 'Snacks' : 'Food');

    const imageHTML = item.image
      ? `<img src="${item.image}" alt="${escapeHtml(item.name_id)}" class="kuliner-card-img" loading="lazy" onerror="this.onerror=null; this.parentNode.innerHTML='<div class=\\'kuliner-img-placeholder\\'><svg width=\\'40\\' height=\\'40\\' viewBox=\\'0 0 24 24\\' fill=\\'none\\' stroke=\\'currentColor\\' stroke-width=\\'1.5\\'><rect x=\\'3\\' y=\\'3\\' width=\\'18\\' height=\\'18\\' rx=\\'2\\'/><circle cx=\\'8.5\\' cy=\\'8.5\\' r=\\'1.5\\'/><path d=\\'M21 15l-5-5L5 21\\'/></svg><span>Gambar Tidak Tersedia</span></div>';">`
      : `<div class="kuliner-img-placeholder"><svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><path d="M21 15l-5-5L5 21"/></svg><span>Gambar Tidak Tersedia</span></div>`;

    return `
      <article class="kuliner-card" data-id="${item.id}">
        <div class="kuliner-card-img-wrapper">
          ${imageHTML}
          <span class="kuliner-card-badge badge-${escapeHtml(item.category)}">
            <span class="bilingual-text">
              <span class="text-id">${categoryNameId}</span>
              <span class="text-en">${categoryNameEn}</span>
            </span>
          </span>
        </div>
        <div class="kuliner-card-body">
          <div class="kuliner-card-header">
            <div class="kuliner-card-title-bilingual bilingual-text">
              <h3 class="kuliner-card-title text-id">${escapeHtml(item.name_id)}</h3>
              <h3 class="kuliner-card-title text-en">${escapeHtml(item.name_en || item.name_id)}</h3>
            </div>
            <div class="kuliner-card-rating" aria-label="Rating ${item.rating}">
              <svg class="star-icon" width="15" height="15" viewBox="0 0 24 24" fill="#F59E0B" stroke="#F59E0B" stroke-width="1">
                <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
              </svg>
              <span class="rating-value">${Number(item.rating || 0).toFixed(1)}</span>
              <span class="review-count bilingual-text">
                <span class="text-id">(${item.review_count} ulasan)</span>
                <span class="text-en">(${item.review_count} reviews)</span>
              </span>
            </div>
          </div>
          <div class="kuliner-card-desc bilingual-text">
            <p class="text-id">${escapeHtml(item.description_id)}</p>
            <p class="text-en">${escapeHtml(item.description_en)}</p>
          </div>
          <div class="kuliner-card-footer">
            <div class="kuliner-location">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                <circle cx="12" cy="10" r="3"></circle>
              </svg>
              <span>${escapeHtml(item.location || 'Banyumas')}</span>
            </div>
          </div>
        </div>
      </article>
    `;
  }

  function escapeHtml(str) {
    if (!str) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  // ==========================================================================
  // TRANSLATION PAGE FRONTEND INTERACTION (STAGE B)
  // ==========================================================================
  const transInputArea = document.getElementById('trans-input-text');
  const transOutputArea = document.getElementById('trans-output-text');
  const charCounterLabel = document.getElementById('char-counter');
  const swapLangBtn = document.getElementById('btn-swap-lang');
  const langFromSelect = document.getElementById('lang-from-select');
  const langToSelect = document.getElementById('lang-to-select');

  function updateTranslationPlaceholders() {
    if (!transInputArea || !transOutputArea || !langFromSelect) return;
    const sysLang = document.body.getAttribute('data-lang') || 'id';
    const fromVal = langFromSelect.value;
    const toVal = langToSelect ? langToSelect.value : 'bny';

    if (fromVal === 'id') {
      transInputArea.placeholder = sysLang === 'en' ? 'Type or paste Indonesian text here...' : 'Ketik atau tempel teks Bahasa Indonesia di sini...';
    } else if (fromVal === 'bny') {
      transInputArea.placeholder = sysLang === 'en' ? 'Type or paste Banyumasan text here...' : 'Ketik utawa tempel teks basa Banyumasan nang kene...';
    } else if (fromVal === 'en') {
      transInputArea.placeholder = sysLang === 'en' ? 'Type or paste English text here...' : 'Ketik atau tempel teks Bahasa Inggris di sini...';
    }

    if (toVal === 'id') {
      transOutputArea.placeholder = sysLang === 'en' ? 'Indonesian translation result will appear here...' : 'Hasil terjemahan Bahasa Indonesia akan muncul di sini...';
    } else if (toVal === 'bny') {
      transOutputArea.placeholder = sysLang === 'en' ? 'Banyumasan translation result will appear here...' : 'Hasil terjemahan basa Banyumasan bakal muncul nang kene...';
    } else if (toVal === 'en') {
      transOutputArea.placeholder = sysLang === 'en' ? 'English translation result will appear here...' : 'Hasil terjemahan Bahasa Inggris akan muncul di sini...';
    }
  }

  if (transInputArea) {
    // Track previous values to seamlessly adjust when same language is picked
    let prevLangFrom = langFromSelect ? langFromSelect.value : 'id';
    let prevLangTo = langToSelect ? langToSelect.value : 'bny';

    // 1. Character Counter
    transInputArea.addEventListener('input', () => {
      const len = transInputArea.value.length;
      if (charCounterLabel) {
        charCounterLabel.textContent = `${len} / 500`;
      }
    });

    // 2. Dropdown manual change handling (3-language support & prevent duplicate selection)
    if (langFromSelect && langToSelect) {
      langFromSelect.addEventListener('change', () => {
        const fromVal = langFromSelect.value;
        if (fromVal === langToSelect.value) {
          const available = ['id', 'bny', 'en'].filter(l => l !== fromVal);
          langToSelect.value = available.includes(prevLangFrom) ? prevLangFrom : available[0];
        }
        prevLangFrom = langFromSelect.value;
        prevLangTo = langToSelect.value;
        updateTranslationPlaceholders();
      });

      langToSelect.addEventListener('change', () => {
        const toVal = langToSelect.value;
        if (toVal === langFromSelect.value) {
          const available = ['id', 'bny', 'en'].filter(l => l !== toVal);
          langFromSelect.value = available.includes(prevLangTo) ? prevLangTo : available[0];
        }
        prevLangFrom = langFromSelect.value;
        prevLangTo = langToSelect.value;
        updateTranslationPlaceholders();
      });
    }

    // 3. Swap Language Button (Circular Center Button)
    if (swapLangBtn && langFromSelect && langToSelect) {
      swapLangBtn.addEventListener('click', () => {
        // Swap select dropdown values
        const tempVal = langFromSelect.value;
        langFromSelect.value = langToSelect.value;
        langToSelect.value = tempVal;

        prevLangFrom = langFromSelect.value;
        prevLangTo = langToSelect.value;

        // Update placeholder texts according to new source language
        updateTranslationPlaceholders();

        // Swap input & output textarea values if text is typed
        if (transOutputArea && (transInputArea.value.trim() !== '' || transOutputArea.value.trim() !== '')) {
          const tempText = transInputArea.value;
          transInputArea.value = transOutputArea.value;
          transOutputArea.value = tempText;
          if (charCounterLabel) {
            charCounterLabel.textContent = `${transInputArea.value.length} / 500`;
          }
        }

        // Visual animation effect on swap button
        swapLangBtn.style.transform = 'scale(1.18) rotate(180deg)';
        setTimeout(() => {
          swapLangBtn.style.transform = '';
        }, 300);
      });
    }

    // 3. Action Buttons (Copy, Audio Feedback, Share)
    const copyInputBtn = document.getElementById('btn-copy-input');
    const copyOutputBtn = document.getElementById('btn-copy-output');
    const audioOutputBtn = document.getElementById('btn-audio-output');
    const shareOutputBtn = document.getElementById('btn-share-output');

    if (copyInputBtn) {
      copyInputBtn.addEventListener('click', () => {
        if (transInputArea.value.trim().length > 0) {
          navigator.clipboard.writeText(transInputArea.value);
        }
      });
    }

    if (copyOutputBtn && transOutputArea) {
      copyOutputBtn.addEventListener('click', () => {
        if (transOutputArea.value.trim().length > 0) {
          navigator.clipboard.writeText(transOutputArea.value);
        }
      });
    }

    if (audioOutputBtn) {
      audioOutputBtn.addEventListener('click', () => {
        const textToSpeak = (transOutputArea && transOutputArea.value.trim()) || (transInputArea && transInputArea.value.trim());
        if (textToSpeak && 'speechSynthesis' in window) {
          const utterance = new SpeechSynthesisUtterance(textToSpeak);
          utterance.lang = 'id-ID';
          window.speechSynthesis.speak(utterance);
        }
      });
    }

    if (shareOutputBtn) {
      shareOutputBtn.addEventListener('click', () => {
        if (navigator.share && transInputArea && transInputArea.value.trim()) {
          navigator.share({
            title: 'Terjemahan BaworLingua',
            text: transInputArea.value,
            url: window.location.href
          }).catch(() => {});
        } else {
          navigator.clipboard.writeText(window.location.href);
        }
      });
    }

    // 4. Audio Feedback for Example items
    const exampleAudioBtns = document.querySelectorAll('.btn-example-audio');
    exampleAudioBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        const parentItem = btn.closest('.example-item');
        if (parentItem) {
          const bnyText = parentItem.querySelector('.ex-bny');
          if (bnyText && 'speechSynthesis' in window) {
            const utterance = new SpeechSynthesisUtterance(bnyText.textContent);
            utterance.lang = 'id-ID';
            window.speechSynthesis.speak(utterance);
          }
        }
      });
    });
  }
});

