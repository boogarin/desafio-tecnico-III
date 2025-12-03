import { Injectable } from '@angular/core';
import axios, { AxiosInstance } from 'axios';

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  private api: AxiosInstance;

  constructor() {
    this.api = axios.create({
      baseURL: '/api',
      headers: {
        'Content-Type': 'application/json'
      }
    });
  }

  // Pacientes
  getPacientes(page: number = 1, pageSize: number = 10) {
    return this.api.get('/pacientes', { params: { page, pageSize } });
  }

  getPaciente(id: string) {
    return this.api.get(`/pacientes/${id}`);
  }

  createPaciente(data: any) {
    return this.api.post('/pacientes', data);
  }

  updatePaciente(id: string, data: any) {
    return this.api.put(`/pacientes/${id}`, data);
  }

  deletePaciente(id: string) {
    return this.api.delete(`/pacientes/${id}`);
  }

  // Exames
  getExames(page: number = 1, pageSize: number = 10, pacienteId?: string) {
    const params: any = { page, pageSize };
    if (pacienteId) params.pacienteId = pacienteId;
    return this.api.get('/exames', { params });
  }

  getExame(id: string) {
    return this.api.get(`/exames/${id}`);
  }

  createExame(data: any) {
    return this.api.post('/exames', data);
  }

  updateExame(id: string, data: any) {
    return this.api.put(`/exames/${id}`, data);
  }

  deleteExame(id: string) {
    return this.api.delete(`/exames/${id}`);
  }
}
