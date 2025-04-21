// 로깅 유틸리티
const log = (message) => {
  console.log(`[Popup] ${message}`);
};

// 페이지 로드 시 설정 초기화
document.addEventListener('DOMContentLoaded', () => {
  log('팝업 페이지 로드됨');
  
  // 설정 로드
  chrome.storage.local.get(['autoPlay', 'currentWeek'], (result) => {
    log('저장된 설정 로드: ' + JSON.stringify(result));
    
    // 초기값 설정
    const settings = {
      autoPlay: result.autoPlay ?? true,
      currentWeek: result.currentWeek ?? true
    };
    log('설정 초기값 설정: ' + JSON.stringify(settings));

    // 체크박스 상태 설정
    document.getElementById('autoPlay').checked = settings.autoPlay;
    document.getElementById('currentWeek').checked = settings.currentWeek;

    // 초기값 저장
    chrome.storage.local.set(settings, () => {
      log('설정 저장 완료');
    });
  });

  // 재생 버튼 이벤트 설정
  document.getElementById('play').addEventListener('click', async () => {
    log('재생 버튼 클릭됨');
    
    const [tab] = await chrome.tabs.query({active: true, currentWindow: true});
    if (!tab) {
      log('활성 탭을 찾을 수 없음');
      return;
    }
    
    const url = tab.url || '';
    log('현재 탭 URL: ' + url);
    
    if (url.includes('/course/view.php')) {
      log('강의 페이지에서 실행 - PLAY_CURRENT 메시지 전송');
      chrome.tabs.sendMessage(tab.id, {type: 'PLAY_CURRENT'});
    } else if (url === 'https://eclass.dongguk.edu/' || url.includes('/my/')) {
      log('강의 목록 페이지에서 실행 - PLAY_LIST 메시지 전송');
      chrome.tabs.sendMessage(tab.id, {type: 'PLAY_LIST'});
    } else {
      log('잘못된 페이지에서 실행 시도');
      alert('이클래스 목록 또는 과목 페이지에서 실행해주세요.');
    }
    window.close();
  });

  // 설정 변경 이벤트 처리
  document.getElementById('autoPlay').addEventListener('change', (e) => {
    log('자동 재생 설정 변경: ' + e.target.checked);
    chrome.storage.local.set({ autoPlay: e.target.checked });
  });

  document.getElementById('currentWeek').addEventListener('change', (e) => {
    log('현재 주차 설정 변경: ' + e.target.checked);
    chrome.storage.local.set({ currentWeek: e.target.checked });
  });
});