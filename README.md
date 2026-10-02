# La Compagnia degli Anelli APS

Landing page statica per La Compagnia degli Anelli APS, con i colori del brand, Hanken Grotesk e Instrument Serif. La VSL orizzontale è l'elemento principale della hero; il video delle testimonianze è nella sezione «Le voci».

## Anteprima

Dalla cartella `landing`:

```sh
python3 -m http.server 8765 --bind 127.0.0.1
```

Apri http://127.0.0.1:8765/. La branch `main` continua a servire il sito pubblico tramite GitHub Pages; questa branch contiene il redesign da approvare.

## File

- `index.html`, `styles.css`, `sections.css`, `motion.css`, `motion.js`, `app.js`: pagina, stile e interazioni senza dipendenze JavaScript esterne.
- `vsl.mp4`, `vsl-poster.jpg`: VSL orizzontale in hero.
- `hero.mp4`, `voices-poster.jpg`: testimonianze nella sezione «Le voci».
- `portrait-studio.webp`, `microphone-studio.webp`: fotografie ottimizzate per il web.
- `logo-navy.png`, `logo.png`: marchio sui fondi chiaro e scuro.

La VSL parte automaticamente senza audio, come richiesto dalle regole di autoplay dei browser. Il pulsante «Attiva audio» la riavvia dall'inizio con il suono. Se l'autoplay è bloccato dalle impostazioni del dispositivo, compare «Avvia il video». I controlli nativi restano disponibili. Le animazioni SVG decorative della versione precedente sono state rimosse.

## Animazioni React Bits

Quattro effetti adattati dai sorgenti ufficiali di [React Bits](https://reactbits.dev/get-started/index), usando CSS e API native del browser per conservare la pubblicazione statica:

- **Blur Text**: il titolo della hero entra parola per parola, con una breve messa a fuoco.
- **Scroll Reveal**: sette titoli si definiscono progressivamente con lo scroll, dalla parte bassa della finestra fino a poco sopra il centro. Una volta completati restano leggibili anche risalendo.
- **Animated Content**: ingressi in sequenza per benefici, corsi e tappe del percorso; apertura e leggero zoom sulle fotografie.
- **Spotlight Card**: luce dorata che segue il puntatore sulle quattro card dei corsi; stato equivalente per il focus da tastiera.

Le entrate usano `IntersectionObserver`; lo scroll usa un listener passivo e `requestAnimationFrame` solo quando serve aggiornare i titoli. Nessun loop continuo, blocco dello scroll o dipendenza React/GSAP/Motion. Su telefono i movimenti sono più brevi, senza sfocatura nei titoli di sezione né ritardi tra le card. La VSL e i suoi controlli rimangono subito accessibili; documenti e dati fiscali non hanno ingressi ritardati.

Con `prefers-reduced-motion` o JavaScript disattivato, tutti i contenuti restano visibili. La preferenza è gestita anche se cambia a pagina aperta; un errore nell’inizializzazione ripristina la pagina statica. Crediti, riferimenti e licenza upstream sono in `THIRD_PARTY_NOTICES.md`.

Le recensioni testuali inventate presenti nella prima versione sono state rimosse. Inserire solo testimonianze autentiche e autorizzate.

## Pubblicazione

La cartella è pronta per un hosting statico, incluso Vercel: nessun comando di build, directory di pubblicazione `.`. Mantenere immagini, video, CSS e JavaScript accanto a `index.html`. I font vengono caricati da Google Fonts.

`proposte/` conserva i due studi iniziali per il confronto visivo, separati dalla landing completa.
