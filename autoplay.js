// autoplay.js

(function() {
  console.log('[autoplay.js] injected (readyState=' + document.readyState + ')');

  const tryInit = () => {
    const vid = document.getElementById('my-video_html5_api');
    if (!vid) {
      setTimeout(tryInit, 500);
      return;
    }

    // 음소거+autoplay 속성 보장
    vid.muted   = true;
    vid.autoplay= true;

    // 클릭 페일백 리스트
    const targets = [
      '.vjs-big-play-button',   // 중앙 재생 버튼
      '.vjs-play-control',      // 하단 컨트롤바 토글
      'button[title*="Play"]',  // 일반 Play 버튼
      '.vjs-poster',            // 비디오 포스터
      'video#my-video_html5_api'// 비디오 태그 자체
    ];

    for (const sel of targets) {
      const el = document.querySelector(sel);
      if (el) {
        console.log(`[autoplay.js] clicking ${sel}`);
        el.click();
        return;
      }
    }

    // 마지막으로 Video.js API 강제 재생
    if (window.videojs) {
      console.log('[autoplay.js] calling videojs().play() fallback');
      const player = window.videojs('my-video');
      player.ready(() => player.play().catch(e=>{
        console.warn('vjs.play() failed:', e);
      }));
    } else {
      console.warn('[autoplay.js] no click target found');
    }
  };

  if (document.readyState === 'loading') {
    window.addEventListener('load', tryInit);
  } else {
    tryInit();
  }
})();