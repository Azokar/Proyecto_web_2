// ============================================================
// Marca — Logotipo de EduLoan
// ============================================================
// Tres lomos de libro de distinta altura: una estantería, que es lo que presta la plataforma.
export default function Marca({ tamano = 22 }) {
  return (
    <svg width={tamano} height={tamano} viewBox="0 0 22 22" fill="currentColor" aria-hidden="true">
      <rect x="2" y="6" width="4.5" height="14" rx="1" />
      <rect x="8.75" y="2" width="4.5" height="18" rx="1" />
      <rect x="15.5" y="8" width="4.5" height="12" rx="1" />
    </svg>
  );
}
