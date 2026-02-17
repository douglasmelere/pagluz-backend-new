// Teste de cálculo de comissão
function calculateCommission(kwhConsumption, kwhPrice) {
  // Calcula o valor base da fatura
  const invoiceValue = kwhConsumption * kwhPrice;

  // Define a porcentagem de comissão baseada no consumo
  let commissionPercentage = 0;

  if (kwhConsumption >= 1500) {
    commissionPercentage = 0.375; // 37.50%
  } else if (kwhConsumption >= 1000) {
    commissionPercentage = 0.35; // 35%
  } else if (kwhConsumption >= 600) {
    commissionPercentage = 0.30; // 30%
  } else {
    // Consumo abaixo de 600 kW/h não gera comissão
    commissionPercentage = 0;
  }

  const commission = invoiceValue * commissionPercentage;
  return Math.round(commission * 100) / 100; // Arredonda para 2 casas decimais
}

// Testes
const kwhPrice = 0.93;

console.log('=== TESTE DE COMISSIONAMENTO ===\n');

console.log('Teste 1: 800 kW/h');
console.log('Valor base: 800 × 0.93 =', 800 * kwhPrice);
console.log('Comissão (30%):', calculateCommission(800, kwhPrice));
console.log('Esperado: R$ 223,20\n');

console.log('Teste 2: 600 kW/h');
console.log('Valor base: 600 × 0.93 =', 600 * kwhPrice);
console.log('Comissão (30%):', calculateCommission(600, kwhPrice));
console.log('Esperado: R$ 167,40\n');

console.log('Teste 3: 1000 kW/h');
console.log('Valor base: 1000 × 0.93 =', 1000 * kwhPrice);
console.log('Comissão (35%):', calculateCommission(1000, kwhPrice));
console.log('Esperado: R$ 325,50\n');

console.log('Teste 4: 1500 kW/h');
console.log('Valor base: 1500 × 0.93 =', 1500 * kwhPrice);
console.log('Comissão (37.5%):', calculateCommission(1500, kwhPrice));
console.log('Esperado: R$ 523,13\n');

console.log('Teste 5: 2000 kW/h');
console.log('Valor base: 2000 × 0.93 =', 2000 * kwhPrice);
console.log('Comissão (37.5%):', calculateCommission(2000, kwhPrice));
console.log('Esperado: R$ 697,50\n');
