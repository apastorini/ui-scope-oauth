import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

//Protectores de rutas
import { AuthGuardService } from './Services/auth-guard.service';
import { NoAuthGuardService } from './Services/no-auth-guard.service';

//Components
import { LoginComponent } from 'src/app/login/login.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import { NotfoundComponent } from './notfound/notfound.component';
import { ScopesComponent } from './scopes/scopes.component';
import { RolesComponent } from './roles/roles.component';
import { HomeComponent } from './home/home.component';

const routes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full'},
  { path: 'login', component: LoginComponent, canActivate: [NoAuthGuardService]},
  { path: "dashboard", redirectTo: "dashboard/home"},
  {
    path: 'dashboard', component: DashboardComponent,
    children: [
      {path: 'home', component: HomeComponent},
      {path: 'scopes', component: ScopesComponent},
      {path: 'roles', component: RolesComponent},
    ],
    canActivate: [AuthGuardService],
    canActivateChild: [AuthGuardService],
  },
  {path: '404', component: NotfoundComponent},
  {path: '**', redirectTo: '/404'},
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
