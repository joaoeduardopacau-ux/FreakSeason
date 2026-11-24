// Service worker do Freak: deixa o app abrir sem internet.
// - Telas: rede primeiro, com cópia guardada para usar offline.
// - Arquivos do build (/_next/static), ícones e GIFs: guardados na primeira vez que são usados.
const VERSAO = "freak-v1";
const TELAS = ["/treinos", "/fichas", "/historico", "/dieta", "/perfil"];

self.addEventListener("install", (event) => {
  event.waitUntil(
    (async () => {
      const cache = await caches.open(VERSAO);
      for (const tela of TELAS) {
        try {
          const resp = await fetch(tela, { cache: "no-cache" });
          if (!resp.ok) continue;
          const html = await resp.clone().text();
          await cache.put(tela, resp);
          // guarda também os scripts e estilos que a tela usa
          const arquivos = [...new Set(html.match(/\/_next\/static\/[^"'\s)]+/g) || [])];
          await Promise.all(arquivos.map((u) => cache.add(u).catch(() => {})));
        } catch {
          // sem rede durante a instalação: as telas entram no cache quando forem abertas
        }
      }
      await cache.addAll(["/manifest.webmanifest", "/icons/icon-192.png", "/icons/apple-touch-icon.png"]).catch(() => {});
      self.skipWaiting();
    })()
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    (async () => {
      for (const nome of await caches.keys()) if (nome !== VERSAO) await caches.delete(nome);
      await self.clients.claim();
    })()
  );
});

function guardavelParaSempre(url) {
  return url.pathname.startsWith("/_next/static/") || url.pathname.startsWith("/gifs/") || url.pathname.startsWith("/icons/");
}

self.addEventListener("fetch", (event) => {
  const req = event.request;
  if (req.method !== "GET") return;
  const url = new URL(req.url);
  if (url.origin !== self.location.origin) return;

  if (guardavelParaSempre(url)) {
    event.respondWith(
      (async () => {
        const cache = await caches.open(VERSAO);
        const salvo = await cache.match(req);
        if (salvo) return salvo;
        const resp = await fetch(req);
        if (resp.ok) cache.put(req, resp.clone());
        return resp;
      })()
    );
    return;
  }

  // telas e dados de navegação: rede primeiro, cache se estiver offline
  event.respondWith(
    (async () => {
      const cache = await caches.open(VERSAO);
      try {
        const resp = await fetch(req);
        if (resp.ok && req.mode === "navigate") cache.put(url.pathname, resp.clone());
        return resp;
      } catch (erro) {
        if (req.mode === "navigate") {
          const tela = (await cache.match(url.pathname)) || (await cache.match("/treinos"));
          if (tela) return tela;
        }
        const salvo = await cache.match(req);
        if (salvo) return salvo;
        throw erro;
      }
    })()
  );
});
