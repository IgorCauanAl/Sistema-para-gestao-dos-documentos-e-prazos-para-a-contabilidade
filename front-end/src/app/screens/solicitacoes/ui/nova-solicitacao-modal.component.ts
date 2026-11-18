import { Component, EventEmitter, Input, OnChanges, Output, SimpleChanges } from '@angular/core';
import { LucideFileText, LucidePlus, LucideTrash2 } from '@lucide/angular';

import { ModalComponent } from '../../../core/components/ui/modal.component';
import { paraBR } from '../../../core/domain/data';
import { ANOS, CANAIS_ENVIO, MESES } from '../../../core/domain/documento';
import type { Cliente, SolicitacaoNova } from '../../../core/domain/models';
import { FORMATOS_ESPERADOS, SUGESTOES_ITENS } from '../../../core/domain/solicitacao';

const inputClass =
  'w-full px-3 py-2.5 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-sm text-slate-700';

@Component({
  selector: 'app-nova-solicitacao-modal',
  standalone: true,
  imports: [ModalComponent, LucideFileText, LucidePlus, LucideTrash2],
  template: `
    <app-modal [open]="open" (onClose)="onClose.emit()" title="Nova solicitação" maxWidth="max-w-3xl">
      <form (submit)="$event.preventDefault()" class="p-6 space-y-5 bg-slate-50/50">
        <div>
          <label class="block text-sm font-semibold mb-1.5 text-slate-700">Cliente</label>
          <input
            list="sol-clientes-list"
            class="w-full px-3 py-2.5 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-sm text-slate-700"
            placeholder="Busque pelo nome do cliente..."
            [value]="clienteTravado ? clienteInicial?.razaoSocial : clienteNome"
            [readOnly]="clienteTravado"
            (input)="clienteNome = $any($event.target).value"
          />
          <datalist id="sol-clientes-list">
            @for (cliente of clientes; track cliente.id) {
              <option [value]="cliente.razaoSocial"></option>
            }
          </datalist>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-3 gap-5">
          <div class="md:col-span-1">
            <label class="block text-sm font-semibold mb-1.5 text-slate-700">Título</label>
            <input
              type="text"
              class="w-full px-3 py-2.5 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-sm text-slate-700"
              placeholder="Documentos de 09/2026"
              [value]="titulo"
              (input)="titulo = $any($event.target).value"
            />
          </div>

          <div>
            <label class="block text-sm font-semibold mb-1.5 text-slate-700">Competência</label>
            <select
              class="w-full px-3 py-2.5 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-sm text-slate-700"
              [value]="competencia"
              (change)="competencia = $any($event.target).value"
            >
              @for (valor of competencias; track valor) {
                <option [value]="valor">{{ valor }}</option>
              }
            </select>
          </div>

          <div>
            <label class="block text-sm font-semibold mb-1.5 text-slate-700">Prazo para envio</label>
            <input
              type="date"
              class="w-full px-3 py-2.5 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-sm text-slate-700"
              [value]="prazo"
              (input)="prazo = $any($event.target).value"
            />
          </div>
        </div>

        <fieldset>
          <legend class="block text-sm font-semibold mb-2 text-slate-700">Checklist de itens</legend>

          <div class="flex flex-wrap gap-2 mb-3">
            @for (sugestao of sugestoes; track sugestao) {
              <button
                type="button"
                (click)="addItem(sugestao)"
                class="px-3 py-1.5 rounded-full bg-indigo-50 text-indigo-600 border border-indigo-100 text-xs font-semibold hover:bg-indigo-100 transition-colors"
              >
                + {{ sugestao }}
              </button>
            }
          </div>

          <div class="space-y-3">
            @for (item of itens; track $index; let index = $index) {
              <div class="flex flex-col sm:flex-row gap-3 items-stretch">
                <div class="flex-1">
                  <label class="sr-only" [attr.for]="'sol-item-' + index">Nome do item {{ index + 1 }}</label>
                  <input
                    [id]="'sol-item-' + index"
                    type="text"
                    class="w-full px-3 py-2.5 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-sm text-slate-700"
                    placeholder="Nome do item (ex.: Extrato bancário)"
                    [value]="item.nome"
                    (input)="setItem(index, { nome: $any($event.target).value })"
                  />
                </div>
                <div class="sm:w-40">
                  <label class="sr-only" [attr.for]="'sol-formato-' + index">
                    Formato esperado do item {{ index + 1 }}
                  </label>
                  <select
                    [id]="'sol-formato-' + index"
                    class="w-full px-3 py-2.5 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-sm text-slate-700"
                    [value]="item.formato"
                    (change)="setItem(index, { formato: $any($event.target).value })"
                  >
                    @for (formato of formatos; track formato) {
                      <option [value]="formato">{{ formato }}</option>
                    }
                  </select>
                </div>
                <button
                  type="button"
                  [attr.aria-label]="'Remover item ' + (index + 1)"
                  (click)="removeItem(index)"
                  class="px-3 py-2.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-colors self-start"
                >
                  <svg lucideTrash2 [size]="18"></svg>
                </button>
              </div>
            }
          </div>

          <button
            type="button"
            (click)="addItem()"
            class="mt-3 flex items-center gap-1.5 text-sm font-semibold text-indigo-600 hover:text-indigo-700 transition-colors"
          >
            <svg lucidePlus [size]="16"></svg> Adicionar item
          </button>
        </fieldset>

        <div>
          <label class="block text-sm font-semibold mb-1.5 text-slate-700">
            Instruções para o cliente <span class="font-normal text-slate-400">(opcional)</span>
          </label>
          <textarea
            rows="3"
            class="w-full px-3 py-2.5 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-sm text-slate-700"
            placeholder="Ex.: Envie em PDF nomeado com a competência..."
            [value]="instrucoes"
            (input)="instrucoes = $any($event.target).value"
          ></textarea>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div>
            <label class="block text-sm font-semibold mb-1.5 text-slate-700">Validade do link</label>
            <select
              class="w-full px-3 py-2.5 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-sm text-slate-700"
              [value]="validadeDias"
              (change)="validadeDias = $any($event.target).value"
            >
              <option value="7">7 dias</option>
              <option value="15">15 dias</option>
              <option value="30">30 dias</option>
            </select>
          </div>

          <fieldset>
            <legend class="block text-sm font-semibold mb-2 text-slate-700">Canal de envio</legend>
            <div class="flex gap-4">
              @for (opcao of canais; track opcao) {
                <label
                  class="flex items-center gap-2 px-4 py-2.5 bg-white border border-slate-200 rounded-xl cursor-pointer text-sm font-medium text-slate-700 has-[:checked]:border-indigo-500 has-[:checked]:bg-indigo-50/50 transition-colors"
                >
                  <input
                    type="radio"
                    name="canal-request"
                    [value]="opcao"
                    [checked]="canal === opcao"
                    (change)="canal = opcao"
                    class="accent-indigo-500"
                  />
                  {{ opcao }}
                </label>
              }
            </div>
          </fieldset>
        </div>

        @if (error) {
          <div class="flex items-start gap-3 px-4 py-3 bg-red-50 border border-red-200 rounded-2xl" role="alert">
            <svg lucideFileText [size]="18" class="text-red-600 shrink-0 mt-0.5"></svg>
            <p class="text-sm font-medium text-red-700">{{ error }}</p>
          </div>
        }
      </form>

      <div modalFooter class="px-6 py-4 flex flex-wrap justify-end gap-3">
        <button
          type="button"
          (click)="handleSubmit(false)"
          class="px-5 py-2.5 rounded-full border border-slate-200 text-slate-600 hover:bg-slate-100 transition-colors text-sm font-medium"
        >
          Salvar como rascunho
        </button>
        <button
          type="button"
          (click)="handleSubmit(true)"
          class="px-6 py-2.5 rounded-full bg-indigo-500 text-white font-medium hover:bg-indigo-600 transition-colors text-sm flex items-center gap-2"
        >
          Criar e enviar link
        </button>
      </div>
    </app-modal>
  `,
})
export class NovaSolicitacaoModalComponent implements OnChanges {
  @Input() open = false;
  @Input() clientes: Cliente[] = [];
  @Input() clienteInicial: Cliente | null = null;
  @Output() onClose = new EventEmitter<void>();
  @Output() onSubmit = new EventEmitter<SolicitacaoNova>();

