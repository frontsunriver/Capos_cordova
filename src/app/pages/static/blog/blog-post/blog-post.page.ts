import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

interface BlogPost{
  id: string,
  banner1: string,
  banner2: string,
  title: string,
  content: string
};

@Component({
  selector: 'app-blog-post',
  templateUrl: './blog-post.page.html',
  styleUrls: ['./blog-post.page.scss'],
})
export class BlogPostPage implements OnInit {
  public title: string;  

  blogs:BlogPost[] = [
    {
      id: '1',
      banner1: 'assets/home/streamline.png',
      banner2: '',
      title: 'How to streamline operations and improve your customer services with CaPOS?',
      content: '<p>Quality of service comes second only to delicious food in terms of what customers prioritise when it comes to their experience of dining out. So important is this part of the dining experience that it can determine whether or not diners will want to return. Great customer service needs a well organised underlying architecture – having an ePOS system is a fast track to improving operations, as well as the experience that customers have.</p>' + 
                '<h5>How does ePOS impact operations and customer service?</h5>' +       
                '<h5>Reducing mistakes</h5>' + 
                '<p>Your staff are only human and that means that some errors are inevitable. However, mistakes seriously frustrate customers and decrease perception of positive customer service so they must be minimised. Working with an ePOS system means mistakes are few – manual processes, such as order pads and pens, are replaced by effective technology that clearly communicates everything, from the number of portions to diner allergies.</p>' +       
                '<h5>Empowering customers and defining your brand</h5>' + 
                '<p>If you’re using ePOS then you have the opportunity to let customers effectively do their own ordering. This can take the pressure off your human resources and may make customers more comfortable, especially when it comes to ordering more. Not only is this a great brand feature but it can improve revenue too because, more often than not, customers will upsell to themselves.</p>' +       
                '<h5>Streamlining operations</h5>' + 
                '<p>When you add up the time it takes for a server to write an order down and physically take it to the kitchen over and over again, it’s easy to see why service can be slow. An ePOS system removes all of this lost time as communication between front of house and the kitchen is instantaneous. Instead of waiting for orders to be delivered when the server has finished taking them, the kitchen can get to work as soon as the order is placed. And servers can be more efficient too – the time that might otherwise be spent running to and from the kitchen can be used to add value elsewhere.</p>' +       
                '<h5>Better data management</h5>' + 
                '<p>An ePOS system collects and organises key data that can be used to analyse the way customer service is currently delivered and make essential improvements. Data is readily available to those who regularly use it, whether that’s servers who need to access information about dish ingredients or allergens, or management making decisions about loyalty schemes. An ePOS infrastructure centralises data organisation and makes it possible to get better perspective on the business via its numbers.</p>' +       
                '<h5>Capacity, whether on or offline</h5>' + 
                '<p>Connectivity is not essential to ensuring that ePOS can support great customer service. Even if the internet goes down you’ll still have great functionality.</p>' +       
                '<p>If you’re looking to improve the customer service provided by your restaurant next year then an investment in ePOS could be essential. With this infrastructure in place you’ll be able to cut costs, organise the business and deliver far superior customer service as a result.</p>'
    },
    {
      id: '2',
      banner1: 'assets/features/knowledge2.png',
      banner2: 'assets/home/restaurant.png',
      title: 'Increasing your restaurant efficiency',
      content: '<p>Improving efficiency is an ongoing task for those in the restaurant industry. Cutting costs and making processes and systems work harder can be a challenge no matter what the type of establishment. However, thanks to the evolution of restaurant technology there are smart ways to deal with some of the most common inefficiencies. From struggling to attract diners and manage bookings through to losing income as a result of no shows, there are some simple ways to avoid some of the most common inefficiency pitfalls.<p>' + 
                '<h5>1. UPGRADE YOUR BOOKINGS SYSTEM</h5>' + 
                '<p>If you’re still using paper diaries to handle bookings then you’re leaving a lot of room for error. Upgrading to a single, unified CaPOS management system has numerous advantages. Not only will you have more perspective on how many bookings there are for each sitting but making amendments, sending booking reminders to avoid no shows and adding in walk-ins and last minute reservations is easy too. Plus, you’ll be able to start collecting data that can be fed into marketing strategy to help boost future booking numbers.</p>' + 
                '<h5>2. INTEGRATE CaPOS</h5>' + 
                '<p>An CaPOS system basically opens a channel of communication between the various parts of the restaurant, from payments and reservations to front of house and kitchen. This can help to improve efficiency in a myriad of ways, such as enabling more realistic stock management and increasing the speed at which orders can be processed and delivered. CaPOS also provides a real time perspective on availability that is crucial for better table management.</p>' + 
                '<h5>3. MAKE USE OF WAITING</h5>' + 
                '<p>Customers don’t like to be kept waiting but many are willing to do so in the right circumstances. If you don’t want to waste your walk-ins and you’re looking for ways to increase customer spend, waiting time offers many opportunities. The key is to provide somewhere comfortable that customers can wait, such as a bar area where they can order drinks and pre-dinner snacks. Use a smart technology system so that you can quantify how long the wait will be and provide an alert, whether via a device or to their smart phone, when the table is ready.</p>' + 
                '<h5>4. GO MOBILE</h5>' + 
                '<p>A huge 90% of people using their mobile devices to search for food end up being paying customers by the end of the day. Your business can instantly improve the efficiency of its ROI by putting that investment into mobile. From a mobile responsive website, to app booking and mobile payments, there are many processes that benefit from being given a mobile makeover.</p>' + 
                '<h5>5. MAKE USE OF THE DATA</h5>' + 
                '<p>Data from systems such as CaPOS has huge potential to transform the efficiency performance of a restaurant. Use it to refine marketing, upgrade the menu or predict no-shows and better manage booking to ensure that the restaurant is always operating at the right capacity.</p>' + 
                '<p>Restaurant efficiency depends on multiple different factors but the quality of the technology in use has a big influence. If you’re looking to improve the way your restaurant operates, the best place to start is with an CaPOS upgrade.</p>'
    }
  ];
  blog: BlogPost;

  constructor(private activatedRoute: ActivatedRoute) { }

  ngOnInit() {
    this.title = 'Blog Post';
    this.activatedRoute.params.subscribe(params => {
      const id = params['id'];
      this.blog = this.blogs.find(item => item.id == id);
    });
  }
}
