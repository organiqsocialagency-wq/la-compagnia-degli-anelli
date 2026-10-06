# La Compagnia degli Anelli APS

Landing ufficiale: https://organiqsocialagency-wq.github.io/la-compagnia-degli-anelli/

La versione Studio è la landing principale dal 6 ottobre 2026. Le precedenti landing e le proposte A/B sono state rimosse dai file del sito.

## Contenuti

- VSL orizzontale ampia in hero, autoplay senza audio con controllo per attivarlo.
- Corsi di Doppiaggio, Recitazione, Teatro e Dizione a Roma, riservati ai soci.
- Emiliano Coltorti con sette schede scorribili: due ritratti, Bucky Barnes, Pennywise, Héctor, Lex Luthor e Haku (edizione italiana 2003).
- Sezione dedicata ai provini per gli allievi selezionati, senza garanzia di impiego.
- Video testimonianze e carosello di tre reel, collegati ai contenuti originali.
- Trasparenza, documenti, 5×1000, dati APS e consiglio direttivo.
- CTA WhatsApp: +39 349 603 4131.

## File e anteprima

`index.html` è la pagina principale. `studio.css` definisce il design, `carousels.css` e `carousels.js` i caroselli, `app.js` menu e video. `motion.css` e `motion.js` gestiscono le animazioni progressive e rispettano la preferenza di movimento ridotto. Font: Hanken Grotesk e Instrument Serif.

```sh
python3 -m http.server 8765 --bind 127.0.0.1
```

Aprire http://127.0.0.1:8765/. Nessuna build o dipendenza JavaScript esterna.

`media/` contiene fotografie e copertine dei reel; provenienza e crediti in `media/SOURCES.md`. La VSL usa `vsl.mp4`; le testimonianze usano `hero.mp4`. I reel integrali si aprono sui social. Le immagini e i personaggi appartengono ai rispettivi titolari. Crediti e licenza delle animazioni adattate da React Bits in `THIRD_PARTY_NOTICES.md`.

## Pubblicazione

GitHub Pages pubblica la radice del branch `main`. La cartella è utilizzabile anche su Vercel come sito statico, senza comando di build e con directory di pubblicazione `.`.
