const YM_COUNTER = 105761292;

declare global {
  interface Window {
    ym?: (...args: unknown[]) => void;
  }
}

function fromCookie(): string {
  const m = document.cookie.match(/(?:^|;\s*)_ym_uid=([^;]+)/);
  return m ? decodeURIComponent(m[1]) : '';
}

export function getYaClientId(): Promise<string> {
  return new Promise((resolve) => {
    const ym = typeof window !== 'undefined' ? window.ym : undefined;
    if (typeof ym !== 'function') return resolve(fromCookie());

    let done = false;
    const finish = (v?: string) => {
      if (!done) {
        done = true;
        resolve(v || fromCookie());
      }
    };

    try {
      ym(YM_COUNTER, 'getClientID', (id: string) => finish(String(id)));
    } catch {
      finish('');
    }
    setTimeout(() => finish(''), 600);
  });
}
