import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { InicioSesionComponent } from './componentes/inicio-sesion/inicio-sesion.component';
import { RegistroComponent } from './componentes/registro/registro.component';
import { RecuperarClaveComponent } from './componentes/recuperar-clave/recuperar-clave.component';
import { VerificarEmailComponent } from './componentes/verificar-email/verificar-email.component'; // ← NUEVO

const routes: Routes = [
  { path: 'inicio-sesion', component: InicioSesionComponent },
  { path: 'registro', component: RegistroComponent },
  { path: 'recuperar-clave', component: RecuperarClaveComponent },
  { path: 'verificar-email', component: VerificarEmailComponent }, // ← NUEVO
  { path: '', redirectTo: 'inicio-sesion', pathMatch: 'full' }
];

@NgModule({
  imports: [
    CommonModule,
    RouterModule.forChild(routes),
    InicioSesionComponent, // ← Si son standalone
    RegistroComponent,
    RecuperarClaveComponent,
    VerificarEmailComponent // ← NUEVO
  ]
})
export class AutenticacionModule { }