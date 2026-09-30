# La Compagnia degli Anelli APS

Landing page statica per La Compagnia degli Anelli APS, con i colori del brand, Hanken Grotesk e Instrument Serif. La VSL orizzontale è l'elemento principale della hero; il video delle testimonianze è nella sezione «Le voci».

## Anteprima

Dalla cartella `landing`:

```sh
python3 -m http.server 8765 --bind 127.0.0.1
```

Apri http://127.0.0.1:8765/. La branch `main` continua a servire il sito pubblico tramite GitHub Pages; questa branch contiene il redesign da approvare.

## File

- `index.html`, `styles.css`, `sections.css`, `motion.css`, `app.js`: pagina, stile e interazioni senza dipendenze JavaScript esterne.
- `vsl.mp4`, `vsl-poster.jpg`: VSL orizzontale in hero.
- `hero.mp4`, `voices-poster.jpg`: testimonianze nella sezione «Le voci».
- `portrait-studio.webp`, `microphone-studio.webp`: fotografie ottimizzate per il web.
- `logo-navy.png`, `logo.png`: marchio sui fondi chiaro e scuro.

La VSL parte automaticamente senza audio, come richiesto dalle regole di autoplay dei browser. Il pulsante «Attiva audio» la riavvia dall'inizio con il suono. Se l'autoplay è bloccato dalle impostazioni del dispositivo, compare «Avvia il video». I controlli nativi restano disponibili. Le animazioni SVG decorative della versione precedente sono state rimosse.

Alcuni titoli compaiono parola per parola quando entrano nella finestra; card e fotografie hanno un ingresso leggero. Le animazioni usano `IntersectionObserver` una sola volta, senza eventi di scroll né librerie. Con `prefers-reduced-motion` o JavaScript disattivato, tutti i contenuti restano subito visibili.

Le recensioni testuali inventate presenti nella prima versione sono state rimosse. Inserire solo testimonianze autentiche e autorizzate.

## Pubblicazione

La cartella è pronta per un hosting statico, incluso Vercel: nessun comando di build, directory di pubblicazione `.`. Mantenere immagini, video, CSS e JavaScript accanto a `index.html`. I font vengono caricati da Google Fonts.

`proposte/` conserva i due studi iniziali per il confronto visivo, separati dalla landing completa.
