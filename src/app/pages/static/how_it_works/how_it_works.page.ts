import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-how_it_works',
  templateUrl: './how_it_works.page.html',
  styleUrls: ['./how_it_works.page.scss'],
})
export class HowItWorksPage implements OnInit {
  public title: string;

  constructor(private activatedRoute: ActivatedRoute) { }

  ngOnInit() {
    this.title = 'How it works';
  }

}
