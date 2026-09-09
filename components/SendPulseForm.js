import { useEffect, useRef } from 'react';

const FORM_HASH = '8e740fb6bd6f42140e373377251f28979fc79dd3ae517a98e27c626406b368a4';
const FORM_NUM = '255206';
const LOADER_SRC = 'https://web.webformscr.com/apps/fc3/build/loader.js';
const MESSAGE_NAME = 'sform[mensagem]';
const MESSAGE_INPUT_CLS = 'sp-field-input-msg';
// host usado pelo loader: `//<host>/formstore/<id>.js` (o /apps/fc3/ é só do loader)
const FORMSTORE_BASE = 'https://web.webformscr.com/formstore';
const HANDLER_SRC = 'https://web.webformscr.com/apps/fc3/build/default-handler.js';

let formstoreCache = null;
let formstorePromise = null;
let handlerPromise = null;
let manualProcessing = false;

function formPresent() {
  return !!document.querySelector(`.sp-form[sp-id="${FORM_NUM}"]`);
}

function pendingFormstoreScript() {
  return document.querySelector(`script[src*="/formstore/${FORM_HASH}.js"]`);
}

async function fetchFormstore() {
  if (formstoreCache) return formstoreCache;
  if (formstorePromise) return formstorePromise;

  formstorePromise = (async () => {
    const res = await fetch(`${FORMSTORE_BASE.replace(/^https?:/, window.location.protocol)}/${FORM_HASH}.js`);
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

  // desativa o caminho do loader (JSONP já disparado fica inerte)
  window[`_jsonp_${FORM_HASH}`] = () => {};
  const pending = pendingFormstoreScript();
  if (pending && pending.parentNode) pending.parentNode.removeChild(pending);

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
  const submitLabel = variant === 'contato' ? 'Enviar' : 'Inscrever-se';

  useEffect(() => {
    const host = hostRef.current;
    if (!host) return;

    let observer;

    const applyCustomizations = () => {
      const container = host.querySelector('.sp-element-container');
      const button = host.querySelector('.sp-button');
      if (!container || !button) return;

      // remove o rodapé "Desenvolvido por SendPulse"
      host.querySelectorAll('.sp-link-wrapper').forEach((el) => el.remove());

      if (button.textContent.trim() !== submitLabel) {
        button.textContent = submitLabel;
      }

      if (!showMessage) return;
      if (container.querySelector(`.${MESSAGE_INPUT_CLS}`)) return;

      const field = document.createElement('div');
      field.className = `sp-field sp-field-full-width ${MESSAGE_INPUT_CLS}`;

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

      // o botão deve ser o último campo: mensagem entra ANTES dele
      const buttonField = container.querySelector('.sp-field.sp-button-container');
      if (buttonField) {
        container.insertBefore(field, buttonField);
      } else {
        container.appendChild(field);
      }
    };

    const waitForForm = (script, delay, onTimeout) => {
      const giveUpAt = Date.now() + delay;
      const poll = () => {
        if (formPresent()) return;
        if (Date.now() >= giveUpAt) {
          onTimeout();
          return;
        }
        setTimeout(poll, 150);
      };
      poll();
    };

    const script = document.createElement('script');
    script.src = LOADER_SRC;
    script.async = true;
    script.setAttribute('sp-form-id', FORM_HASH);
    script.onload = () => {
      observer = new MutationObserver(() => applyCustomizations());
      observer.observe(host, { childList: true, subtree: true });
      applyCustomizations();

      // O loader registra o processamento no evento load. Duas possibilidades:
      // 1) load ainda não disparou (página em hidratação): o loader VAI
      //    processar o formulário — só agimos se após o load ele não aparecer.
      // 2) load já disparou (form montado após o load, ex.: /quiz): o script
      //    do loader não será processado — fazemos fallback manual.
      const onLoadFired = () => {
        window.removeEventListener('load', onLoadFired);
        waitForForm(script, 1200, () => {
          if (!formPresent() && script.dataset.processed !== '1') {
            processManual(script).catch((err) => console.error('[SendPulseForm] falha no fallback:', err));
          }
        });
      };

      if (document.readyState === 'complete') {
        // load pode ter disparado antes do onload do script: cede uma chance
        // ao loader (JSONP) e só então faz fallback
        waitForForm(script, 1200, () => {
          if (!formPresent() && script.dataset.processed !== '1') {
            processManual(script).catch((err) => console.error('[SendPulseForm] falha no fallback:', err));
          }
        });
      } else {
        setTimeout(() => {
          if (document.readyState === 'complete') {
            waitForForm(script, 1200, () => {
              if (!formPresent() && script.dataset.processed !== '1') {
                processManual(script).catch((err) => console.error('[SendPulseForm] falha no fallback:', err));
              }
            });
          } else {
            window.addEventListener('load', onLoadFired, { once: false });
          }
        }, 300);
      }
    };
    host.appendChild(script);

    return () => {
      if (observer) observer.disconnect();
    };
  }, [showMessage, submitLabel]);

  return <div ref={hostRef} className="sendpulse-form" data-variant={variant} />;
}