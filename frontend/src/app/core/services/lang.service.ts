import { Injectable, signal } from '@angular/core';

export type Lang = 'en' | 'zh';

const T: Record<Lang, Record<string, string>> = {
  en: {
    home: 'Home', catalog: 'Products', about: 'About', contact: 'Contact Us',
    blog: 'Blog', brands: 'Brands', faq: 'FAQ', getQuote: 'Get a Quote',
    searchPlaceholder: 'Search products...', categories: 'Categories',
    filters: 'Filters', inStock: 'In Stock', outOfStock: 'Out of Stock',
    viewAll: 'View All', newArrivals: 'New Arrivals', topProducts: 'Top Products',
    featuredProducts: 'Featured Products', productDetails: 'Product Details',
    specifications: 'Specifications', model: 'Model', code: 'Code',
    stock: 'Stock', sortBy: 'Sort By', priceAsc: 'Price: Low to High',
    priceDesc: 'Price: High to Low', newest: 'Newest First',
    results: 'Results', noProducts: 'No products found',
    loading: 'Loading...', clearFilters: 'Clear Filters', clearAll: 'Clear All',
    quantity: 'Quantity', pricing: 'Pricing', perUnit: 'per unit',
    minQty: 'Min. Qty', requestQuote: 'Request a Quote',
    related: 'Related Products', breadcrumbHome: 'Home',
    ourCategories: 'Our Categories', ourBrands: 'Our Brands',
    chineseManufacturer: 'Chinese Manufacturer',
    aboutUs: 'About Optowire', hqChina: 'Headquartered in Qingdao, China',
    globalReach: 'Serving clients worldwide',
    telecom: 'Telecommunication', network: 'Network Equipment',
    security: 'Security Systems', iot: 'IoT Solutions',
    pages: 'Pages',
  },
  zh: {
    home: '首页', catalog: '产品目录', about: '关于我们', contact: '联系我们',
    blog: '博客', brands: '品牌', faq: '常见问题', getQuote: '获取报价',
    searchPlaceholder: '搜索产品...', categories: '分类',
    filters: '筛选', inStock: '有货', outOfStock: '缺货',
    viewAll: '查看全部', newArrivals: '新品上架', topProducts: '热门产品',
    featuredProducts: '精选产品', productDetails: '产品详情',
    specifications: '技术规格', model: '型号', code: '编号',
    stock: '库存', sortBy: '排序', priceAsc: '价格：从低到高',
    priceDesc: '价格：从高到低', newest: '最新',
    results: '结果', noProducts: '未找到产品',
    loading: '加载中...', clearFilters: '清除筛选', clearAll: '清除全部',
    quantity: '数量', pricing: '价格', perUnit: '每件',
    minQty: '最低数量', requestQuote: '询价',
    related: '相关产品', breadcrumbHome: '首页',
    ourCategories: '产品分类', ourBrands: '合作品牌',
    chineseManufacturer: '中国制造商',
    aboutUs: '关于Optowire', hqChina: '总部位于中国青岛',
    globalReach: '服务全球客户',
    telecom: '电信', network: '网络设备',
    security: '安防系统', iot: '物联网',
    pages: '页面',
  },
};

@Injectable({ providedIn: 'root' })
export class LangService {
  lang = signal<Lang>('en');

  t(key: string): string {
    return T[this.lang()][key] ?? T['en'][key] ?? key;
  }

  toggle() {
    this.lang.update(l => l === 'en' ? 'zh' : 'en');
  }
}
