// Chat panel — message rendering, typing indicator, hints

export function addMessage(role, html) {
  const msgs = document.getElementById('chatMessages');
  const div = document.createElement('div');
  div.className = `msg ${role}`;
  div.innerHTML = `
    <div class="msg-avatar">${role === 'assistant' ? 'AI' : 'ME'}</div>
    <div class="msg-bubble">${html}</div>`;
  msgs.appendChild(div);
  msgs.scrollTop = msgs.scrollHeight;
  return div;
}

export function addTyping() {
  const msgs = document.getElementById('chatMessages');
  const id = 'typing-' + Date.now();
  const div = document.createElement('div');
  div.className = 'msg assistant';
  div.id = id;
  div.innerHTML = `
    <div class="msg-avatar">AI</div>
    <div class="msg-bubble">
      <div class="typing-indicator">
        <div class="typing-dot"></div>
        <div class="typing-dot"></div>
        <div class="typing-dot"></div>
      </div>
    </div>`;
  msgs.appendChild(div);
  msgs.scrollTop = msgs.scrollHeight;
  return id;
}

export function removeTyping(id) {
  document.getElementById(id)?.remove();
}

export function removeStatusMessages() {
  document.querySelectorAll('.msg.assistant .msg-bubble').forEach(el => {
    if (el.textContent.includes('Looking up transfer partners')) el.closest('.msg').remove();
    if (el.textContent.includes('No Serper key')) el.closest('.msg').remove();
  });
}

export function autoResize(el) {
  el.style.height = 'auto';
  el.style.height = Math.min(el.scrollHeight, 100) + 'px';
}
