import { Component, OnInit } from '@angular/core';
import { ProgramService } from '../../services/program.service';
import { ActivatedRoute, Router } from '@angular/router';
import { environment } from '../../environments/environment';

@Component({
  selector: 'app-program',
  templateUrl: './program.component.html',
  styleUrls: [ './program.component.css' ]
})
export class ProgramComponent implements OnInit {

  program = {
    name: '',
    description: '',
    imgPath: ''
  };
  signinUrl: string;

  constructor(
    private programService: ProgramService,
    private router: Router,
    private route: ActivatedRoute
  ) { }

  ngOnInit() {
    this.route.queryParamMap.subscribe(val => {
      var pid:string = val.get("pid");
      this.loadProgramDetail(parseInt(pid));
    });
    
    this.signinUrl = environment.signinUrl;
  }

  loadProgramDetail(programId) {
    this.programService.getProgramDetail(programId).subscribe(
      (detail: any)=> {
        this.program = detail.result;
      }
    );
  }

  signup() {
    window.location.href = environment.signupUrl;
  }
}
