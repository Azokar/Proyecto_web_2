// ============================================================
// imagenes.js — Preparar fotos antes de subirlas
// ============================================================
// Las fotos del celular pesan varios MB. Antes de enviarlas se reducen a un máximo de 900 px
// de ancho y se guardan como JPEG: quedan en ~100-200 KB, cargan rápido en el catálogo y caben
// en el límite de la API (1 MB).
const ANCHO_MAXIMO = 900;
const CALIDAD_JPEG = 0.85;
const TIPOS_ACEPTADOS = ['image/jpeg', 'image/png', 'image/webp'];

export const TIPOS_ACEPTADOS_TEXTO = 'JPG, PNG o WEBP';

export async function reducir_imagen(archivo) {
  if (!TIPOS_ACEPTADOS.includes(archivo.type)) {
    throw new Error(`Formato no válido: usa ${TIPOS_ACEPTADOS_TEXTO}.`);
  }

  let mapa_de_bits;
  try {
    mapa_de_bits = await createImageBitmap(archivo);
  } catch {
    throw new Error('No se pudo leer la imagen. Prueba con otro archivo.');
  }

  const escala = Math.min(1, ANCHO_MAXIMO / mapa_de_bits.width);
  const lienzo = document.createElement('canvas');
  lienzo.width = Math.round(mapa_de_bits.width * escala);
  lienzo.height = Math.round(mapa_de_bits.height * escala);

  const contexto = lienzo.getContext('2d');
  // El JPEG no tiene transparencia: un PNG con fondo transparente quedaría negro sin este relleno
  contexto.fillStyle = '#ffffff';
  contexto.fillRect(0, 0, lienzo.width, lienzo.height);
  contexto.drawImage(mapa_de_bits, 0, 0, lienzo.width, lienzo.height);
  mapa_de_bits.close();

  const blob = await new Promise((resolver) => lienzo.toBlob(resolver, 'image/jpeg', CALIDAD_JPEG));
  if (!blob) throw new Error('No se pudo procesar la imagen.');
  return new File([blob], 'imagen.jpg', { type: 'image/jpeg' });
}
