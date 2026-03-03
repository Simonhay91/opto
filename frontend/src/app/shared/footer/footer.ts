import { Component, inject, OnInit, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { LangService } from '../../core/services/lang.service';
import { ProductService } from '../../core/services/product.service';
import { CategoryService } from '../../core/services/category.service';

@Component({
  selector: 'app-footer',
  imports: [CommonModule, RouterLink],
  templateUrl: './footer.html',
})
export class FooterComponent implements OnInit {
  lang = inject(LangService);
  private ps = inject(ProductService);
  private cs = inject(CategoryService);

  partnerName = signal('Optowire');
  partnerEmail = signal('');
  partnerSocials = signal<any[]>([]);
  categories = signal<any[]>([]);
  year = new Date().getFullYear();

  ngOnInit() {
    this.ps.getPartner().subscribe({
      next: (p: any) => {
        if (p?.name) this.partnerName.set(p.name);
        if (p?.email) this.partnerEmail.set(p.email);
        if (p?.socials?.length) this.partnerSocials.set(p.socials);
      },
      error: () => {}
    });
    this.cs.getAll().subscribe({
      next: (cats: any[]) => this.categories.set((cats || []).slice(0, 6)),
      error: () => {}
    });
  }
}
