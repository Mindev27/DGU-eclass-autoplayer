// 로깅 유틸리티
const log = (message) => {
  console.log(`[Content] ${message}`);
};

// 현재 페이지가 강의 목록 페이지인지 확인
const isCourseListPage = () => {
  const url = window.location.href;
  log(`현재 URL: ${url}`);
  
  const isMainPage = url === 'https://eclass.dongguk.edu/' || 
                    url === 'https://eclass.dongguk.edu/index.php' ||
                    url.startsWith('https://eclass.dongguk.edu/?');
  
  log(`페이지 타입 확인: ${isMainPage ? '강의 목록 페이지' : '다른 페이지'}`);
  return isMainPage;
};

// 현재 페이지가 강의 상세 페이지인지 확인
const isCoursePage = () => {
  const url = window.location.href;
  const result = url.includes('/course/view.php');
  log(`페이지 타입 확인: ${result ? '강의 상세 페이지' : '다른 페이지'}`);
  return result;
};

// 강의 목록 페이지에서 모든 강의 링크 찾기
const findCourseLinks = () => {
  log('강의 링크 찾기 시작');
  
  // 강의 박스 요소 찾기
  const courseBoxes = document.querySelectorAll('.course-box');
  log(`찾은 강의 박스 수: ${courseBoxes.length}`);
  
  // DOM 구조 디버깅을 위한 로그
  log('=== 페이지 내 모든 강의 링크 분석 ===');
  
  const courseDetails = Array.from(courseBoxes).map((box, index) => {
    const link = box.querySelector('a[href*="/course/view.php"]');
    if (link) {
      const href = link.href;
      const courseName = link.textContent.trim();
      try {
        const url = new URL(href);
        const id = url.searchParams.get('id');
        const fullUrl = id ? `https://eclass.dongguk.edu/course/view.php?id=${id}&macro=true` : null;
        
        const courseInfo = {
          index: index + 1,
          name: courseName,
          url: fullUrl,
          originalHref: href,
          id: id
        };
        
        log(`
=== 강의 #${index + 1} 상세 정보 ===
강의명: ${courseName}
강의 ID: ${id}
원본 링크: ${href}
변환된 URL: ${fullUrl}
------------------------`);
        
        return courseInfo;
      } catch (error) {
        log(`URL 파싱 에러: ${error.message}`);
        return null;
      }
    }
    return null;
  }).filter(info => info !== null);
  
  log(`
=== 전체 강의 목록 요약 ===
총 강의 수: ${courseDetails.length}
강의 목록:
${courseDetails.map(course => `${course.index}. ${course.name}`).join('\n')}
========================`);
  
  return courseDetails.map(course => course.url);
};

// DOM이 완전히 로드될 때까지 대기하는 함수
const waitForElement = (selector, maxAttempts = 5) => {
  return new Promise(resolve => {
    let attempts = 0;
    const interval = setInterval(() => {
      attempts++;
      console.log(`attempts ${attempts}`);
      const el = document.querySelector(selector);
      if (el || attempts >= maxAttempts) {
        clearInterval(interval);
        resolve(el || null);
      }
    }, 500);
  });
};

// 매크로 모드 확인 함수
const isMacroMode = () => {
  return new URLSearchParams(window.location.search).has('macro');
};

// 현재 주차의 동영상 요소 찾기
const findCurrentWeekVideos = () => {
  // section main 클래스를 가진 li 태그 찾기
  const mainSections = document.querySelectorAll('li.section.main');
  
  for (const section of mainSections) {
    if (section.style.display !== 'none') {
      // 현재 섹션에서 동영상 모듈 찾기
      const videoModules = section.querySelectorAll('.activity.vod.modtype_vod');
      if (videoModules.length > 0) {
        log(`현재 주차에서 ${videoModules.length}개의 동영상 발견`);
        
        // 모든 동영상 모듈의 정보 수집
        const videos = Array.from(videoModules).map((module, index) => {
          const moduleId = module.id.replace('module-', '');
          const videoName = module.querySelector('.instancename')?.textContent.trim() || '이름 없는 동영상';
          const videoUrl = `https://eclass.dongguk.edu/mod/vod/viewer.php?id=${moduleId}&macro=true#play=${moduleId}`;
          
          log(`- 동영상 ${index + 1}: ${videoName} (ID: ${moduleId})`);
          log(`  URL: ${videoUrl}`);
          
          return {
            url: videoUrl,
            name: videoName,
            id: moduleId
          };
        });
        
        return videos;
      }
    }
  }
  
  return [];
};

// 모든 주차의 동영상 요소 찾기
const findAllVideos = () => {
  log('전체 주차 동영상 찾기 시작');
  const videos = Array.from(document.querySelectorAll('a')).filter(link => {
    return link.href && link.href.includes('vod/view.php');
  });
  
  log(`전체 주차에서 찾은 동영상 수: ${videos.length}`);
  return videos;
};

// 현재 처리 중인 강의 인덱스와 강의 목록 저장
let currentCourseIndex = 0;
let courseList = [];

