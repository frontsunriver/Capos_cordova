import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-features',
  templateUrl: './features.page.html',
  styleUrls: ['./features.page.scss'],
})
export class FeaturesPage implements OnInit {
  public title: string;

  constructor(private activatedRoute: ActivatedRoute) { }

  ngOnInit() {
    this.title = 'Features';
  }

}
