chrome.runtime.onMessage.addListener((msg, sender) => {
  if (msg.type === 'OPEN_COURSE') {
    chrome.tabs.create({url: msg.url, active: false});
  }
  if (msg.type === 'OPEN_VIDEOS') {
    msg.links.forEach((u, i) => chrome.tabs.create({url: u + (u.includes('?')?'&':'?') + 'autoplay=1', active: i===0}));
  }
});