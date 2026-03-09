import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { BlogService } from '../../core/services/blog.service';
import { LangService } from '../../core/services/lang.service';
import { SeoService } from '../../core/services/seo.service';
import { BlogDto } from '../../core/models/models';
import { getImageUrl } from '../../core/models/models';

@Component({
  selector: 'app-blog',
  imports: [CommonModule, RouterLink, FormsModule],
  templateUrl: './blog.html',
})
export class BlogComponent implements OnInit {
  private blogService = inject(BlogService);
  private seo = inject(SeoService);
  lang = inject(LangService);

  blogs = signal<BlogDto[]>([]);
  loading = signal(true);
  searchQuery = '';
  currentPage = 1;
  totalPages = signal(1);
  totalItems = signal(0);
  limit = 12;

  ngOnInit() {
    this.seo.setPage(
      'Blog - Optowire',
      'Latest news, insights and updates from Optowire. Learn about fiber optic technology, network equipment and industry trends.'
    );
    this.loadBlogs();
  }

  loadBlogs() {
    this.loading.set(true);
    this.blogService.getPaged(this.currentPage, this.limit).subscribe({
      next: (r: any) => {
        const items = r?.entities || r?.items || r?.blogs || (Array.isArray(r) ? r : []);
        this.blogs.set(items);
        this.totalItems.set(r?.total || items.length);
        this.totalPages.set(r?.totalPages || Math.ceil((r?.total || items.length) / this.limit));
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
        this.blogs.set([]);
      }
    });
  }

  onSearch() {
    this.currentPage = 1;
    this.loadBlogs();
  }

  goToPage(page: number) {
    if (page < 1 || page > this.totalPages()) return;
    this.currentPage = page;
    this.loadBlogs();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  get pages(): number[] {
    const total = this.totalPages();
    const current = this.currentPage;
    const range: number[] = [];
    const start = Math.max(1, current - 2);
    const end = Math.min(total, start + 4);
    for (let i = start; i <= end; i++) range.push(i);
    return range;
  }

  getBlogImage(blog: BlogDto): string {
    return getImageUrl(blog.image || blog.coverImage, 'large');
  }

  formatDate(dateStr: string | undefined): string {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
  }

  getExcerpt(blog: BlogDto): string {
    if (blog.excerpt) return blog.excerpt;
    if (blog.summary) return blog.summary;
    if (blog.content) {
      const text = blog.content.replace(/<[^>]*>/g, '');
      return text.substring(0, 150) + (text.length > 150 ? '...' : '');
    }
    return '';
  }

  getBlogTitle(blog: BlogDto): string {
    return blog.title || blog.name || 'Untitled';
  }

  getBlogAuthor(blog: BlogDto): string {
    if (typeof blog.author === 'string') return blog.author;
    if (blog.author?.firstName && blog.author?.lastName) {
      return `${blog.author.firstName} ${blog.author.lastName}`;
    }
    if (blog.author?.firstName) return blog.author.firstName;
    return '';
  }
}
