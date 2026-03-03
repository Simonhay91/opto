import { Component, inject, OnInit, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { LangService } from '../../core/services/lang.service';
import { CategoryService } from '../../core/services/category.service';

@Component({
  selector: 'app-footer',
  imports: [CommonModule, RouterLink],
  templateUrl: './footer.html',
})
export class FooterComponent implements OnInit {
  lang = inject(LangService);
  private cs = inject(CategoryService);

  categories = signal<any[]>([]);
  year = new Date().getFullYear();

  contact = {
    phone: '+86 150 9215 7630',
    email: 'info@optowire.net',
    address: '2/F, East Office Building, No. 45 Beijing Road, Qianwan Free Trade Port Area, Qingdao, China',
    addressZh: '青岛前湾自由贸易港区北京路45号东办公楼2楼',
  };

  ngOnInit() {
    this.cs.getAll().subscribe({
      next: (cats: any[]) => this.categories.set((cats || []).slice(0, 6)),
      error: () => {}
    });
  }
}
