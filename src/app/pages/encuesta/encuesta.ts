import { Component, ChangeDetectionStrategy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  ReactiveFormsModule,
  FormBuilder,
  Validators,
  AbstractControl,
  ValidationErrors,
  ValidatorFn,
  FormGroup,
} from '@angular/forms';
import {
  Firestore,
  addDoc,
  collection,
  serverTimestamp,
} from '@angular/fire/firestore';
import { Auth } from '@angular/fire/auth';

function atLeastOneTrue(groupName: string): ValidatorFn {
  return (ctrl: AbstractControl): ValidationErrors | null => {
    const g = ctrl.get(groupName);
    if (!g || typeof g.value !== 'object') return { invalidGroup: true };
    const any = Object.values(g.value as Record<string, boolean>).some(Boolean);
    return any ? null : { atLeastOne: true };
  };
}

@Component({
  selector: 'app-encuesta',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './encuesta.html',
  styleUrls: ['./encuesta.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EncuestaComponent {
  private fb = inject(FormBuilder);
  private fs = inject(Firestore);
  private auth = inject(Auth);

  saving = false;
  ok = false;
  err: string | null = null;

  form = this.fb.group(
    {
      nombre: [
        '',
        [
          Validators.required,
          Validators.minLength(3),
          Validators.pattern('^[a-zA-ZáéíóúÁÉÍÓÚñÑ\\s]*$'),
        ],
      ],
      edad: [
        null as number | null,
        [Validators.required, Validators.min(18), Validators.max(99)],
      ],
      telefono: ['', [Validators.required, Validators.pattern(/^\d{1,10}$/)]],
      satisfaccion: ['', [Validators.required]],
      jugados: this.fb.group({
        ahorcado: [false],
        mayorMenor: [false],
        preguntados: [false],
        secuencias: [false],
      }),
      juegoFavorito: ['', [Validators.required, Validators.maxLength(255)]],
      sugerenciaJuego: ['', [Validators.maxLength(255)]],
      comentario: [
        '',
        [
          Validators.required,
          Validators.minLength(5),
          Validators.maxLength(255),
        ],
      ],
    },
    { validators: [atLeastOneTrue('jugados')] }
  );

  /** Getter fuertemente tipado para poder usarlo en [formGroup] sin error de TS */
  get jugadosGroup(): FormGroup {
    return this.form.get('jugados') as FormGroup;
  }

  ctrl(name: string) {
    return this.form.get(name)!;
  }

  async submit() {
    this.ok = false;
    this.err = null;
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const user = this.auth.currentUser;
    if (!user) {
      this.err = 'Debes iniciar sesión para enviar la encuesta.';
      return;
    }

    try {
      this.saving = true;
      await addDoc(collection(this.fs, 'encuestas'), {
        uid: user.uid,
        email: user.email ?? null,
        createdAt: serverTimestamp(),
        ...this.form.value,
      });
      this.ok = true;
      this.form.reset({
        nombre: '',
        edad: null,
        telefono: '',
        satisfaccion: '',
        jugados: {
          ahorcado: false,
          mayorMenor: false,
          preguntados: false,
          secuencias: false,
        },
        juegoFavorito: '',
        sugerenciaJuego: '',
        comentario: '',
      });
    } catch (e: any) {
      this.err = e?.message ?? 'No se pudo guardar la encuesta';
      console.error(e);
    } finally {
      this.saving = false;
    }
  }
}
