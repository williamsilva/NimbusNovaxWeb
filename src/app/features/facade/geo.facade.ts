import { Injectable, inject, signal } from '@angular/core';

import { finalize } from 'rxjs';

import { GeoApiService } from '@features/service/geo.api.service';
import { StateModel, CityModel } from '@models/geo.models';

/** Estados/cidades - dado de referência pro seletor de Endereço da tela de Agentes. Cache simples
 *  em memória (estados carregam uma vez; cidades por UF ficam num Map, sem invalidação - dado de
 *  referência praticamente estático). */
@Injectable({ providedIn: 'root' })
export class GeoFacade {
  private readonly api = inject(GeoApiService);

  private readonly _states = signal<StateModel[]>([]);
  private readonly _statesLoading = signal(false);
  private readonly _statesLoadedOnce = signal(false);
  private readonly _citiesByState = signal<Map<string, CityModel[]>>(new Map());
  private readonly _citiesLoadingFor = signal<Set<string>>(new Set());

  readonly states = this._states.asReadonly();
  readonly statesLoading = this._statesLoading.asReadonly();

  loadStates(force = false): void {
    if (this._statesLoading()) return;
    if (!force && this._statesLoadedOnce()) return;

    this._statesLoading.set(true);

    this.api
      .getStates()
      .pipe(
        finalize(() => {
          this._statesLoading.set(false);
          this._statesLoadedOnce.set(true);
        }),
      )
      .subscribe({
        next: (list) => this._states.set(list ?? []),
        error: () => this._states.set([]),
      });
  }

  citiesFor(stateId: string | null | undefined): CityModel[] {
    if (!stateId) return [];
    return this._citiesByState().get(stateId) ?? [];
  }

  isLoadingCitiesFor(stateId: string | null | undefined): boolean {
    if (!stateId) return false;
    return this._citiesLoadingFor().has(stateId);
  }

  loadCitiesForState(stateId: string | null | undefined): void {
    if (!stateId) return;
    if (this._citiesByState().has(stateId)) return;
    if (this._citiesLoadingFor().has(stateId)) return;

    const loading = new Set(this._citiesLoadingFor());
    loading.add(stateId);
    this._citiesLoadingFor.set(loading);

    this.api.getCitiesByState(stateId).subscribe({
      next: (list) => {
        const map = new Map(this._citiesByState());
        map.set(stateId, list ?? []);
        this._citiesByState.set(map);

        const stillLoading = new Set(this._citiesLoadingFor());
        stillLoading.delete(stateId);
        this._citiesLoadingFor.set(stillLoading);
      },
      error: () => {
        const map = new Map(this._citiesByState());
        map.set(stateId, []);
        this._citiesByState.set(map);

        const stillLoading = new Set(this._citiesLoadingFor());
        stillLoading.delete(stateId);
        this._citiesLoadingFor.set(stillLoading);
      },
    });
  }
}
