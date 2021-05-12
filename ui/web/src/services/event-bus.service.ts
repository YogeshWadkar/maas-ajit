import { Injectable } from "@angular/core";
import { Subject } from "rxjs";
import { ProgramService } from './program.service';

@Injectable()
export class EventBusService {
  public settingSource = new Subject<any>();
  public settingsFetchedValue$ = this.settingSource.asObservable();

  public profilepicSource = new Subject<any>();
  public profilepicFetchedValue$ = this.profilepicSource.asObservable();

  public profileStateSource = new Subject<any>();
  public profileStateFetchedValue$ = this.profileStateSource.asObservable();

  public profileCitySource = new Subject<any>();
  public profileCityFetchedValue$ = this.profileCitySource.asObservable();

  public roleSource = new Subject<any>();
  public roleFetchedValue$ = this.roleSource.asObservable();

  public roleNameSource = new Subject<any>();
  public roleNameFetchedValue$ = this.roleNameSource.asObservable();

  public userNameSource = new Subject<any>();
  public userNameFetchedValue$ = this.userNameSource.asObservable();

  public adsSource = new Subject<any>();
  public adsFetchedValue$ = this.adsSource.asObservable();

  constructor(
    private programService: ProgramService
  ) {}

  loadAds() {
    this.programService.getStatus().subscribe(
      (result: any)=> {
        var arr = result['data'];
        var statusId;
        arr.forEach(a => {
          if (a.name == 'published') {
            statusId = a.id;
          }
        });

        this.programService.get(null, null, statusId).subscribe(
          (response: any)=> {
            var plist = response['data'];
            var slides = [];
            plist.forEach(p => {
              slides.push({
                id: p.id,
                image: p.bannerImgPath
              });
            });

            this.adsSource.next(slides);
          }
        );
      }
    );
  }
}
