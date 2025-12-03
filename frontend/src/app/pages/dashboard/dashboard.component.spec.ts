import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { DashboardComponent } from './dashboard.component';
import { ApiService } from '../../services/api.service';
import { AuthService } from '../../services/auth.service';

describe('DashboardComponent', () => {
  let component: DashboardComponent;
  let fixture: ComponentFixture<DashboardComponent>;
  let mockApiService: any;
  let mockAuthService: any;
  let mockRouter: any;

  beforeEach(async () => {
    mockApiService = {
      getPacientes: vi.fn().mockResolvedValue({
        data: {
          data: [],
          total: 0,
          page: 1,
          pageSize: 10,
          totalPages: 0
        }
      }),
      createPaciente: vi.fn().mockResolvedValue({ data: {} }),
      getExames: vi.fn().mockResolvedValue({
        data: {
          data: [],
          total: 0,
          page: 1,
          pageSize: 10,
          totalPages: 0
        }
      }),
      createExame: vi.fn().mockResolvedValue({ data: {} })
    };

    mockAuthService = {
      logout: vi.fn()
    };

    mockRouter = {
      navigate: vi.fn()
    };

    await TestBed.configureTestingModule({
      imports: [DashboardComponent, ReactiveFormsModule, NoopAnimationsModule],
      providers: [
        { provide: ApiService, useValue: mockApiService },
        { provide: AuthService, useValue: mockAuthService },
        { provide: Router, useValue: mockRouter }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(DashboardComponent);
    component = fixture.componentInstance;
  });

  it('deve ser criado', () => {
    expect(component).toBeTruthy();
  });

  it('Cenário 9: deve mostrar spinner de carregamento durante busca de dados', () => {
    expect(component.isLoading).toBe(false);
    
    component.loadPacientes();
    
    expect(component.isLoading).toBe(true);
  });

  it('deve inicializar com aba pacientes ativa', () => {
    expect(component.activeTab).toBe('pacientes');
  });

  it('deve carregar pacientes na inicialização', () => {
    fixture.detectChanges();
    
    expect(mockApiService.getPacientes).toHaveBeenCalledWith(1, 10);
  });

  describe('Cenário 12: Validação de Formulário', () => {
    it('deve ter formulário paciente inválido quando vazio', () => {
      expect(component.pacienteForm.valid).toBeFalsy();
    });

    it('deve ter formulário paciente válido quando todos os campos obrigatórios preenchidos', () => {
      component.pacienteForm.setValue({
        nome: 'João Silva',
        cpf: '12345678901',
        dataNascimento: '1990-01-15',
        sexo: 'M',
        endereco: 'Rua Teste, 123',
        telefone: '11999999999'
      });

      expect(component.pacienteForm.valid).toBeTruthy();
    });

    it('deve validar tamanho do CPF (11 dígitos)', () => {
      const cpfControl = component.pacienteForm.get('cpf');
      
      cpfControl?.setValue('123');
      expect(cpfControl?.hasError('pattern')).toBeTruthy();
      
      cpfControl?.setValue('12345678901');
      expect(cpfControl?.hasError('pattern')).toBeFalsy();
    });

    it('deve ter formulário exame inválido quando vazio', () => {
      expect(component.exameForm.get('modalidade')?.valid).toBeFalsy();
      expect(component.exameForm.get('data')?.valid).toBeFalsy();
      expect(component.exameForm.get('resultado')?.valid).toBeFalsy();
      expect(component.exameForm.get('pacienteId')?.valid).toBeFalsy();
    });

    it('deve ter formulário exame válido quando todos os campos obrigatórios preenchidos', () => {
      component.exameForm.patchValue({
        modalidade: 'CT',
        data: '2025-01-15',
        resultado: 'Normal',
        pacienteId: 'test-uuid'
      });

      expect(component.exameForm.valid).toBeTruthy();
    });
  });

  describe('Alternância de Abas', () => {
    it('deve alternar para aba exames e carregar exames', () => {
      component.switchTab('exames');
      
      expect(component.activeTab).toBe('exames');
      expect(mockApiService.getExames).toHaveBeenCalled();
    });

    it('deve alternar para aba pacientes e carregar pacientes', () => {
      component.activeTab = 'exames';
      component.switchTab('pacientes');
      
      expect(component.activeTab).toBe('pacientes');
      expect(mockApiService.getPacientes).toHaveBeenCalled();
    });

    it('deve resetar página atual ao alternar abas', () => {
      component.currentPage = 5;
      component.switchTab('exames');
      
      expect(component.currentPage).toBe(1);
    });
  });

  describe('Criar Paciente', () => {
    it('não deve criar paciente se formulário inválido', () => {
      component.pacienteForm.setValue({
        nome: '',
        cpf: '',
        dataNascimento: '',
        sexo: '',
        endereco: '',
        telefone: ''
      });

      component.createPaciente();

      expect(mockApiService.createPaciente).not.toHaveBeenCalled();
    });

    it('deve criar paciente quando formulário válido', async () => {
      mockApiService.createPaciente = vi.fn().mockResolvedValue({ data: {} });
      
      component.pacienteForm.setValue({
        nome: 'João Silva',
        cpf: '12345678901',
        dataNascimento: '1990-01-15',
        sexo: 'M',
        endereco: 'Rua Teste, 123',
        telefone: '11999999999'
      });

      component.createPaciente();

      expect(mockApiService.createPaciente).toHaveBeenCalled();
    });

    it('deve mostrar mensagem de sucesso após criar paciente', async () => {
      mockApiService.createPaciente = vi.fn().mockResolvedValue({ data: {} });
      
      component.pacienteForm.setValue({
        nome: 'João Silva',
        cpf: '12345678901',
        dataNascimento: '1990-01-15',
        sexo: 'M',
        endereco: 'Rua Teste, 123',
        telefone: '11999999999'
      });

      component.createPaciente();

      await new Promise(resolve => setTimeout(resolve, 100));
      expect(component.successMessage).toBe('Paciente criado com sucesso!');
    });

    it('deve resetar formulário após criação bem-sucedida', async () => {
      mockApiService.createPaciente = vi.fn().mockResolvedValue({ data: {} });
      
      component.pacienteForm.setValue({
        nome: 'João Silva',
        cpf: '12345678901',
        dataNascimento: '1990-01-15',
        sexo: 'M',
        endereco: 'Rua Teste, 123',
        telefone: '11999999999'
      });

      component.createPaciente();

      await new Promise(resolve => setTimeout(resolve, 100));
      expect(component.pacienteForm.value.nome).toBeNull();
    });
  });

  describe('Criar Exame', () => {
    it('não deve criar exame se formulário inválido', () => {
      component.exameForm.patchValue({
        modalidade: '',
        data: '',
        resultado: '',
        pacienteId: ''
      });

      component.createExame();

      expect(mockApiService.createExame).not.toHaveBeenCalled();
    });

    it('deve criar exame quando formulário válido', () => {
      mockApiService.createExame = vi.fn().mockResolvedValue({ data: {} });
      
      component.exameForm.patchValue({
        modalidade: 'CT',
        data: '2025-01-15',
        resultado: 'Normal',
        pacienteId: 'test-uuid'
      });

      component.createExame();

      expect(mockApiService.createExame).toHaveBeenCalled();
    });

    it('deve gerar chave idempotência única', () => {
      const key1 = component.generateIdempotencyKey();
      const key2 = component.generateIdempotencyKey();
      
      expect(key1).not.toBe(key2);
      expect(key1.length).toBeGreaterThan(10);
    });
  });

  describe('Logout', () => {
    it('deve chamar authService.logout quando logout é chamado', () => {
      component.logout();
      
      expect(mockAuthService.logout).toHaveBeenCalled();
    });
  });

  describe('Cenário 10: Tratamento de Erros', () => {
    it('deve tratar erro quando carregamento de pacientes falha', async () => {
      mockApiService.getPacientes = vi.fn().mockRejectedValue(new Error('Network error'));
      
      component.loadPacientes();

      await new Promise(resolve => setTimeout(resolve, 100));
      expect(component.isLoading).toBe(false);
    });

    it('deve tratar erro quando carregamento de exames falha', async () => {
      mockApiService.getExames = vi.fn().mockRejectedValue(new Error('Network error'));
      
      component.loadExames();

      await new Promise(resolve => setTimeout(resolve, 100));
      expect(component.isLoading).toBe(false);
    });

    it('deve parar carregamento quando criação de paciente falha', async () => {
      mockApiService.createPaciente = vi.fn().mockRejectedValue(new Error('Validation error'));
      
      component.pacienteForm.setValue({
        nome: 'João Silva',
        cpf: '12345678901',
        dataNascimento: '1990-01-15',
        sexo: 'M',
        endereco: 'Rua Teste, 123',
        telefone: '11999999999'
      });

      component.createPaciente();

      await new Promise(resolve => setTimeout(resolve, 100));
      expect(component.isLoading).toBe(false);
    });
  });
});
