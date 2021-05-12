import { NgModule }       from '@angular/core';
import { BrowserModule }  from '@angular/platform-browser';
import { FormsModule }    from '@angular/forms';
import { HttpClientModule }    from '@angular/common/http';

import { AppRoutingModule }     from './app-routing.module';

import { AppComponent }         from './app.component';
import { DashboardComponent }   from './dashboard/dashboard.component';

import { PLATFORM_ID, APP_ID, Inject } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { PublicProfileComponent } from './publicprofile/publicprofile.component';
import { ProfileService } from '../services/profile.service';
import { ProgramService } from '../services/program.service';
import { ProgramComponent } from './program/program.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

import {MatButtonModule} from '@angular/material/button';
import {MatGridListModule} from '@angular/material/grid-list';
import {MatCardModule} from '@angular/material/card';
import {MatDividerModule} from '@angular/material/divider';
import { MatIconModule } from "@angular/material/icon";
import { StarRatingComponent } from './components/star-rating/star-rating.component';
import { BasicHeaderComponent } from './components/basic-header/basic-header.component';
import {MatToolbarModule} from '@angular/material/toolbar';
import { FlexLayoutModule } from "@angular/flex-layout";
import { TextLengthPipe } from "../app/global.pipe"

@NgModule({
  imports: [
    BrowserModule.withServerTransition({ appId: 'maas-ssr-app' }),
    FormsModule,
    AppRoutingModule,
    HttpClientModule,
    BrowserAnimationsModule,
    MatButtonModule,
    MatGridListModule,
    MatCardModule,
    MatDividerModule,
    MatIconModule,
    MatToolbarModule,
    FlexLayoutModule
    
    // HttpClientInMemoryWebApiModule.forRoot(
    //   InMemoryDataService, { dataEncapsulation: false }
    // )
  ],
  declarations: [
    AppComponent,
    DashboardComponent,
    PublicProfileComponent,
    ProgramComponent,
    StarRatingComponent,
    BasicHeaderComponent,
    TextLengthPipe
  ],
  providers: [ 
    ProfileService,
    ProgramService
  ],
  bootstrap: [ AppComponent ]
})
export class AppModule {
  constructor(
    @Inject(PLATFORM_ID) private platformId: Object,
    @Inject(APP_ID) private appId: string) {
    const platform = isPlatformBrowser(platformId) ?
      'in the browser' : 'on the server';
    console.log(`Running ${platform} with appId=${appId}`);
  }
}
