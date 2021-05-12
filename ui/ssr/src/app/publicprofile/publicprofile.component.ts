import { Component, OnInit } from '@angular/core';
import { ProfileService } from '../../services/profile.service';
import { ActivatedRoute } from '@angular/router';
import { environment } from '../../environments/environment';

@Component({
  selector: 'app-publicprofile',
  templateUrl: './publicprofile.component.html',
  styleUrls: [ './publicprofile.component.css' ]
})
export class PublicProfileComponent implements OnInit {
  user = {
    firstName: '',
    lastName: '',
    location: '',
    peopleMentored: 0,
    userDetail: {
      photoUrl: '',
      avgRating: 0,
      about: '',
      description: '',
      totalVotes: 0,
      tokenBalance: 0
    },
    role: {
      description: ''
    },
    company: {
      name: ''
    },
    skillsList: []
  };
  signinUrl: string;

  constructor(
    private profileService: ProfileService,
    private route: ActivatedRoute
  ) { }

  ngOnInit() {
    this.route.queryParamMap.subscribe(val => {
      var uid:string = val.get("uid");
      this.loadUserDetail(parseInt(uid));
    });
    
    this.signinUrl = environment.signinUrl;
  }

  loadUserDetail(userId) {
    this.profileService.getUserProfileDetail(userId).subscribe(
      (detail: any)=> {
        this.user = detail.result;
      }
    );
  }

  handleClick() {
    this.profileService.getUserProfileDetail(1).subscribe(
      (detail: any)=> {
        console.log('EMAIL: ', detail.result.email);
      }
    );
  }

  signup() {
    window.location.href = environment.signupUrl;
  }
}
