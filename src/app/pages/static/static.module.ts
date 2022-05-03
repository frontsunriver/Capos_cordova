import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ShareModule } from '../../_shared/share.module';

import { IonicModule } from '@ionic/angular';
import { StaticPageRoutingModule } from './static-routing.module';

import { HomePage } from './home/home.page';
import { FeaturesPage } from './features/features.page';
import { HowItWorksPage } from './how_it_works/how_it_works.page';
import { SupportPage } from './support/support.page';
import { FaqPage } from './faq/faq.page';
import { BlogPage } from './blog/blog.page';
import { BlogPostPage } from './blog/blog-post/blog-post.page';
import { ContactPage } from './contact/contact.page';
import { SubscriptionPage } from '../main/setup/subscription/subscription.page';

@NgModule({
  imports: [
    CommonModule,
    IonicModule,
    ShareModule,
    StaticPageRoutingModule
  ],
  declarations: [
    HomePage,
    FeaturesPage,
    HowItWorksPage,
    SupportPage,
    FaqPage,
    BlogPage,
    BlogPostPage,
    ContactPage,
    SubscriptionPage
  ]
})
export class StaticPageModule {}
