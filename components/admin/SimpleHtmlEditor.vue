<template>
  <div class="editor">
    <div class="toolbar" role="toolbar" aria-label="Форматирование">
      <!-- важно: @mousedown.prevent, чтобы не терять фокус/выделение -->
      <button type="button" @mousedown.prevent @click="cmd('bold')" :aria-pressed="state.bold" title="Жирный (Ctrl+B)">B</button>
      <button type="button" @mousedown.prevent @click="cmd('italic')" :aria-pressed="state.italic" title="Курсив (Ctrl+I)"><i>I</i></button>
      <button type="button" @mousedown.prevent @click="cmd('underline')" :aria-pressed="state.underline" title="Подчеркнутый (Ctrl+U)"><u>U</u></button>
      <span class="sep"></span>
      <button type="button" @mousedown.prevent @click="cmd('insertUnorderedList')" title="Маркированный список">• Список</button>
      <button type="button" @mousedown.prevent @click="cmd('insertOrderedList')" title="Нумерованный список">1. Список</button>
      <span class="sep"></span>
      <button type="button" @mousedown.prevent @click="createLink" title="Вставить ссылку">🔗 Ссылка</button>
      <button type="button" @mousedown.prevent @click="sanitizeNow" title="Привести в порядок / очистить">⨯ Очистить</button>
    </div>

    <div
      ref="ed"
      class="surface"
      contenteditable
      tabindex="0"
      :placeholder="placeholder"
      @input="onInput"
      @paste="onPaste"
      @keyup="handleSelectionChange"
      @mouseup="handleSelectionChange"
      @blur="sanitizeNow"
      @focus="restoreRange" 
    ></div>

    <p class="hint">Поддерживает: <strong>жирный</strong>, <em>курсив</em>, <u>подчёркнутый</u>, ссылки, списки, переносы строк.</p>
  </div>
</template>

<script setup>
const props = defineProps({
  modelValue: { type: String, default: '' },
  placeholder: { type: String, default: 'Введите текст…' }
})
const emit = defineEmits(['update:modelValue'])

const ed = ref(null)
const state = reactive({ bold: false, italic: false, underline: false })

let lastRange = null  // сохраняем последнее выделение внутри редактора

onMounted(() => {
  try { document.execCommand('styleWithCSS', false, 'false') } catch {}
  try { document.execCommand('defaultParagraphSeparator', false, 'p') } catch {}
  ed.value.innerHTML = sanitize(props.modelValue || '')
  // сохраняем выделение при первом фокусе/клике
  handleSelectionChange()
})

watch(() => props.modelValue, (val) => {
  const incoming = sanitize(val || '')
  if (incoming !== ed.value.innerHTML) ed.value.innerHTML = incoming
})

function focusEditor() {
  if (!ed.value) return
  ed.value.focus()
}

function saveRange() {
  const sel = window.getSelection()
  if (!sel || sel.rangeCount === 0) return
  // убедимся, что выделение внутри редактора
  const r = sel.getRangeAt(0)
  const c = r.commonAncestorContainer
  const host = ed.value
  if (host.contains(c instanceof Element ? c : c.parentNode)) {
    lastRange = r
  }
}
function restoreRange() {
  if (!lastRange) return
  const sel = window.getSelection()
  sel.removeAllRanges()
  sel.addRange(lastRange)
}

function handleSelectionChange() {
  saveRange()
  updateState()
}

function onInput () {
  saveRange()
  const html = normalize(ed.value.innerHTML)
  emit('update:modelValue', html)
}

function onPaste (e) {
  e.preventDefault()
  // вставляем как текст, чтобы не тащить стили
  const text = (e.clipboardData || window.clipboardData).getData('text')
  focusEditor(); restoreRange()
  document.execCommand('insertText', false, text)
  onInput()
}

function cmd (command) {
  focusEditor(); restoreRange()
  document.execCommand(command, false)
  onInput()
  updateState()
}

function createLink () {
  const url = prompt('Введите URL (https://, /путь, #якорь, tel:, mailto:)', 'https://')
  if (!url) return
  focusEditor(); restoreRange()
  if (window.getSelection && window.getSelection().isCollapsed) {
    const label = prompt('Текст ссылки', 'Ссылка')
    if (!label) return
    document.execCommand('insertHTML', false, `<a href="${escapeAttr(url)}" rel="noopener">${escapeHtml(label)}</a>`)
  } else {
    document.execCommand('createLink', false, url)
  }
  onInput()
}

