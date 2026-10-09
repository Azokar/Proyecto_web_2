// ============================================================
// Página: Catálogo
// ============================================================
import useTituloPagina from '../hooks/useTituloPagina';
import ItemList from '../components/ItemList';

export default function CatalogPage() {
  useTituloPagina('Catálogo');

  return (
    <section>
      <h1>Catálogo</h1>
      <ItemList />
    </section>
  );
}
