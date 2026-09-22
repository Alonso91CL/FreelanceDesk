export interface MindicadorResponse {
  autor: string;
  fecha: string;
  indicador: string;
  unidad_medida: string;
  valor: number;
}

export interface MindicadorAPIResponse {
  dolar: MindicadorResponse;
  dolar_intercambio: MindicadorResponse;
  euro: MindicadorResponse;
  ipc: MindicadorResponse;
  uf: MindicadorResponse;
  utm: MindicadorResponse;
  imacec: MindicadorResponse;
  tpm: MindicadorResponse;
  libra_cobre: MindicadorResponse;
  tasa_desempleo: MindicadorResponse;
  bitcoin: MindicadorResponse;
}