function sanitizeNow () {
  const clean = sanitize(ed.value.innerHTML)
  ed.value.innerHTML = clean
  emit('update:modelValue', clean)
  handleSelectionChange()
}

function updateState () {
  state.bold = document.queryCommandState?.('bold') || false
  state.italic = document.queryCommandState?.('italic') || false
  state.underline = document.queryCommandState?.('underline') || false
}

/* ---------- нормализация + санитизация ---------- */
function normalize (html) {
  if (!html) return ''
  const div = document.createElement('div')
  div.innerHTML = html

  const walk = (node) => {
    if (node.nodeType !== 1) return
    const el = node

    if (el.tagName === 'DIV') {
      const p = document.createElement('p')
      while (el.firstChild) p.appendChild(el.firstChild)
      el.replaceWith(p); walk(p); return
    }

    if (el.tagName === 'SPAN' && el.getAttribute('style')) {
      const styles = el.getAttribute('style').toLowerCase()
      let wrapper = document.createDocumentFragment()
      let current = wrapper
      const wrapTag = (tag) => { const w = document.createElement(tag); current.appendChild(w); current = w }

      if (/font-weight\s*:\s*(bold|[6-9]00|bolder)/.test(styles)) wrapTag('b')
      if (/font-style\s*:\s*italic/.test(styles)) wrapTag('i')
      if (/text-decoration[^;]*underline/.test(styles)) wrapTag('u')

      if (wrapper.childNodes.length) {
        while (el.firstChild) current.appendChild(el.firstChild)
        el.replaceWith(wrapper); return
      } else {
        el.removeAttribute('style')
      }
    }
    ;[...el.childNodes].forEach(walk)
  }
  ;[...div.childNodes].forEach(walk)
  return div.innerHTML
}

function sanitize (html) {
  if (!html) return ''
  html = normalize(html)
    .replace(/<script[\s\S]*?>[\s\S]*?<\/script>/gi, '')
    .replace(/<style[\s\S]*?>[\s\S]*?<\/style>/gi, '')
    .replace(/<!--[\s\S]*?-->/g, '')

  const allowed = new Set(['B','STRONG','I','EM','U','A','BR','P','UL','OL','LI'])
  const div = document.createElement('div'); div.innerHTML = html
  const walk = (node) => {
    if (node.nodeType === 1) {
      const el = node
      if (!allowed.has(el.tagName)) {
        const frag = document.createDocumentFragment()
        while (el.firstChild) frag.appendChild(el.firstChild)
        el.replaceWith(frag); return
      }
      for (const name of [...el.getAttributeNames()]) {
        if (el.tagName === 'A' && (name === 'href' || name === 'target' || name === 'rel' || name === 'class')) continue
        el.removeAttribute(name)
      }
      if (el.tagName === 'A') {
        const href = el.getAttribute('href') || ''
        const ok = href.startsWith('#') || href.startsWith('/') ||
                   /^https?:/i.test(href) || /^mailto:/i.test(href) || /^tel:/i.test(href)
        if (!ok) el.removeAttribute('href')
        el.setAttribute('rel', 'noopener')
      }
      ;[...el.childNodes].forEach(walk)
    }
  }
  ;[...div.childNodes].forEach(walk)
  return div.innerHTML
}

function escapeHtml (s) {
  return s.replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]))
}
function escapeAttr (s) {
  return escapeHtml(s).replace(/"/g, '&quot;')
}
</script>

<style scoped>
.editor{ display:grid; gap:10px; }
.toolbar{
  display:flex; flex-wrap:wrap; gap:8px; align-items:center;
  background:#151b30; border:1px solid #2a2f3a; padding:8px; border-radius:10px; color:#e7eaf3;
}
.toolbar button{
  height:34px; padding:0 10px; border-radius:8px; border:1px solid #2a2f3a;
  background:#0f1220; color:#e7eaf3; cursor:pointer; font-weight:600;
}
.toolbar button[aria-pressed="true"]{ outline:2px solid rgba(47,107,255,.35); }
.toolbar .sep{ width:1px; height:22px; background:#2a2f3a; margin:0 4px; }
.surface{
  min-height: 180px; max-height: 420px; overflow:auto;
  padding:12px; border:1px solid #2a2f3a; border-radius:12px;
  background:#0f1220; color:#e7eaf3; line-height:1.5;
}
.surface:empty:before{ content: attr(placeholder); color:#7f8696; pointer-events:none; }
.surface a{ color:#7fb3ff; text-decoration: underline; }
.hint{ color:#9aa3b2; font-size:12px; }
</style>
