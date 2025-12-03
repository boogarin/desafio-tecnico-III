import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { ApiService } from '../../services/api.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css'],
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule],
})
export class DashboardComponent implements OnInit {
  activeTab: 'pacientes' | 'exames' = 'pacientes';
  pacientes: any[] = [];
  exames: any[] = [];
  isLoading = false;
  currentPage = 1;
  pageSize = 10;

  pacienteForm: FormGroup;
  exameForm: FormGroup;
  showPacienteForm = false;
  showExameForm = false;
  successMessage = '';
  editingPacienteId: string | null = null;
  editingExameId: string | null = null;

  constructor(
    private apiService: ApiService,
    private authService: AuthService,
    private fb: FormBuilder,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {
    this.pacienteForm = this.fb.group({
      nome: ['', Validators.required],
      cpf: ['', [Validators.required, Validators.pattern(/^\d{11}$/)]],
      dataNascimento: ['', Validators.required],
      sexo: ['', Validators.required],
      endereco: ['', Validators.required],
      telefone: ['', Validators.required]
    });

    this.exameForm = this.fb.group({
      modalidade: ['', Validators.required],
      data: ['', Validators.required],
      resultado: ['', Validators.required],
      pacienteId: ['', Validators.required],
      idempotencyKey: [this.generateIdempotencyKey()]
    });
  }

  ngOnInit(): void {
    this.editingPacienteId = null; // Garante que o estado inicial seja sempre "Criar Paciente"
    this.loadPacientes();
  }

  loadPacientes(): void {
    this.isLoading = true;
    this.apiService.getPacientes(this.currentPage, this.pageSize)
      .then((res: any) => {
        // Log completo para depuração
        console.log('Pacientes API:', res);
        let pacientesArr = [];
        if (res && res.data) {
          if (Array.isArray(res.data.data)) {
            pacientesArr = res.data.data;
          } else if (Array.isArray(res.data)) {
            pacientesArr = res.data;
          } else if (Array.isArray(res.data["data"])) {
            pacientesArr = res.data["data"];
          }
        }
        this.pacientes = pacientesArr;
        this.isLoading = false;
        this.cdr.detectChanges();
      })
      .catch((err: any) => {
        console.error(err);
        this.isLoading = false;
        this.cdr.detectChanges();
      });
  }

  loadExames(): void {
    this.isLoading = true;
    this.apiService.getExames(this.currentPage, this.pageSize)
      .then((res: any) => {
        // Log completo para depuração
        console.log('Exames API:', res);
        let examesArr = [];
        if (res && res.data) {
          if (Array.isArray(res.data.data)) {
            examesArr = res.data.data;
          } else if (Array.isArray(res.data)) {
            examesArr = res.data;
          } else if (Array.isArray(res.data["data"])) {
            examesArr = res.data["data"];
          }
        }
        this.exames = examesArr;
        this.isLoading = false;
        this.cdr.detectChanges();
      })
      .catch((err: any) => {
        console.error(err);
        this.isLoading = false;
        this.cdr.detectChanges();
      });
  }

  switchTab(tab: 'pacientes' | 'exames'): void {
    this.activeTab = tab;
    this.currentPage = 1;
    if (tab === 'pacientes') {
      this.loadPacientes();
    } else {
      this.loadExames();
    }
  }

  createPaciente(): void {
    if (this.pacienteForm.invalid) return;

    this.isLoading = true;
    const operation = this.editingPacienteId
      ? this.apiService.updatePaciente(this.editingPacienteId, this.pacienteForm.value)
      : this.apiService.createPaciente(this.pacienteForm.value);

    operation
      .then(() => {
        this.successMessage = this.editingPacienteId
          ? 'Paciente atualizado com sucesso!'
          : 'Paciente criado com sucesso!';
        this.pacienteForm.reset();
        this.showPacienteForm = false;
        this.editingPacienteId = null;
        this.loadPacientes();
        setTimeout(() => this.successMessage = '', 3000);
      })
      .catch((err: any) => {
        console.error(err);
        this.isLoading = false;
        alert(err.response?.data?.message || 'Erro ao salvar paciente');
      });
  }

  editPaciente(paciente: any): void {
    this.editingPacienteId = paciente.id;
    this.pacienteForm.patchValue({
      nome: paciente.nome,
      cpf: paciente.cpf,
      dataNascimento: paciente.dataNascimento.split('T')[0],
      sexo: paciente.sexo,
      endereco: paciente.endereco,
      telefone: paciente.telefone
    });
    this.showPacienteForm = true;
    this.cdr.detectChanges(); // Força a atualização do formulário ao ser aberto
  }

  deletePaciente(id: string): void {
    if (!confirm('Tem certeza que deseja deletar este paciente?')) return;

    this.isLoading = true;
    this.apiService.deletePaciente(id)
      .then(() => {
        this.successMessage = 'Paciente deletado com sucesso!';
        this.loadPacientes();
        setTimeout(() => this.successMessage = '', 3000);
      })
      .catch((err: any) => {
        console.error(err);
        this.isLoading = false;
        alert(err.response?.data?.message || 'Erro ao deletar paciente');
      });
  }

  cancelEditPaciente(): void {
    this.editingPacienteId = null;
    this.pacienteForm.reset();
    this.showPacienteForm = false;
  }

  openNewPacienteForm(): void {
    this.editingPacienteId = null;
    this.pacienteForm.reset();
    this.showPacienteForm = !this.showPacienteForm;
    this.cdr.detectChanges();
  }

  createExame(): void {
    if (this.exameForm.invalid) return;

    this.isLoading = true;
    const operation = this.editingExameId
      ? this.apiService.updateExame(this.editingExameId, this.exameForm.value)
      : this.apiService.createExame(this.exameForm.value);

    operation
      .then(() => {
        this.successMessage = this.editingExameId
          ? 'Exame atualizado com sucesso!'
          : 'Exame criado com sucesso!';
        this.exameForm.reset();
        this.exameForm.patchValue({ idempotencyKey: this.generateIdempotencyKey() });
        this.showExameForm = false;
        this.editingExameId = null;
        this.loadExames();
        setTimeout(() => this.successMessage = '', 3000);
      })
      .catch((err: any) => {
        console.error(err);
        this.isLoading = false;
        alert(err.response?.data?.message || 'Erro ao salvar exame');
      });
  }

  editExame(exame: any): void {
    this.editingExameId = exame.id;
    this.exameForm.patchValue({
      modalidade: exame.modalidade,
      data: exame.data.split('T')[0],
      resultado: exame.resultado,
      pacienteId: exame.pacienteId,
      idempotencyKey: exame.idempotencyKey
    });
    this.showExameForm = true;
  }

  deleteExame(id: string): void {
    if (!confirm('Tem certeza que deseja deletar este exame?')) return;

    this.isLoading = true;
    this.apiService.deleteExame(id)
      .then(() => {
        this.successMessage = 'Exame deletado com sucesso!';
        this.loadExames();
        setTimeout(() => this.successMessage = '', 3000);
      })
      .catch((err: any) => {
        console.error(err);
        this.isLoading = false;
        alert(err.response?.data?.message || 'Erro ao deletar exame');
      });
  }

  cancelEditExame(): void {
    this.editingExameId = null;
    this.exameForm.reset();
    this.exameForm.patchValue({ idempotencyKey: this.generateIdempotencyKey() });
    this.showExameForm = false;
  }

  generateIdempotencyKey(): string {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  logout(): void {
    this.authService.logout();
  }
}
