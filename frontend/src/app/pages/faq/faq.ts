import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { LangService } from '../../core/services/lang.service';
import { SeoService } from '../../core/services/seo.service';

interface FAQItem {
  question: string;
  answer: string;
}

@Component({
  selector: 'app-faq',
  imports: [CommonModule, RouterLink],
  templateUrl: './faq.html',
})
export class FaqComponent implements OnInit {
  private seo = inject(SeoService);
  lang = inject(LangService);

  openIndex = signal<number | null>(null);

  faqItems: FAQItem[] = [
    {
      question: 'What is OPTOWIRE?',
      answer: 'OPTOWIRE is a leading supplier of telecommunications infrastructure, security systems, and IoT solutions, offering both OEM and ODM services to business partners worldwide.'
    },
    {
      question: 'How can I become a partner with OPTOWIRE?',
      answer: 'To become a partner with OPTOWIRE, you can register on our website and submit your inquiries through the provided forms. Our team will review your request and respond with the necessary information to start a potential partnership.'
    },
    {
      question: 'What products does OPTOWIRE offer?',
      answer: 'OPTOWIRE offers a comprehensive range of products, which are fully showcased on our website. Each product comes with detailed technical specifications and descriptions, allowing partners and customers to explore our solutions in telecommunications, security systems, and IoT.'
    },
    {
      question: 'How do I request pricing for products?',
      answer: 'To request pricing, simply add the desired products and submit a Request for Quotation (RFQ) through our website. Our team will review your request and provide detailed pricing information, along with support for any additional technical or commercial inquiries.'
    },
    {
      question: 'Can I visit the OPTOWIRE workshop in Qingdao?',
      answer: 'Yes. Visits can be arranged by appointment. We will be happy to welcome you at our facility — 2/F, East Office Building, No. 45 Beijing Road, Qianwan Free Trade Port Area, Qingdao, China — or provide a virtual tour.'
    },
    {
      question: 'What are the payment terms for orders?',
      answer: 'Payment terms are determined during commercial negotiations after submitting a pricing request. OPTOWIRE strives to align terms with partners\' requirements while ensuring a clear, efficient, and responsible transaction process.'
    },
    {
      question: 'How can I contact OPTOWIRE for support?',
      answer: 'For technical support or general inquiries, you may contact our team via the website chat or through the "Contact Us" section. We are committed to providing prompt and professional assistance.'
    }
  ];

  toggle(index: number) {
    this.openIndex.set(this.openIndex() === index ? null : index);
  }

  ngOnInit() {
    this.seo.setPage(
      'Frequently Asked Questions',
      'Find answers to common questions about Optowire\'s fiber optic products, orders, shipping, payments, and technical support.'
    );
    this.seo.setFaqSchema(this.faqItems);
  }
}
