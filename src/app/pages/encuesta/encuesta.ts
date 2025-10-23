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
import { RouterModule } from '@angular/router'; // <-- 1. IMPORTAR ROUTERMODULE

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
  imports: [CommonModule, ReactiveFormsModule, RouterModule], // <-- 2. AÑADIR ROUTERMODULE
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

  // --- 3. CREAMOS UN ESTADO INICIAL PARA REUTILIZAR ---
  private readonly initialFormState = {
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
  };

  form = this.fb.group(
    {
      nombre: [
        this.initialFormState.nombre,
        [
          Validators.required,
          Validators.minLength(3),
          Validators.pattern('^[a-zA-ZáéíóúÁÉÍÓÚñÑ\\s]*$'),
        ],
      ],
      edad: [
        this.initialFormState.edad as number | null,
        [Validators.required, Validators.min(18), Validators.max(99)],
      ],
      telefono: [
        this.initialFormState.telefono,
        [Validators.required, Validators.pattern(/^\d{1,10}$/)],
      ],
      satisfaccion: [this.initialFormState.satisfaccion, [Validators.required]],
      jugados: this.fb.group(this.initialFormState.jugados),
      juegoFavorito: [
        this.initialFormState.juegoFavorito,
        [Validators.required, Validators.maxLength(255)],
      ],
      sugerenciaJuego: [
        this.initialFormState.sugerenciaJuego,
        [Validators.maxLength(255)],
      ],
      comentario: [
        this.initialFormState.comentario,
        [
          Validators.required,
          Validators.minLength(5),
          Validators.maxLength(255),
        ],
      ],
    },
    { validators: [atLeastOneTrue('jugados')] }
  );

  get jugadosGroup(): FormGroup {
    return this.form.get('jugados') as FormGroup;
  }

  ctrl(name: string) {
    return this.form.get(name)!;
  }

  // --- 4. NUEVA FUNCIÓN PARA LIMPIAR LOS CAMPOS ---
  limpiarCampos(): void {
    this.form.reset(this.initialFormState);
    this.ok = false;
    this.err = null;
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
      // Usamos la nueva función para limpiar
      this.limpiarCampos();
    } catch (e: any) {
      this.err = e?.message ?? 'No se pudo guardar la encuesta';
      console.error(e);
    } finally {
      this.saving = false;
    }
  }
}
