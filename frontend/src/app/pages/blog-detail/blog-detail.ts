import { Component, inject, signal, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { BlogService } from '../../core/services/blog.service';
import { LangService } from '../../core/services/lang.service';
import { SeoService } from '../../core/services/seo.service';
import { BlogDto } from '../../core/models/models';
import { getImageUrl } from '../../core/models/models';
import { Subject, takeUntil } from 'rxjs';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';

@Component({
  selector: 'app-blog-detail',
  imports: [CommonModule, RouterLink],
  templateUrl: './blog-detail.html',
})
export class BlogDetailComponent implements OnInit, OnDestroy {
  private blogService = inject(BlogService);
  private route = inject(ActivatedRoute);
  private seo = inject(SeoService);
  private sanitizer = inject(DomSanitizer);
  lang = inject(LangService);

  blog = signal<BlogDto | null>(null);
  loading = signal(true);
  private destroy$ = new Subject<void>();

  ngOnInit() {
    this.route.paramMap.pipe(takeUntil(this.destroy$)).subscribe(params => {
      const slug = params.get('slug');
      if (slug) {
        this.loadBlog(slug);
      }
    });
  }

  loadBlog(slug: string) {
    this.loading.set(true);
    this.blogService.getBlog(slug).subscribe({
      next: (blog: BlogDto) => {
        this.blog.set(blog);
        this.loading.set(false);
        
        const title = blog.title || blog.name || 'Blog Post';
        
        // Set SEO metadata
        this.seo.setPage(
          title + ' - Optowire Blog',
          this.getExcerpt(blog)
        );
        
        // Set article schema for SEO
        const imageUrl = getImageUrl(blog.image || blog.coverImage, 'large');
        const publishDate = blog.date || blog.publishedAt || blog.createdAt || '';
        const authorName = this.getBlogAuthor(blog);
        
        this.seo.setArticleSchema(
          title,
          this.getExcerpt(blog),
          imageUrl,
          publishDate,
          authorName
        );
      },
      error: () => {
        this.loading.set(false);
      }
    });
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
      return text.substring(0, 160) + (text.length > 160 ? '...' : '');
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
    return 'Optowire';
  }

  getSanitizedContent(): SafeHtml {
    const blog = this.blog();
    if (!blog?.content) return '';
    return this.sanitizer.bypassSecurityTrustHtml(blog.content);
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
