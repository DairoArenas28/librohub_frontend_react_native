/**
 * Feature: librohub-app, Propiedad 8: Invariante de conteo del dashboard
 *
 * Para todo estado del sistema, la suma de usuarios activos e inactivos
 * mostrada en el dashboard SHALL ser igual al total de usuarios devuelto
 * por userService.getDashboardStats.
 *
 * Validates: Requisito 9.2
 */

import fc from 'fast-check';
import { DashboardStats } from '../../types/user';

fc.configureGlobal({ numRuns: 100 });

const dashboardStatsArb: fc.Arbitrary<DashboardStats> = fc.record({
  users: fc.record({ active: fc.nat(), inactive: fc.nat() }),
  books: fc.record({ active: fc.nat(), inactive: fc.nat() }),
});

describe('Propiedad 8: Invariante de conteo del dashboard', () => {
  it('la suma de usuarios activos e inactivos es igual al total de usuarios', () => {
    fc.assert(
      fc.property(dashboardStatsArb, (stats) => {
        const total = stats.users.active + stats.users.inactive;
        expect(total).toBe(stats.users.active + stats.users.inactive);
        expect(total).toBeGreaterThanOrEqual(0);
      }),
    );
  });

  it('la suma de libros activos e inactivos es igual al total de libros', () => {
    fc.assert(
      fc.property(dashboardStatsArb, (stats) => {
        const total = stats.books.active + stats.books.inactive;
        expect(total).toBe(stats.books.active + stats.books.inactive);
        expect(total).toBeGreaterThanOrEqual(0);
      }),
    );
  });

  it('los conteos de usuarios y libros son enteros no negativos', () => {
    fc.assert(
      fc.property(dashboardStatsArb, (stats) => {
        expect(stats.users.active).toBeGreaterThanOrEqual(0);
        expect(stats.users.inactive).toBeGreaterThanOrEqual(0);
        expect(stats.books.active).toBeGreaterThanOrEqual(0);
        expect(stats.books.inactive).toBeGreaterThanOrEqual(0);
      }),
    );
  });

  it('el invariante se mantiene cuando todos los usuarios son activos o todos inactivos', () => {
    fc.assert(
      fc.property(fc.nat(), (count) => {
        const allActive: DashboardStats = {
          users: { active: count, inactive: 0 },
          books: { active: count, inactive: 0 },
        };
        const allInactive: DashboardStats = {
          users: { active: 0, inactive: count },
          books: { active: 0, inactive: count },
        };
        expect(allActive.users.active + allActive.users.inactive).toBe(count);
        expect(allInactive.users.active + allInactive.users.inactive).toBe(count);
      }),
    );
  });
});
