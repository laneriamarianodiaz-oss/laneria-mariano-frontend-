import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { NotificacionesComponent } from './componentes/notificaciones/notificaciones.component';
import { ChatComponent } from './componentes/chat/chat.component';
import { AlertasComponent } from './componentes/alertas/alertas.component';

const routes: Routes = [
  { path: 'notificaciones', component: NotificacionesComponent },
  { path: 'chat', component: ChatComponent },
  { path: 'alertas', component: AlertasComponent }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ComunicacionRoutingModule { }