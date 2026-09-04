/* ============================================================================
   SACAR EL NOMBRE DE PILA
   ----------------------------------------------------------------------------
   El colegio entrega los nombres como en sus listas oficiales: primero los
   apellidos y al final el nombre. "Del Valle Altamirano Tomás". Se guardan así
   a propósito, para que buscar a alguien en la app coincida con la lista que
   tiene el profesor en la mano.

   Para saludar hace falta lo contrario: solo el nombre. Y quedarse con la
   primera palabra saluda a Tomás como "Del".

   CÓMO SE SEPARAN LOS APELLIDOS
   Se leen dos apellidos desde el principio, y lo que sobra es el nombre. Lo
   difícil son las partículas —de, del, la, van, mac—, porque significan dos
   cosas distintas según dónde estén:

     · AL PRINCIPIO abren un apellido:  "Del Valle" Altamirano | Tomás
     · EN MEDIO lo continúan:           "Hurtado de Mendoza" Larraín | José

   Esa segunda regla es la que hace que "Rey Casas Del Valle Clemente Ramón"
   salude a Clemente y no a Del.

   Aun así hay formas que ninguna regla separa: "Aviles Ruiz Tagle Sergio" y
   "Burgos Alfaro Mateo Pablo" son idénticas por fuera, pero en la primera el
   nombre es la última palabra y en la segunda es la penúltima.

   EL CORREO DESEMPATA
   Ahí entra el segundo dato. El colegio arma los correos con el nombre por
   delante —"sergioavilesr", "mateoburgosa"—, así que nombre y correo son dos
   escrituras de la misma persona. Cuando se conoce el correo no hace falta
   adivinar: se prueba cada palabra y se elige la que el correo confirma.

   No es que el correo sea infalible; es que equivocarse en los dos a la vez,
   de la misma manera, es mucho menos probable. Si ninguno calza —un correo con
   otro formato, un apodo, una excepción— se vuelve a las partículas, que
   aciertan en el 99% por sí solas.

   HASTA DÓNDE LLEGA
   Cruzado contra los 694 alumnos del colegio:

     · con el correo    694 de 694
     · solo las reglas  688 de 694   (las seis que fallan son apellidos
                                      compuestos sin partícula, tipo "Ruiz
                                      Tagle" o "Patrón Costas")

   Quien cambie estas reglas, que vuelva a cruzar la nómina entera con los
   correos. Probar cinco casos sueltos no dice nada: la versión anterior —la
   primera palabra del nombre— parecía razonable y acertaba en CERO de 694.
   ========================================================================== */

import { normalize } from './text';

const PARTICULAS = new Set([
  'de',
  'del',
  'la',
  'las',
  'los',
  'y',
  'e',
  'da',
  'das',
  'do',
  'dos',
  'van',
  'von',
  'di',
  'della',
  'san',
  'santa',
  'mac',
  'mc',
  'le',
  'du',
  'saint',
  'st',
]);

const esParticula = (palabra: string) => PARTICULAS.has(palabra.toLowerCase());

/**
 * Solo letras sin tilde y en minúscula. Es lo que hace falta para comparar un
 * nombre con un correo: "Martínez" y "martinez" tienen que ser lo mismo, y
 * "O'Shea" tiene que poder compararse con "oshea".
 */
function comparable(valor: string): string {
  return normalize(valor).replace(/[^a-z]/g, '');
}

/**
 * El nombre de pila de alguien registrado como "Apellido Apellido Nombre".
 *
 * @param correo su correo institucional, si se conoce. Sirve para desempatar.
 *
 * Nunca devuelve vacío: si el nombre no tiene la forma esperada, devuelve lo
 * que haya. Un saludo raro es un problema; un saludo en blanco parece que la
 * aplicación se rompió.
 */
export function nombreDePila(completo: string, correo?: string): string {
  const partes = completo.trim().split(/\s+/).filter(Boolean);
  if (partes.length <= 1) return partes[0] ?? '';

  /* Primero se le pregunta al correo. Se recorren las palabras de izquierda a
     derecha y se toma la primera que el correo respalda: así, ante "Marti Del
     Rio Gerardo Vicente" con correo "gerardomartid", gana Gerardo y no
     Vicente. Se salta la primera palabra, que siempre es apellido. */
  const usuario = correo ? comparable(correo.split('@')[0]) : '';
  if (usuario) {
    for (let i = 1; i < partes.length; i += 1) {
      const candidato = comparable(partes[i]);
      if (candidato.length > 1 && usuario.startsWith(candidato)) return partes[i];
    }
  }

  /** Dónde termina el apellido que empieza en `desde`. */
  const finDelApellido = (desde: number): number => {
    let i = desde;
    // Partículas que abren: "Del" Valle, "De" Undurraga.
    while (i < partes.length && esParticula(partes[i])) i += 1;
    i += 1;
    // Partículas que continúan: Hurtado "de" Mendoza.
    // Se exige que quede algo después, para no tragarse el nombre entero.
    while (i + 1 < partes.length && esParticula(partes[i])) {
      while (i < partes.length && esParticula(partes[i])) i += 1;
      i += 1;
    }
    return i;
  };

  let corte = finDelApellido(finDelApellido(0));
  // Con un solo apellido —"Pérez Juan"— leer dos se pasaría de largo.
  if (corte >= partes.length) corte = finDelApellido(0);
  // Y si ni con uno queda nombre, se usa la última palabra antes que nada.
  if (corte >= partes.length) return partes[partes.length - 1];

  return partes[corte];
}
