/**
 * 메인 애플리케이션 로직
 * - 게시글 목록 로딩 및 렌더링
 * - 태그 필터링
 */

// 전역 상태
let allPosts = [];
let allTags = [];
let activeTag = null;

// DOM 요소
const postsList = document.getElementById('posts-list');
const tagsContainer = document.getElementById('tags-container');
const loadingEl = document.getElementById('loading');
const noPostsEl = document.getElementById('no-posts');

/**
 * 게시글 목록 로드
 */
async function loadPosts() {
  try {
    const response = await fetch('posts.json');
    if (!response.ok) {
      throw new Error('posts.json을 불러올 수 없습니다.');
    }
    allPosts = await response.json();
    
    // 태그 추출
    extractTags();
    
    // 렌더링
    renderTags();
    renderPosts(allPosts);
    
    // 로딩 숨기기
    loadingEl.style.display = 'none';
    
    // 게시글이 없으면 메시지 표시
    if (allPosts.length === 0) {
      noPostsEl.style.display = 'block';
    }
  } catch (error) {
    console.error('게시글 로딩 실패:', error);
    loadingEl.innerHTML = '<span>게시글을 불러오는데 실패했습니다.</span>';
  }
}

/**
 * 모든 게시글에서 태그 추출
 */
function extractTags() {
  const tagSet = new Set();
  allPosts.forEach(post => {
    if (post.tags && Array.isArray(post.tags)) {
      post.tags.forEach(tag => tagSet.add(tag));
    }
  });
  allTags = Array.from(tagSet).sort();
}

/**
 * 태그 필터 렌더링
 */
function renderTags() {
  if (allTags.length === 0) {
    tagsContainer.style.display = 'none';
    return;
  }
  
  // "전체" 태그 추가
  let tagsHTML = `<button class="tag ${!activeTag ? 'active' : ''}" data-tag="">전체</button>`;
  
  allTags.forEach(tag => {
    const isActive = activeTag === tag ? 'active' : '';
    tagsHTML += `<button class="tag ${isActive}" data-tag="${escapeHTML(tag)}">${escapeHTML(tag)}</button>`;
  });
  
  tagsContainer.innerHTML = tagsHTML;
  
  // 이벤트 리스너 추가
  tagsContainer.querySelectorAll('.tag').forEach(tagEl => {
    tagEl.addEventListener('click', handleTagClick);
  });
}

/**
 * 태그 클릭 핸들러
 */
function handleTagClick(event) {
  const selectedTag = event.target.dataset.tag;
  
  // 같은 태그를 클릭하면 필터 해제
  if (activeTag === selectedTag || (selectedTag === '' && !activeTag)) {
    activeTag = null;
  } else {
    activeTag = selectedTag || null;
  }
  
  // 태그 상태 업데이트
  renderTags();
  
  // 게시글 필터링
  const filteredPosts = filterPosts();
  renderPosts(filteredPosts);
}

/**
 * 게시글 필터링 (태그 + 검색)
 */
function filterPosts(searchQuery = '') {
  let filtered = allPosts;
  
  // 태그 필터
  if (activeTag) {
    filtered = filtered.filter(post => 
      post.tags && post.tags.includes(activeTag)
    );
  }
  
  // 검색 필터
  if (searchQuery) {
    const query = searchQuery.toLowerCase();
    filtered = filtered.filter(post => 
      post.title.toLowerCase().includes(query) ||
      post.excerpt.toLowerCase().includes(query) ||
      (post.tags && post.tags.some(tag => tag.toLowerCase().includes(query)))
    );
  }
  
  return filtered;
}

/**
 * 게시글 목록 렌더링
 */
function renderPosts(posts) {
  if (posts.length === 0) {
    postsList.innerHTML = '';
    noPostsEl.style.display = 'block';
    return;
  }
  
  noPostsEl.style.display = 'none';
  
  const postsHTML = posts.map(post => {
    const tagsHTML = post.tags && post.tags.length > 0
      ? `<div class="post-item-tags">
          ${post.tags.map(tag => `<span class="post-item-tag">${escapeHTML(tag)}</span>`).join('')}
        </div>`
      : '';
    
    return `
      <article class="post-item">
        <a href="post.html?file=${encodeURIComponent(post.file)}" class="post-item-link">
          <h2 class="post-item-title">${escapeHTML(post.title)}</h2>
          <div class="post-item-meta">
            <time>${formatDate(post.date)}</time>
            ${post.category ? `<span>· ${escapeHTML(post.category)}</span>` : ''}
          </div>
          <p class="post-item-excerpt">${escapeHTML(post.excerpt)}</p>
          ${tagsHTML}
        </a>
      </article>
    `;
  }).join('');
  
  postsList.innerHTML = postsHTML;
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
 * HTML 이스케이프
 */
function escapeHTML(str) {
  if (!str) return '';
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}

/**
 * 검색 결과 업데이트 (search.js에서 호출)
 */
function updateSearchResults(query) {
  const filteredPosts = filterPosts(query);
  renderPosts(filteredPosts);
}

// 페이지 로드 시 실행
document.addEventListener('DOMContentLoaded', loadPosts);

// 전역으로 함수 노출 (search.js에서 사용)
window.updateSearchResults = updateSearchResults;
window.allPosts = allPosts;

