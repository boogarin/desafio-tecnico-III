import { TestBed } from '@angular/core/testing';
import { describe, it, expect, beforeEach } from 'vitest';
import { ApiService } from './api.service';

describe('ApiService', () => {
  let service: ApiService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [ApiService]
    });
    service = TestBed.inject(ApiService);
  });

  it('deve ser criado', () => {
    expect(service).toBeTruthy();
  });

  it('deve ter instância de api configurada com baseURL /api', () => {
    expect((service as any).api.defaults.baseURL).toBe('/api');
  });

  it('deve ter header Content-Type configurado como application/json', () => {
    expect((service as any).api.defaults.headers['Content-Type']).toBe('application/json');
  });

  describe('Métodos da API', () => {
    it('deve ter método getPacientes', () => {
      expect(typeof service.getPacientes).toBe('function');
    });

    it('deve ter método createPaciente', () => {
      expect(typeof service.createPaciente).toBe('function');
    });

    it('deve ter método getExames', () => {
      expect(typeof service.getExames).toBe('function');
    });

    it('deve ter método createExame', () => {
      expect(typeof service.createExame).toBe('function');
    });
  });
});
