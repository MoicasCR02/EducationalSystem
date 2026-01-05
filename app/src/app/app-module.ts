import { NgModule, provideBrowserGlobalErrorListeners } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { AppRoutingModule } from './app-routing-module';
import { App } from './app';
import { CoreModule } from './core/core-module';
import { ShareModule } from './share/share-module';
import { HomeModule } from './home/home-module';
import { UsuarioModule } from './usuario/usuario-module';
import { HTTP_INTERCEPTORS, HttpClient, provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';
import { NgxSonnerToaster } from 'ngx-sonner';
import { HttpErrorInterceptorService } from './share/interceptor/http-error-interceptor.service';
import { CategoriaModule } from './categoria/categoria-module';
import { TicketsModule } from './tickets/tickets-module';
import { AsignacionModule } from './asignacion/asignacion-module';
import { TranslateLoader, TranslateModule } from '@ngx-translate/core';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';
import { MatDialogModule } from '@angular/material/dialog';
import { HttpAuthInterceptorService } from './share/interceptor/http-auth-interceptor.service';
import { DashboardPrincipalModule } from './dashboard-principal/dashboard-principal-module';


// 👇 Factory para cargar archivos de traducción
export function HttpLoaderFactory(http: HttpClient) {
  return new TranslateHttpLoader(http, './assets/i18n/', '.json');
}

@NgModule({
  declarations: [
    App,
  ],
  imports: [
    BrowserModule,
    NgxSonnerToaster,
    CoreModule,
    ShareModule,
    HomeModule,
    UsuarioModule,
    CategoriaModule,
    TicketsModule,
    AsignacionModule,
    AppRoutingModule,
    MatDialogModule,
    TranslateModule.forRoot({
      defaultLanguage: 'es',
      loader: {
        provide: TranslateLoader,
        useFactory: HttpLoaderFactory,
        deps: [HttpClient],
      },
    }),
    DashboardPrincipalModule,
  ],
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideHttpClient(withInterceptorsFromDi()),
    {
      provide: HTTP_INTERCEPTORS,
      useClass: HttpErrorInterceptorService,
      multi: true,
    },
    {
      provide: HTTP_INTERCEPTORS,
      useClass: HttpAuthInterceptorService,
      multi: true
    }
  ],
  bootstrap: [App],
})
export class AppModule {
}
