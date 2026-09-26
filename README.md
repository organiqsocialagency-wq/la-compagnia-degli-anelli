# La Compagnia degli Anelli APS

Landing page statica originale per la Compagnia degli Anelli APS, nella direzione visiva «In sala» approvata dal cliente: fotografia immersiva, blu notte e oro, Hanken Grotesk e Instrument Serif (ripresi dai file della landing originale).

## Anteprima

Dalla cartella del progetto:

```sh
python3 -m http.server 8765
```

Apri http://localhost:8765. La branch `main` continua a servire il sito pubblico tramite GitHub Pages; questa branch contiene la proposta di redesign.

## File

- `index.html`, `styles.css`, `sections.css`, `app.js`: pagina e interazioni senza dipendenze JavaScript esterne.
- `vsl.mp4`, `vsl-poster.jpg`: VSL nella hero.
- `hero.mp4`, `voices-poster.jpg`: video della Compagnia nella sezione «Le voci».
- `portrait-studio.webp`, `microphone-studio.webp`: foto originali del progetto ottimizzate per il web.
- `logo-navy.png`, `logo.png`: marchio sui fondi chiaro e scuro.

Le recensioni testuali inventate presenti nella prima versione sono state rimosse. Inserire solo testimonianze autentiche e autorizzate.

## Movimento e accessibilità

Onde sonore, icone dei percorsi, una sala di doppiaggio disegnata in SVG, anelli della comunità e documenti si compongono mentre si scorre. Le animazioni usano lo scroll nativo, IntersectionObserver e un singolo requestAnimationFrame per aggiornamento. Vengono aggiornate solo le illustrazioni vicine alla finestra, senza cicli continui né librerie esterne.

La preferenza `prefers-reduced-motion` disattiva il movimento e mostra le illustrazioni complete; contenuti e SVG restano disponibili anche senza JavaScript. Il video della hero si apre in un dialogo accessibile, con comandi nativi e chiusura tramite Escape. La sua anteprima è verticale, mentre la riproduzione conserva il formato originale.

## Pubblicazione

La cartella è pronta per un hosting statico, incluso Vercel: nessun comando di build, directory di pubblicazione `.`. Mantenere immagini, video, CSS e JavaScript accanto a `index.html`. I font vengono caricati da Google Fonts.

`proposte/` conserva i due studi iniziali per il confronto visivo, separati dalla landing completa.

## Verifiche

- Layout a 375, 768 e 1280 px, senza overflow orizzontale.
- Caricamento immagini, font, VSL e riferimenti locali.
- Avanzamento dei tracciati SVG durante lo scroll.
- Menu mobile, dialogo video e copia del codice fiscale.
- Collegamenti WhatsApp a +39 349 603 4131, documenti pubblici, 5×1000 e dati APS nel footer.
