import { useEffect, useRef } from 'react';

const FORM_ID = '8e740fb6bd6f42140e373377251f28979fc79dd3ae517a98e27c626406b368a4';
const LOADER_SRC = 'https://web.webformscr.com/apps/fc3/build/loader.js';
const MESSAGE_NAME = 'sform[mensagem]';
// host usado pelo loader: `//<host>/formstore/<id>.js` (o caminho /apps/fc3/
// é do próprio loader, não do formstore)
const FORMSTORE_BASE = 'https://web.webformscr.com/formstore';
const HANDLER_SRC = 'https://web.webformscr.com/apps/fc3/build/default-handler.js';

let formstoreCache = null;
let formstorePromise = null;
let handlerPromise = null;
let manualProcessing = false;

function formstoreUrl() {
  return `${FORMSTORE_BASE.replace(/^https?:/, window.location.protocol)}/${FORM_ID}.js`;
}

function formPresent() {
  return !!document.getElementById(`sp-form-${FORM_ID}`);
}

async function fetchFormstore() {
  if (formstoreCache) return formstoreCache;
  if (formstorePromise) return formstorePromise;

  formstorePromise = (async () => {
    const res = await fetch(formstoreUrl());
    if (!res.ok) throw new Error('formstore HTTP ' + res.status);
    const text = await res.text();
    const start = text.indexOf('(');
    const end = text.lastIndexOf(')');
    if (start === -1 || end <= start) throw new Error('formstore inválido');
    const data = JSON.parse(text.slice(start + 1, end));
    if (!data || data.status !== 200 || !data.html) throw new Error('formstore sem html');
    formstoreCache = data.html;
    return data.html;
  })();

  return formstorePromise;
}

function ensureDefaultHandler() {
  if (!handlerPromise) {
    handlerPromise = (async () => {
      const src = HANDLER_SRC.replace(/^https?:/, window.location.protocol);
      if (document.querySelector(`script[src="${src}"]`)) return;
      await new Promise((resolve, reject) => {
        const s = document.createElement('script');
        s.src = src;
        s.async = true;
        s.onload = resolve;
        s.onerror = () => reject(new Error('default-handler falhou'));
        document.head.appendChild(s);
      });
    })();
  }
  return handlerPromise;
}

async function processManual(script) {
  if (manualProcessing) return;
  manualProcessing = true;

  // se o loader original já tinha disparado o JSONP do formstore,
  // ninguém deve consumi-lo (o processamento agora é nosso)
  window[`_jsonp_${FORM_ID}`] = () => {};

  try {
    const html = await fetchFormstore();
    if (!formPresent()) {
      script.insertAdjacentHTML('afterend', html);
    }
    await ensureDefaultHandler();
    if (typeof window.spFormBootstrap === 'function') {
      window.spFormBootstrap();
    } else {
      await new Promise((resolve) => setTimeout(resolve, 200));
      if (typeof window.spFormBootstrap !== 'function') {
        throw new Error('spFormBootstrap indisponível');
      }
      window.spFormBootstrap();
    }
    script.dataset.processed = '1';
  } finally {
    manualProcessing = false;
  }
}

export default function SendPulseForm({ variant = 'captura' }) {
  const hostRef = useRef(null);
  const showMessage = variant === 'contato';

  useEffect(() => {
    const host = hostRef.current;
    if (!host) return;

    let observer;

    const injectMessageField = () => {
      if (!showMessage) return;
      const container = host.querySelector('.sp-element-container');
      if (!container || container.querySelector('.sp-field-input-msg')) return;

      const field = document.createElement('div');
      field.className = 'sp-field sp-field-full-width sp-field-input-msg';

      const label = document.createElement('label');
      label.className = 'sp-control-label';
      const text = document.createElement('span');
      text.textContent = 'Mensagem';
      label.appendChild(text);

      const textarea = document.createElement('textarea');
      textarea.name = MESSAGE_NAME;
      textarea.className = 'sp-form-control sp-input-msg';
      textarea.placeholder = 'Como podemos ajudar?';
      textarea.rows = 4;
      textarea.spellcheck = false;

      field.appendChild(label);
      field.appendChild(textarea);
      container.appendChild(field);
    };

    const script = document.createElement('script');
    script.src = LOADER_SRC;
    script.async = true;
    script.setAttribute('sp-form-id', FORM_ID);
    script.onload = () => {
      observer = new MutationObserver(() => injectMessageField());
      observer.observe(host, { childList: true, subtree: true });
      injectMessageField();

      if (window.spFormLoaderAdded) {
        // loader já rodou neste contexto → forma injetada pelo React após o
        // window.load não passará pelo loader. Espera o JSONP nativo ter
        // chance de entregar, senão processa manualmente.
        setTimeout(() => {
          if (!formPresent() && script.dataset.processed !== '1') {
            processManual(script).catch((err) =>
              console.error('[SendPulseForm] falha no fallback:', err)
            );
          }
        }, 600);
      }
    };
    host.appendChild(script);

    return () => {
      if (observer) observer.disconnect();
    };
  }, [showMessage]);

  return <div ref={hostRef} className="sendpulse-form" data-variant={variant} />;
}