// autoplay.js

(function() {
  console.log('[player.js] injected, readyState=', document.readyState);

  // 매크로 모드 확인 (URL에 macro=true 파라미터가 있는지)
  const isMacroMode = new URLSearchParams(window.location.search).has('macro');
  console.log('[player.js] macro mode:', isMacroMode);

  const tryPlay = () => {
    console.log('[player.js] attempting to play video');
    const player = document.getElementById('my-video_html5_api');
    
    if (!player) {
      console.log('[player.js] video element not found, retrying...');
      return setTimeout(tryPlay, 500);
    }
    
    console.log('[player.js] video element found');

    // 매크로 모드일 때만 자동 재생 설정
    if (isMacroMode) {
      player.muted = true;
      player.setAttribute('playsinline', '');
    }

    // Try different play methods in sequence
    const playMethods = [
      // Method 1: Video.js API
      () => {
        if (window.videojs) {
          const vjs = window.videojs('my-video');
          if (vjs) {
            console.log('[player.js] trying videojs play');
            vjs.ready(() => {
              if (isMacroMode) {
                vjs.muted(true);
              }
              vjs.play().catch(() => {
                console.log('[player.js] videojs play failed, trying next method');
                tryNextMethod();
              });

              // 매크로 모드일 때만 영상 종료 시 창 닫기
              if (isMacroMode) {
                vjs.on('ended', () => {
                  console.log('[player.js] video ended, closing window');
                  window.close();
                });
              }
            });
            return true;
          }
        }
        return false;
      },
      
      // Method 2: Click play button
      () => {
        const playButtons = [
          '.vjs-big-play-button',
          '.vjs-play-control',
          'button[title*="Play"]',
          '.vjs-poster'
        ];
        
        for (const selector of playButtons) {
          const button = document.querySelector(selector);
          if (button) {
            console.log(`[player.js] clicking ${selector}`);
            button.click();

            // 매크로 모드일 때만 영상 종료 시 창 닫기
            if (isMacroMode) {
              const video = document.getElementById('my-video_html5_api');
              if (video) {
                video.addEventListener('ended', () => {
                  console.log('[player.js] video ended, closing window');
                  window.close();
                });
              }
            }
            return true;
          }
        }
        return false;
      },
      
      // Method 3: Direct HTML5 play
      () => {
        console.log('[player.js] trying HTML5 play');
        const promise = player.play()
          .then(() => {
            // 매크로 모드일 때만 영상 종료 시 창 닫기
            if (isMacroMode) {
              player.addEventListener('ended', () => {
                console.log('[player.js] video ended, closing window');
                window.close();
              });
            }
            return true;
          })
          .catch(() => false);
        return promise;
      }
    ];

    let currentMethod = 0;
    
    const tryNextMethod = () => {
      if (currentMethod < playMethods.length) {
        const success = playMethods[currentMethod]();
        if (!success) {
          currentMethod++;
          tryNextMethod();
        }
      } else {
        console.log('[player.js] all play methods failed');
      }
    };

    // 매크로 모드일 때만 자동 재생 시도
    if (isMacroMode) {
      tryNextMethod();
    }
  };

  // Initialize based on document state
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', tryPlay);
  } else {
    tryPlay();
  }
})();