// 다음 강의 페이지 처리
const processNextCourse = () => {
  if (currentCourseIndex >= courseList.length) {
    log('모든 강의 처리 완료');
    return;
  }

  const courseUrl = courseList[currentCourseIndex];
  log(`${currentCourseIndex + 1}번째 강의 처리 중`);
  
  // 새 탭에서 강의 페이지 열기
  const newTab = window.open(courseUrl, '_blank');
  
  // 새 탭의 로드 완료 대기
  newTab.addEventListener('load', () => {
    try {
      // 동영상 정보 찾기
      const videos = findCurrentWeekVideos.call(newTab);
      
      if (videos && videos.length > 0) {
        log('\n=== 발견된 동영상 URL 목록 ===');
        videos.forEach((video, index) => {
          log(`${index + 1}. ${video.name}`);
          log(`   URL: ${video.url}\n`);
        });
        
        // 첫 번째 동영상 페이지 열기
        window.open(videos[0].url, '_blank');
      }
      
      // 다음 강의로 이동
      currentCourseIndex++;
      setTimeout(processNextCourse, 1000);
      
    } catch (error) {
      log(`오류 발생: ${error.message}`);
      currentCourseIndex++;
      setTimeout(processNextCourse, 1000);
    }
  });
};

// 강의 목록 페이지에서 모든 강의 순차 처리
const handlePlayList = () => {
  if (!isCourseListPage()) {
    return;
  }
  
  courseList = findCourseLinks();
  if (courseList.length > 0) {
    log(`총 ${courseList.length}개의 강의 처리 시작`);
    currentCourseIndex = 0;
    processNextCourse();
  }
};

// Start 버튼 생성
const createStartButton = () => {
  // 강의 목록 페이지에서만 버튼 생성
  if (!isCourseListPage()) {
    return;
  }

  const button = document.createElement('button');
  button.textContent = '강의 페이지 열기';
  button.style.cssText = `
    position: fixed;
    bottom: 20px;
    right: 20px;
    padding: 10px 20px;
    background-color: #1a73e8;
    color: white;
    border: none;
    border-radius: 5px;
    cursor: pointer;
    z-index: 9999;
  `;
  
  button.addEventListener('click', () => {
    handlePlayList();
  });

  document.body.appendChild(button);
};

// 페이지 로드 완료 시 실행
window.addEventListener('load', async () => {
  log('페이지 로드 완료');
  
  if (isCourseListPage()) {
    // 리스트 페이지인 경우 Start 버튼 생성
    log('강의 목록 페이지 감지');
    createStartButton();
  } else if (window.location.href.includes('/course/view.php') && isMacroMode()) {
    // 강의 페이지이고 매크로 모드인 경우에만 동영상 찾기 시작
    log('매크로 모드의 강의 페이지 감지');
    
    // DOM이 완전히 로드될 때까지 대기
    log('DOM 로드 대기 중...');
    const mainContent = await waitForElement('.course-content');
    if (!mainContent) {
      log('강의 컨텐츠를 찾을 수 없음');
      // 매크로 모드일 때만 탭 닫기
      if (isMacroMode()) {
        chrome.runtime.sendMessage({ type: 'CLOSE_COURSE_TAB' });
      }
      return;
    }
    
    // 현재 표시된 주차 찾기
    const visibleSection = await waitForElement('li.section.main[style=""]');
    if (!visibleSection) {
      log('현재 주차를 찾을 수 없음');
      // 매크로 모드일 때만 탭 닫기
      if (isMacroMode()) {
        chrome.runtime.sendMessage({ type: 'CLOSE_COURSE_TAB' });
      }
      return;
    }
    
    // 동영상 모듈 찾기
    const videoModules = visibleSection.querySelectorAll('.activity.vod.modtype_vod');
    if (videoModules.length === 0) {
      log('현재 주차에서 동영상을 찾을 수 없음');
      // 매크로 모드일 때만 탭 닫기
      if (isMacroMode()) {
        chrome.runtime.sendMessage({ type: 'CLOSE_COURSE_TAB' });
      }
      return;
    }
    
    log(`현재 주차에서 ${videoModules.length}개의 동영상 발견`);
    
    // 각 동영상 모듈에 대한 정보 출력
    videoModules.forEach((module, index) => {
      const moduleId = module.id.replace('module-', '');
      const videoUrl = `https://eclass.dongguk.edu/mod/vod/viewer.php?id=${moduleId}&macro=true#play=${moduleId}`;
      
      chrome.runtime.sendMessage({ type: 'OPEN_VIDEO_WINDOW', url: videoUrl });
    });

    // 매크로 모드일 때만 탭 닫기
    if (isMacroMode()) {
      chrome.runtime.sendMessage({ type: 'CLOSE_COURSE_TAB' });
    }
  }
});

// 메시지 리스너 등록
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  log(`메시지 수신: ${JSON.stringify(message)}`);
  switch (message.type) {
    case 'PLAY_CURRENT':
      log('현재 페이지 재생 요청 처리');
      handleVideoPlay();
      break;
    case 'PLAY_LIST':
      log('강의 목록 처리 요청 처리');
      handlePlayList();
      break;
  }
});

// 동영상 재생 처리
const handleVideoPlay = async () => {
  log('동영상 재생 처리 시작');
  
  const videos = await findCurrentWeekVideos();
  
  if (videos.length > 0) {
    log(`현재 주차 동영상 ${videos.length}개 발견`);
    // 첫 번째 동영상 재생
    log('첫 번째 동영상 재생 시도');
    videos[0].click();
  } else {
    log('현재 주차에 재생할 동영상을 찾을 수 없음');
  }
};