// ============================================================
// useTituloPagina — Pone el nombre de la página en la pestaña
// ============================================================
// Uso:  useTituloPagina('Catálogo')  ->  pestaña: "Catálogo | EduLoan"
import { useEffect } from 'react';

export default function useTituloPagina(titulo_de_la_pagina) {
  useEffect(() => {
    document.title = `${titulo_de_la_pagina} | EduLoan`;
  }, [titulo_de_la_pagina]);
}
