import { useEffect, useRef } from 'react';

const FORM_ID = '8e740fb6bd6f42140e373377251f28979fc79dd3ae517a98e27c626406b368a4';
const LOADER_SRC = 'https://web.webformscr.com/apps/fc3/build/loader.js';
const MESSAGE_NAME = 'sform[mensagem]';

export default function SendPulseForm({ variant = 'captura' }) {
  const hostRef = useRef(null);
  const showMessage = variant === 'contato';

  useEffect(() => {
    const host = hostRef.current;
    if (!host) return;

    let observer;
    let retryTimer;

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

    const ensureBootstrap = () => {
      if (typeof window.spFormBootstrap === 'function') {
        window.spFormBootstrap();
        return;
      }
      retryTimer = setTimeout(ensureBootstrap, 300);
    };

    const script = document.createElement('script');
    script.src = LOADER_SRC;
    script.async = true;
    script.setAttribute('sp-form-id', FORM_ID);
    script.onload = () => {
      observer = new MutationObserver(() => injectMessageField());
      observer.observe(host, { childList: true, subtree: true });
      injectMessageField();

      if (document.readyState === 'complete') {
        setTimeout(ensureBootstrap, 300);
      }
    };
    host.appendChild(script);

    return () => {
      if (observer) observer.disconnect();
      clearTimeout(retryTimer);
    };
  }, [showMessage]);

  return <div ref={hostRef} className="sendpulse-form" data-variant={variant} />;
}