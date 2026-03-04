import { Component, inject, OnInit, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { LangService } from '../../core/services/lang.service';
import { SUPPORTED_CATEGORIES } from '../../core/config/categories.config';

@Component({
  selector: 'app-footer',
  imports: [CommonModule, RouterLink],
  templateUrl: './footer.html',
})
export class FooterComponent implements OnInit {
  lang = inject(LangService);

  categories = signal<any[]>([]);
  year = new Date().getFullYear();

  contact = {
    phone: '+86 150 9215 7630',
    email: 'info@optowire.net',
    address: '2/F, East Office Building, No. 45 Beijing Road, Qianwan Free Trade Port Area, Qingdao, China',
    addressZh: '青岛前湾自由贸易港区北京路45号东办公楼2楼',
  };

  ngOnInit() {
    // Use supported categories instead of API call
    this.categories.set(SUPPORTED_CATEGORIES);
  }
}
