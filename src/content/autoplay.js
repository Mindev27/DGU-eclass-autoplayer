// autoplay.js

(function() {
  console.log('[player.js] injected, readyState=', document.readyState);

  // 매크로 모드 확인 (URL에 macro=true 파라미터가 있는지)
  const isMacroMode = new URLSearchParams(window.location.search).has('macro');
  console.log('[player.js] macro mode:', isMacroMode);

  // window.confirm() 오버라이드
  const originalConfirm = window.confirm;
  window.confirm = function(message) {
    console.log('[player.js] confirm dialog suppressed:', message);
    return true; // 항상 true 반환
  };

  const tryPlay = () => {
    console.log('[player.js] attempting to play video');
    
    // 매크로 모드가 아닌 경우 즉시 종료
    if (!isMacroMode) {
      console.log('[player.js] not in macro mode, skipping auto-play');
      return;
    }

    // 재생 버튼 찾기
    const findAndClickPlayButton = () => {
      const playButtons = [
        '.vjs-big-play-button',
        '.vjs-play-control',
        'button[title*="Play"]',
        '.vjs-poster'
      ];
      
      for (const selector of playButtons) {
        const button = document.querySelector(selector);
        if (button) {
          console.log(`[player.js] found play button: ${selector}`);
          button.click();
          return true;
        }
      }
      return false;
    };

    // 비디오 요소 찾기
    const player = document.getElementById('my-video_html5_api');
    if (player) {
      console.log('[player.js] video element found');
      player.muted = true;
      player.setAttribute('playsinline', '');
    }

    // 재생 버튼 클릭 시도
    if (!findAndClickPlayButton()) {
      console.log('[player.js] play button not found, retrying...');
      setTimeout(tryPlay, 1000); // 1초 후 재시도
    } else {
      console.log('[player.js] play button clicked successfully');
      
      // 영상 종료 시 창 닫기
      if (player) {
        player.addEventListener('ended', () => {
          console.log('[player.js] video ended, closing window');
          window.close();
        });
      }
    }
  };

  // Initialize based on document state
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', tryPlay);
  } else {
    tryPlay();
  }

  // 페이지 언로드 시 원래 confirm 함수 복원
  window.addEventListener('unload', () => {
    window.confirm = originalConfirm;
  });
})();
