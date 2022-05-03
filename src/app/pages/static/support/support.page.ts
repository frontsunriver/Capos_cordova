import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-support',
  templateUrl: './support.page.html',
  styleUrls: ['./support.page.scss'],
})
export class SupportPage implements OnInit {
  public title: string;

  constructor(private activatedRoute: ActivatedRoute) { }

  ngOnInit() {
    this.title = 'Support';
  }

}
