/**
 * 게시글 로더
 * - 마크다운 파일 로딩 및 파싱
 * - Front Matter 처리
 * - Giscus 댓글 초기화
 */

// DOM 요소
const postTitle = document.getElementById('post-title');
const postDate = document.getElementById('post-date');
const postCategory = document.getElementById('post-category');
const postTags = document.getElementById('post-tags');
const postContent = document.getElementById('post-content');
const loadingEl = document.getElementById('loading');
const giscusContainer = document.getElementById('giscus-container');

/**
 * URL에서 파일명 추출
 */
function getFileFromURL() {
  const params = new URLSearchParams(window.location.search);
  return params.get('file');
}

/**
 * Front Matter 파싱
 */
function parseFrontMatter(content) {
  const match = content.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/);
  
  if (!match) {
    return { metadata: {}, content: content };
  }
  
  const frontMatter = match[1];
  const postContent = match[2];
  const metadata = {};
  
  // Front Matter 라인별 파싱
  const lines = frontMatter.split('\n');
  lines.forEach(line => {
    const colonIndex = line.indexOf(':');
    if (colonIndex > 0) {
      const key = line.substring(0, colonIndex).trim();
      let value = line.substring(colonIndex + 1).trim();
      
      // 따옴표 제거
      if ((value.startsWith('"') && value.endsWith('"')) ||
          (value.startsWith("'") && value.endsWith("'"))) {
        value = value.slice(1, -1);
      }
      
      // 배열 파싱 (tags)
      if (key === 'tags' && value.startsWith('[') && value.endsWith(']')) {
        try {
          value = JSON.parse(value);
        } catch {
          value = value.slice(1, -1).split(',').map(tag => 
            tag.trim().replace(/^['"]|['"]$/g, '')
          );
        }
      }
      
      metadata[key] = value;
    }
  });
  
  return { metadata, content: postContent };
}

/**
 * 날짜 포맷팅
 */
function formatDate(dateString) {
  const date = new Date(dateString);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}. ${month}. ${day}`;
}

/**
 * 마크다운을 HTML로 변환
 */
function renderMarkdown(content) {
  // marked.js 설정
  if (typeof marked !== 'undefined') {
    marked.setOptions({
      breaks: true,
      gfm: true,
      headerIds: true,
      mangle: false,
      highlight: function(code, lang) {
        if (typeof Prism !== 'undefined' && lang && Prism.languages[lang]) {
          return Prism.highlight(code, Prism.languages[lang], lang);
        }
        return code;
      }
    });
    
    return marked.parse(content);
  }
  
  // marked.js가 없으면 기본 변환
  return content
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/\n/g, '<br>');
}

/**
 * 게시글 로드 및 렌더링
 */
async function loadPost() {
  const filename = getFileFromURL();
  
  if (!filename) {
    postContent.innerHTML = '<p>게시글을 찾을 수 없습니다.</p>';
    loadingEl.style.display = 'none';
    return;
  }
  
  try {
    const response = await fetch(`pages/${filename}`);
    
    if (!response.ok) {
      throw new Error('게시글을 불러올 수 없습니다.');
    }
    
    const rawContent = await response.text();
    const { metadata, content } = parseFrontMatter(rawContent);
    
    // 메타데이터 렌더링
    const title = metadata.title || filename.replace('.md', '');
    document.title = `${title} - Bravech9287-CMYK's Blog`;
    postTitle.textContent = title;
    
    if (metadata.date) {
      postDate.textContent = formatDate(metadata.date);
    }
    
    if (metadata.category) {
      postCategory.textContent = metadata.category;
      postCategory.style.display = 'inline-block';
    } else {
      postCategory.style.display = 'none';
    }
    
    if (metadata.tags && Array.isArray(metadata.tags) && metadata.tags.length > 0) {
      postTags.innerHTML = metadata.tags
        .map(tag => `<span class="post-tag">${escapeHTML(tag)}</span>`)
        .join('');
    }
    
    // 콘텐츠 렌더링
    loadingEl.style.display = 'none';
    postContent.innerHTML = renderMarkdown(content);
    
    // Prism.js로 코드 하이라이팅 재적용
    if (typeof Prism !== 'undefined') {
      Prism.highlightAllUnder(postContent);
    }
    
    // Giscus 로드
    loadGiscus();
    
  } catch (error) {
    console.error('게시글 로딩 실패:', error);
    loadingEl.style.display = 'none';
    postContent.innerHTML = '<p>게시글을 불러오는데 실패했습니다.</p>';
  }
}

/**
 * HTML 이스케이프
 */
function escapeHTML(str) {
  if (!str) return '';
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}

/**
 * Giscus 댓글 시스템 로드
 * 
 * 설정 방법:
 * 1. https://github.com/apps/giscus 에서 앱 설치
 * 2. https://giscus.app/ko 에서 설정 정보 확인
 * 3. 아래 data-repo-id와 data-category-id를 본인 값으로 변경
 */
function loadGiscus() {
  // 이미 로드되어 있으면 스킵
  if (giscusContainer.querySelector('iframe')) {
    return;
  }
  
  const script = document.createElement('script');
  script.src = 'https://giscus.app/client.js';
  script.setAttribute('data-repo', 'Bravech9287-CMYK/Bravech9287-CMYK.github.io');
  script.setAttribute('data-repo-id', 'R_kgDOQec2DA'); // TODO: 실제 값으로 변경 필요
  script.setAttribute('data-category', 'General');
  script.setAttribute('data-category-id', '[ENTER CATEGORY ID HERE]'); // TODO: 실제 값으로 변경 필요
  script.setAttribute('data-mapping', 'pathname');
  script.setAttribute('data-strict', '0');
  script.setAttribute('data-reactions-enabled', '1');
  script.setAttribute('data-emit-metadata', '1');
  script.setAttribute('data-input-position', 'top');
  script.setAttribute('data-theme', getCurrentTheme());
  script.setAttribute('data-lang', 'ko');
  script.setAttribute('data-loading', 'lazy');
  script.crossOrigin = 'anonymous';
  script.async = true;
  
  giscusContainer.appendChild(script);
}

/**
 * 현재 테마 가져오기
 */
function getCurrentTheme() {
  const theme = document.documentElement.getAttribute('data-theme');
  return theme === 'dark' ? 'dark' : 'light';
}

/**
 * Giscus 테마 업데이트 (theme.js에서 호출)
 */
function updateGiscusTheme(theme) {
  const iframe = document.querySelector('iframe.giscus-frame');
  if (iframe) {
    iframe.contentWindow.postMessage(
      { giscus: { setConfig: { theme: theme === 'dark' ? 'dark' : 'light' } } },
      'https://giscus.app'
    );
  }
}

// 페이지 로드 시 실행
document.addEventListener('DOMContentLoaded', loadPost);

// 전역으로 함수 노출 (theme.js에서 사용)
window.updateGiscusTheme = updateGiscusTheme;

