## Qué cambia

## Cómo se verificó

## Checklist de código (code completion)
- [ ] Sin `console.log`, `debugger` ni código comentado de depuración
- [ ] Ningún `catch` vacío ni excepción absorbida en silencio
- [ ] Sin `any`; nombres claros en lugar de comentarios
- [ ] Ninguna función supera complejidad ciclomática 10

## Checklist de pruebas (unit and functional testing)
- [ ] Cada regla nueva tiene prueba, incluidos sus casos borde
- [ ] Casos del reglamento cubiertos cuando aplica: sobrantes que suman exactamente 5, ternas incompletas, eliminación en 101
- [ ] Una jugada inválida no altera el estado ni consume el turno
- [ ] `npm run verificar` en verde en local

## Checklist de release
- [ ] El pipeline de gobernanza está en verde
- [ ] Migraciones de base de datos incluidas y aplicadas, si las hay
- [ ] Variables de entorno nuevas documentadas en el README, si las hay
- [ ] Documentación y ADR actualizados si cambió una decisión
