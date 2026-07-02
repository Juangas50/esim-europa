#!/usr/bin/env node

const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

const testModules = [
  { name: 'B2C', file: 'b2c.spec.ts', tests: 5 },
  { name: 'B2B', file: 'b2b.spec.ts', tests: 5 },
  { name: 'Admin', file: 'admin.spec.ts', tests: 7 },
  { name: 'Responsivo', file: 'responsive.spec.ts', tests: 3 },
  { name: 'Performance', file: 'performance.spec.ts', tests: 3 },
  { name: 'Seguridad', file: 'security.spec.ts', tests: 5 },
  { name: 'Edge Cases', file: 'edge-cases.spec.ts', tests: 3 },
];

console.log('\n╔════════════════════════════════════════════════════════╗');
console.log('║        QA TESTING SUITE - RUTA34 TELECOM              ║');
console.log('║        31 Test Cases Automatizados                    ║');
console.log('╚════════════════════════════════════════════════════════╝\n');

const startTime = Date.now();
let passedTests = 0;
let failedTests = 0;

async function runTests() {
  console.log('📋 MÓDULOS A EJECUTAR:\n');

  testModules.forEach((mod, idx) => {
    console.log(`  ${idx + 1}. ${mod.name.padEnd(20)} - ${mod.tests} test cases`);
  });

  console.log('\n' + '='.repeat(60) + '\n');

  for (const module of testModules) {
    console.log(`\n▶ Ejecutando: ${module.name}`);
    console.log('-'.repeat(40));

    await new Promise((resolve) => {
      const child = spawn('npx', ['playwright', 'test', `tests/qa/${module.file}`, '--reporter=list'], {
        stdio: 'inherit',
        cwd: path.join(__dirname, '..'),
      });

      child.on('close', (code) => {
        if (code === 0) {
          passedTests += module.tests;
          console.log(`✅ ${module.name}: PASADO (${module.tests}/${module.tests})`);
        } else {
          failedTests += module.tests;
          console.log(`❌ ${module.name}: FALLÓ`);
        }
        resolve();
      });
    });
  }

  const endTime = Date.now();
  const duration = ((endTime - startTime) / 1000).toFixed(2);

  console.log('\n' + '='.repeat(60) + '\n');
  console.log('📊 RESUMEN FINAL');
  console.log('-'.repeat(40));
  console.log(`✅ Tests Pasados:  ${passedTests}`);
  console.log(`❌ Tests Fallidos: ${failedTests}`);
  console.log(`⏱️  Duración:       ${duration}s`);
  console.log('-'.repeat(40));

  const totalTests = passedTests + failedTests;
  const percentage = totalTests > 0 ? ((passedTests / totalTests) * 100).toFixed(0) : 0;

  console.log(`\n📈 Resultado: ${percentage}% (${passedTests}/${totalTests})\n`);

  if (failedTests === 0) {
    console.log('🎉 ¡TODOS LOS TESTS PASARON! ¡Listo para producción!\n');
  } else {
    console.log(`⚠️  ${failedTests} tests fallaron. Revisa los logs.\n`);
  }

  console.log('💡 Para ver el reporte detallado, ejecuta:');
  console.log('   npm run test:qa:report\n');
}

runTests().catch(console.error);
