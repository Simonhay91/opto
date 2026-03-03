import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { LangService } from '../../core/services/lang.service';
import { SeoService } from '../../core/services/seo.service';

@Component({
  selector: 'app-terms',
  imports: [CommonModule, RouterLink],
  templateUrl: './terms.html',
})
export class TermsComponent implements OnInit {
  lang = inject(LangService);
  private seo = inject(SeoService);

  lastUpdated = 'March 2026';

  sections = [
    {
      num: '1',
      title: 'Acceptance of Terms',
      content: 'By accessing and using the OPTOWIRE website, you confirm that you have read, understood, and agree to be bound by these Terms and Conditions. If you do not agree with these Terms, you must immediately discontinue use of the Site.'
    },
    {
      num: '2',
      title: 'Definitions',
      content: 'For the purposes of these Terms and Conditions, "OPTOWIRE" means a telecommunications infrastructure, security systems, and IoT solutions supplier headquartered in Qingdao, People\'s Republic of China. "Website" means the official OPTOWIRE website accessible at https://optowire.net/. "Workshop" and "Products" mean all equipment, systems, and solutions designed, manufactured, supplied, or customized by OPTOWIRE, including OEM and ODM products.'
    },
    {
      num: '3',
      title: 'Business Model',
      content: 'OPTOWIRE operates under a business-to-business (B2B) model and provides OEM and ODM manufacturing services. All information presented on the Website is intended for professional, commercial, and informational purposes only and shall not be construed as a public offer.'
    },
    {
      num: '4',
      title: 'Product Information',
      content: 'OPTOWIRE makes reasonable efforts to ensure that product information on the Website is accurate and up to date. However, product specifications, designs, availability, and features may be modified, updated, or discontinued at any time without prior notice. Product images and descriptions are provided for reference purposes only.'
    },
    {
      num: '5',
      title: 'Inquiries and Ordering',
      content: 'Users may submit product inquiries or Requests for Quotation (RFQ) through the Website. Submission of an inquiry does not constitute a contractual relationship. Any binding agreement shall be established only through a formal written contract, quotation, or purchase order confirmed by OPTOWIRE.'
    },
    {
      num: '6',
      title: 'Pricing and Payment',
      content: 'Pricing, payment terms, delivery conditions, and other commercial details are provided upon request through the RFQ process and finalized during commercial negotiations. All transactions are subject to mutually agreed contractual terms.'
    },
    {
      num: '7',
      title: 'Intellectual Property',
      content: 'All content on the Website, including but not limited to text, trademarks, logos, designs, technical documentation, and other intellectual property, is owned by OPTOWIRE or its licensors. Any unauthorized use, reproduction, modification, or distribution is strictly prohibited without prior written consent.'
    },
    {
      num: '8',
      title: 'Confidentiality',
      content: 'Any non-public technical, commercial, or business information exchanged between OPTOWIRE and the User shall be treated as confidential unless otherwise agreed in writing.'
    },
    {
      num: '9',
      title: 'Governing Law and Jurisdiction',
      content: 'These Terms and Conditions shall be governed by and construed in accordance with the laws of the People\'s Republic of China. Any disputes arising out of or in connection with these Terms shall be subject to the exclusive jurisdiction of the competent courts of Qingdao, China.'
    },
    {
      num: '10',
      title: 'Amendments',
      content: 'OPTOWIRE reserves the right to amend, update, or modify these Terms and Conditions at any time without prior notice. Continued use of the Website constitutes acceptance of the revised Terms.'
    },
  ];

  ngOnInit() {
    this.seo.setPage('Terms & Conditions', 'OPTOWIRE Terms and Conditions — B2B fiber optic and network equipment supplier, Qingdao, China.');
  }
}
