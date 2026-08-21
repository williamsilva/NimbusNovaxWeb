export const environment = {
  production: false,
  // 9093, não 9092 - evita colidir com o backend do NimbusFlow (projeto de origem desta cópia)
  // quando os dois rodam lado a lado na mesma máquina.
  bffBaseUrl: 'http://localhost:9093',
  apiBaseUrl: 'http://localhost:9093',
};