  clienteNome = '';
  titulo = '';
  competencia = '09/2026';
  prazo = '';
  itens: Array<{ nome: string; formato: string }> = [{ nome: '', formato: 'PDF' }];
  instrucoes = '';
  validadeDias = '7';
  canal = 'WhatsApp';
  error = '';

  readonly sugestoes = SUGESTOES_ITENS;
  readonly formatos = FORMATOS_ESPERADOS;
  readonly canais = CANAIS_ENVIO;
  readonly competencias = ANOS.flatMap((ano) => MESES.map((mes) => `${mes}/${ano}`));

  get clienteTravado(): boolean {
    return Boolean(this.clienteInicial);
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (!changes['open'] || !this.open) return;

    const cliente = this.clienteInicial ?? null;
    this.clienteNome = cliente?.razaoSocial ?? '';
    this.titulo = cliente ? `Documentos de ${this.competencia}` : '';
    this.prazo = '';
    this.itens = [{ nome: '', formato: 'PDF' }];
    this.instrucoes = '';
    this.validadeDias = '7';
    this.canal = cliente?.canalPreferido ?? 'WhatsApp';
    this.error = '';
  }

  addItem(nome = ''): void {
    this.itens = [...this.itens, { nome, formato: 'PDF' }];
  }

  setItem(index: number, patch: Partial<{ nome: string; formato: string }>): void {
    this.itens = this.itens.map((item, i) => (i === index ? { ...item, ...patch } : item));
  }

  removeItem(index: number): void {
    this.itens = this.itens.filter((_, i) => i !== index);
  }

  handleSubmit(enviarAgora: boolean): void {
    const cliente = this.clienteTravado
      ? this.clienteInicial
      : this.clientes.find(
          (c) => c.razaoSocial.toLowerCase() === (this.clienteNome ?? '').trim().toLowerCase()
        );

    if (!cliente) {
      this.error = 'Selecione um cliente válido.';
      return;
    }
    if (!this.titulo.trim()) {
      this.error = 'Informe o título da solicitação.';
      return;
    }
    const itensValidos = this.itens.filter((item) => item.nome.trim());
    if (itensValidos.length === 0) {
      this.error = 'Adicione pelo menos 1 item à solicitação.';
      return;
    }
    if (!this.prazo) {
      this.error = 'Informe o deadline para envio.';
      return;
    }

    this.error = '';
    this.onSubmit.emit({
      clienteId: cliente.id,
      titulo: this.titulo.trim(),
      competencia: this.competencia,
      prazo: paraBR(this.prazo),
      instrucoes: this.instrucoes.trim(),
      canal: this.canal,
      validadeDias: Number(this.validadeDias),
      itens: itensValidos.map((item) => ({ nome: item.nome.trim(), formato: item.formato })),
      enviarAgora,
    });
  }
}
