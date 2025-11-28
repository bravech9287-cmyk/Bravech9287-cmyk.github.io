/**
 * 다크/라이트 모드 토글
 * - 시스템 설정 감지
 * - 로컬 스토리지 저장
 */

// 상수
const THEME_KEY = 'theme';
const DARK_THEME = 'dark';
const LIGHT_THEME = 'light';

/**
 * 초기 테마 설정
 */
function initTheme() {
  // 저장된 테마가 있으면 적용
  const savedTheme = localStorage.getItem(THEME_KEY);
  
  if (savedTheme) {
    setTheme(savedTheme);
  } else {
    // 시스템 설정 감지
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    setTheme(prefersDark ? DARK_THEME : LIGHT_THEME);
  }
  
  // 시스템 테마 변경 감지
  window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (event) => {
    // 저장된 테마가 없을 때만 시스템 설정 따르기
    if (!localStorage.getItem(THEME_KEY)) {
      setTheme(event.matches ? DARK_THEME : LIGHT_THEME);
    }
  });
}

/**
 * 테마 설정
 */
function setTheme(theme) {
  document.documentElement.setAttribute('data-theme', theme);
  
  // Giscus 테마도 업데이트 (post-loader.js에서 정의)
  if (typeof window.updateGiscusTheme === 'function') {
    window.updateGiscusTheme(theme);
  }
}

/**
 * 테마 토글
 */
function toggleTheme() {
  const currentTheme = document.documentElement.getAttribute('data-theme');
  const newTheme = currentTheme === DARK_THEME ? LIGHT_THEME : DARK_THEME;
  
  setTheme(newTheme);
  localStorage.setItem(THEME_KEY, newTheme);
}

/**
 * 토글 버튼 이벤트 리스너 등록
 */
function initThemeToggle() {
  const themeToggle = document.getElementById('theme-toggle');
  
  if (themeToggle) {
    themeToggle.addEventListener('click', toggleTheme);
  }
}

// 즉시 테마 적용 (FOUC 방지)
initTheme();

// DOM 로드 후 이벤트 리스너 등록
document.addEventListener('DOMContentLoaded', initThemeToggle);

