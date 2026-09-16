import type { MenuDelDia, MinutaCasino } from '@/core/types';

/* ============================================================================
   MINUTA DE EJEMPLO
   ----------------------------------------------------------------------------
   Solo para el modo demostración, sin servidor. Las fechas se arman sobre el
   mes actual y el siguiente, para que la pantalla del casino siempre tenga
   algo que mostrar al abrirla: una minuta de ejemplo con fechas fijas quedaría
   vacía al mes siguiente.

   Con servidor esto no se usa: la minuta real la carga el Centro de Alumnos.
   ========================================================================== */

const PLATOS: Omit<MenuDelDia, 'fecha'>[] = [
  { principal: 'Pollo arvejado con arroz', entrada: 'Ensalada chilena', alternativa: 'Guiso de lentejas', postre: 'Fruta de la estación' },
  { principal: 'Pastel de papas', entrada: 'Crema de zapallo', alternativa: 'Pastel de choclo vegetariano', postre: 'Jalea' },
  { principal: 'Porotos con riendas', entrada: 'Ensalada de repollo', postre: 'Mote con huesillo' },
  { principal: 'Carne mechada con puré', entrada: 'Ensalada de lechuga', alternativa: 'Tortilla de verduras con puré', postre: 'Leche asada' },
  { principal: 'Pescado apanado con papas cocidas', entrada: 'Sopa de verduras', alternativa: 'Hamburguesa de lentejas', postre: 'Fruta de la estación' },
  { principal: 'Tallarines con salsa boloñesa', entrada: 'Ensalada de tomate', alternativa: 'Tallarines al pesto', postre: 'Flan' },
  { principal: 'Cazuela de vacuno', alternativa: 'Cazuela de verduras', postre: 'Sémola con leche' },
];

function clave(fecha: Date): string {
  const mes = `${fecha.getMonth() + 1}`.padStart(2, '0');
  const dia = `${fecha.getDate()}`.padStart(2, '0');
  return `${fecha.getFullYear()}-${mes}-${dia}`;
}

function minutaDe(desplazamiento: number, id: string): MinutaCasino {
  const hoy = new Date();
  const inicio = new Date(hoy.getFullYear(), hoy.getMonth() + desplazamiento, 1);
  const dias: MenuDelDia[] = [];
  const cursor = new Date(inicio);
  let habil = 0;

  while (cursor.getMonth() === inicio.getMonth()) {
    const semana = cursor.getDay();
    if (semana >= 1 && semana <= 5) {
      // Un día sin servicio por mes, para ver cómo se ve un feriado.
      dias.push(
        habil === 12
          ? { fecha: clave(cursor), principal: '', sinServicio: true }
          : { fecha: clave(cursor), ...PLATOS[habil % PLATOS.length] },
      );
      habil += 1;
    }
    cursor.setDate(cursor.getDate() + 1);
  }

  const ahora = new Date().toISOString();
  return {
    id,
    mes: clave(inicio).slice(0, 7),
    dias,
    nota: 'La minuta puede cambiar sin previo aviso.',
    createdAt: ahora,
    updatedAt: ahora,
  };
}

export const seedCasino: MinutaCasino[] = [minutaDe(0, 'cas_1'), minutaDe(1, 'cas_2')];
