// 확장프로그램이 설치되거나 업데이트될 때 실행
chrome.runtime.onInstalled.addListener(() => {
  // 기본 설정 초기화
  chrome.storage.local.set({
    autoPlay: true,  // 자동 재생 여부
    currentWeek: true  // 현재 주차만 재생
  });
});

// 모든 메시지를 한 군데서 처리
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  switch (message.type) {
    case 'GET_SETTINGS':
      chrome.storage.local.get(['autoPlay', 'currentWeek'], result => {
        sendResponse(result);
      });
      return true; // 비동기 응답

    case 'OPEN_VIDEO_WINDOW':
      chrome.windows.create({
        url: message.url,
        state: 'minimized',
        focused: false
      });
      break;

    case 'CLOSE_COURSE_TAB':
      if (sender.tab?.id) {
        chrome.tabs.remove(sender.tab.id);
      }
      break;
  }
});