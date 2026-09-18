export const environment = {
  production: false,
  // 9093, não 9092 - evita colidir com o backend do NimbusFlow (projeto de origem desta cópia)
  // quando os dois rodam lado a lado na mesma máquina.
  bffBaseUrl: 'http://localhost:9093',
  apiBaseUrl: 'http://localhost:9093',
  // NimbusCoreWeb roda em ng serve na mesma porta padrão (4200) - pra testar o link de
  // Segurança > Usuários/Grupos de verdade em dev, suba este app noutra porta
  // (ng serve --port 4201) enquanto o NimbusCoreWeb ocupa a 4200.
  nimbusAuthWebUrl: 'http://localhost:4200',
};
