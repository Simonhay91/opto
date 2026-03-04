import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LangService } from '../../core/services/lang.service';
import { SeoService } from '../../core/services/seo.service';

interface FAQItem {
  question: string;
  answer: string;
}

@Component({
  selector: 'app-faq',
  imports: [CommonModule],
  templateUrl: './faq.html',
})
export class FaqComponent implements OnInit {
  private seo = inject(SeoService);
  lang = inject(LangService);

  faqItems: FAQItem[] = [
    {
      question: 'What is OPTOWIRE?',
      answer: 'OPTOWIRE is a leading manufacturer of fiber optic cables and network equipment based in Qingdao, China. We specialize in designing and producing high-performance optical cables for various industries, including telecommunications, data communication, and aerospace.'
    },
    {
      question: 'How can I become a partner with OPTOWIRE?',
      answer: 'To become a partner with OPTOWIRE, please visit our "Become a Partner" page and fill out the partnership application form. Our team will review your application and contact you with further details about partnership opportunities and requirements.'
    },
    {
      question: 'What products does OPTOWIRE offer?',
      answer: 'OPTOWIRE offers a comprehensive range of products including fiber optic cables for telecommunications, network equipment such as switches and transceivers, security systems including CCTV and access control, and IoT solutions with smart devices and sensors.'
    },
    {
      question: 'How do I request pricing for products?',
      answer: 'You can request pricing by clicking the "Get a Quote" button on any product page or in the header. Fill out the quote request form with your requirements, and our sales team will respond with detailed pricing information within 24 hours.'
    },
    {
      question: 'Can I visit the OPTOWIRE workshop in Qingdao?',
      answer: 'Yes, we welcome visits to our manufacturing facility in Qingdao, China. Please contact us in advance to schedule a visit. Our address is: 2/F, East Office Building, No. 45 Beijing Road, Qianwan Free Trade Port Area, Qingdao, China.'
    },
    {
      question: 'What are the payment terms for orders?',
      answer: 'We offer flexible payment terms depending on order size and customer relationship. Common payment methods include T/T (bank transfer), L/C (Letter of Credit), and other arrangements. Please contact our sales team to discuss specific payment terms for your order.'
    },
    {
      question: 'How can I contact OPTOWIRE for support?',
      answer: 'You can contact us via phone at +86 150 9215 7630, email at info@optowire.net, or through our contact form on the website. Our customer support team is available 24/7 to assist you with technical questions, order inquiries, and any other concerns.'
    }
  ];

  ngOnInit() {
    this.seo.setPage(
      'Frequently Asked Questions | Optowire',
      'Find answers to common questions about Optowire\'s services, orders, shipping, payments, and more.'
    );
  }
}
