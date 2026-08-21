export interface StateModel {
  id: string;
  name: string;
  uf: string;
}

export interface CityModel {
  id: string;
  name: string;
  stateId: string;
}
