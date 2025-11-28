/**
 * 검색 기능
 * - 클라이언트 사이드 실시간 검색
 * - 디바운스 적용
 */

// DOM 요소
const searchInput = document.getElementById('search-input');

// 디바운스 타이머
let searchTimeout = null;
const DEBOUNCE_DELAY = 300; // ms

/**
 * 검색 이벤트 핸들러
 */
function handleSearch(event) {
  const query = event.target.value.trim();
  
  // 디바운스 적용
  if (searchTimeout) {
    clearTimeout(searchTimeout);
  }
  
  searchTimeout = setTimeout(() => {
    // app.js의 updateSearchResults 함수 호출
    if (typeof window.updateSearchResults === 'function') {
      window.updateSearchResults(query);
    }
  }, DEBOUNCE_DELAY);
}

/**
 * 검색 초기화
 */
function initSearch() {
  if (searchInput) {
    searchInput.addEventListener('input', handleSearch);
    
    // Enter 키 방지 (form submit 방지)
    searchInput.addEventListener('keydown', (event) => {
      if (event.key === 'Enter') {
        event.preventDefault();
      }
    });
    
    // Escape 키로 검색 초기화
    searchInput.addEventListener('keydown', (event) => {
      if (event.key === 'Escape') {
        searchInput.value = '';
        if (typeof window.updateSearchResults === 'function') {
          window.updateSearchResults('');
        }
        searchInput.blur();
      }
    });
  }
}

// 페이지 로드 시 실행
document.addEventListener('DOMContentLoaded', initSearch);

