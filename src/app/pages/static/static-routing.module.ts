import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { HomePage } from './home/home.page';
import { FeaturesPage } from './features/features.page';
import { HowItWorksPage } from './how_it_works/how_it_works.page';
import { SupportPage } from './support/support.page';
import { FaqPage } from './faq/faq.page';
import { BlogPage } from './blog/blog.page';
import { BlogPostPage } from './blog/blog-post/blog-post.page';
import { ContactPage } from './contact/contact.page';
import { SubscriptionPage } from '../main/setup/subscription/subscription.page';

const routes: Routes = [  
  {
    path: '',
    redirectTo: 'home',
    pathMatch: 'full'
  },
  {
    path: 'home',
    component: HomePage
  },
  {
    path: 'features',
    component: FeaturesPage
  },
  {
    path: 'how_it_works',
    component: HowItWorksPage
  },
  {
    path: 'support',
    component: SupportPage
  },
  {
    path: 'faq',
    component: FaqPage
  },
  {
    path: 'blog',
    component: BlogPage
  },
  {
    path: 'blog-post/:id',
    component: BlogPostPage
  },
  {
    path: 'contact',
    component: ContactPage
  },
  {
    path: 'pricing',
    component: SubscriptionPage
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class StaticPageRoutingModule {}
