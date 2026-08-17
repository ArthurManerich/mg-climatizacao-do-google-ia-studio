export function createReadError(resource: string): Error {
  return new Error(`Não foi possível carregar ${resource}. Tente novamente.`);
}
