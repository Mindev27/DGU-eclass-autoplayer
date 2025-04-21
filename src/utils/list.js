chrome.runtime.onMessage.addListener((msg, sender) => {
  if (msg.type === 'PLAY_LIST') {
    const anchors = document.querySelectorAll('ul.my-course-lists li a, a[href*="/course/view.php?id="]');
    const links = [...new Set(Array.from(anchors).map(a => a.href))];
    links.forEach(url => chrome.runtime.sendMessage({type: 'OPEN_COURSE', url}));
  }
});