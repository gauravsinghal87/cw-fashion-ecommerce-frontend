const AUTH = {
  REGISTER: '/auth/register',
  LOGIN: '/auth/login',
  LOGOUT: '/auth/logout',
  REFRESH_TOKEN: '/auth/refresh-token',
  VERIFY_EMAIL: '/auth/verify-email',
  RESEND_VERIFICATION: '/auth/resend-verification',
  FORGOT_PASSWORD: '/auth/forgot-password',
  RESET_PASSWORD: '/auth/reset-password',
  SOCIAL_LOGIN: '/auth/social-login',
  GET_ME: '/auth/me',
  UPDATE_PASSWORD: '/auth/update-password',
};

const USERS = {
  PROFILE: '/users/profile',
  WISHLIST: '/users/wishlist',
  WISHLIST_ITEM: (id) => `/users/wishlist/${id}`,
  WISHLIST_CLEAR: '/users/wishlist',
  ADDRESSES: '/users/addresses',
  ADDRESS: (id) => `/users/addresses/${id}`,
  ADDRESS_DEFAULT: (id) => `/users/addresses/${id}/default`,
};

const PRODUCTS = {
  BASE: '/products',
  FEATURED: '/products/featured',
  NEW_ARRIVALS: '/products/new-arrivals',
  BEST_SELLERS: '/products/best-sellers',
  TRENDING: '/products/trending',
  FLASH_SALE: '/products/flash-sale',
  DETAIL: (id) => `/products/${id}`,
  RELATED: (id) => `/products/${id}/related`,
  REVIEWS: (id) => `/products/${id}/reviews`,
  REVIEWS_STATS: (id) => `/products/${id}/reviews/stats`,
  REVIEW_REPLY: (productId, reviewId) => `/products/${productId}/reviews/${reviewId}/reply`,
  VENDOR: (vendorId) => `/products/vendor/${vendorId}`,
};

const SEARCH = {
  SEARCH: '/search',
  SUGGESTIONS: '/search/suggestions',
};

const CART = {
  BASE: '/cart',
  ADD: '/cart/add',
  ITEM: (id) => `/cart/${id}`,
  APPLY_COUPON: '/cart/apply-coupon',
  COUPON: (code) => `/cart/coupon/${code}`,
  CLEAR: '/cart/',
};

const ORDERS = {
  CREATE: '/orders',
  DETAIL: (id) => `/orders/${id}`,
  CANCEL: (id) => `/orders/${id}/cancel`,
  INVOICE: (id) => `/orders/${id}/invoice`,
  RAZORPAY_CREATE: '/orders/create-razorpay-order',
  RAZORPAY_VERIFY: '/orders/verify-razorpay-payment',
};

const RETURNS = {
  CREATE: '/returns',
  LIST: '/returns',
  DETAIL: (id) => `/returns/${id}`,
  DETAIL_ADMIN: (id) => `/returns/${id}/detail`,
  APPROVE: (id) => `/returns/${id}/approve`,
  REJECT: (id) => `/returns/${id}/reject`,
  SCHEDULE_PICKUP: (id) => `/returns/${id}/schedule-pickup`,
  CONFIRM_PICKUP: (id) => `/returns/${id}/confirm-pickup`,
  RECEIVE: (id) => `/returns/${id}/receive`,
  QC_PASS: (id) => `/returns/${id}/qc-pass`,
  QC_FAIL: (id) => `/returns/${id}/qc-fail`,
  REFUND: (id) => `/returns/${id}/refund`,
  DISPUTE: (id) => `/returns/${id}/dispute`,
  RESOLVE_DISPUTE: (id) => `/returns/${id}/resolve-dispute`,
};

const WALLET = {
  BASE: '/wallet',
  TRANSACTIONS: '/wallet/transactions',
  ADD_MONEY: '/wallet/add-money',
};

const REFERRALS = {
  CODE: '/referrals/code',
  ANALYTICS: '/referrals/analytics',
  LIST: '/referrals/list',
  CLAIM: '/referrals/claim',
  RELEASE: '/referrals/release',
};

const CATEGORIES = {
  BASE: '/categories',
};

const BRANDS = {
  BASE: '/brands',
  DETAIL: '/brands/slug', // + /:slug
};

const BANNERS = {
  BASE: '/banners',
  ITEM: (id) => `/banners/${id}`,
};

const UPLOAD = {
  BASE: '/upload',
  DELETE: (publicId) => `/upload/${publicId}`,
};

const CMS = {
  PAGE: (page) => `/cms/${page}`,
};

const FOOTER = {
  GET: '/footer',
  ADMIN_GET: '/admin/footer',
  ADMIN_UPDATE: '/admin/footer',
};

const VENDORS = {
  REGISTER: '/vendors/register',
  LOGIN: '/vendors/login',
  PROFILE: '/vendors/profile',
  UPDATE_PROFILE: '/vendors/profile',
  DASHBOARD: '/vendors/dashboard',
  PRODUCTS: '/vendors/products',
  PRODUCT_DETAIL: (id) => `/vendors/products/${id}`,
  ORDERS: '/vendors/orders',
  ORDER_DETAIL: (id) => `/vendors/orders/${id}`,
  ORDER_ITEM_STATUS: (orderId, itemId) => `/vendors/orders/${orderId}/items/${itemId}/status`,
  RETURNS: '/vendors/returns',
  RETURN_DETAIL: (id) => `/vendors/returns/${id}`,
  RETURN_STATUS: (id) => `/vendors/returns/${id}/status`,
  ANALYTICS: '/vendors/analytics',
  WALLET: '/vendors/wallet',
  WALLET_TRANSACTIONS: '/vendors/wallet/transactions',
  WITHDRAWALS: '/vendors/withdrawals',
  WITHDRAWAL_REQUEST: '/vendors/withdrawals',
  REVIEWS: '/vendors/reviews',
  BULK_UPLOAD: '/vendors/bulk-upload',
  EXPORT_PRODUCTS: '/vendors/export-products',
  // Store Management
  STORE_PROFILE: '/vendors/store/profile',
  STORE_UPDATE: '/vendors/store/profile',
  STORE_SEO: '/vendors/store/seo',
  STORE_SEO_UPDATE: '/vendors/store/seo',
  // Warehouse Management
  WAREHOUSES: '/vendors/warehouses',
  WAREHOUSE_CREATE: '/vendors/warehouses',
  WAREHOUSE_UPDATE: (id) => `/vendors/warehouses/${id}`,
  WAREHOUSE_DELETE: (id) => `/vendors/warehouses/${id}`,
  // Inventory Management
  INVENTORY: '/vendors/inventory',
  INVENTORY_UPDATE: '/vendors/inventory/update',
  INVENTORY_WAREHOUSE: (id) => `/vendors/inventory/warehouse/${id}`,
  INVENTORY_ADD: '/vendors/inventory/add-stock',
  INVENTORY_REMOVE: '/vendors/inventory/remove-stock',
  INVENTORY_TRANSFER: '/vendors/inventory/transfer',
  INVENTORY_DAMAGED: '/vendors/inventory/damaged',
  INVENTORY_HISTORY: '/vendors/inventory/history',
  INVENTORY_LOW_STOCK: '/vendors/inventory/low-stock',
  INVENTORY_DASHBOARD: '/vendors/inventory/dashboard',
  INVENTORY_BULK_IMPORT: '/vendors/inventory/bulk-import',
  // Product Variants
  VARIANTS: '/vendors/variants',
  VARIANT_CREATE: '/vendors/variants',
  VARIANT_UPDATE: (id) => `/vendors/variants/${id}`,
  VARIANT_DELETE: (id) => `/vendors/variants/${id}`,
  // Invoices
  INVOICES: '/vendors/invoices',
  INVOICE_GENERATE: (orderId) => `/vendors/invoices/generate/${orderId}`,
  INVOICE_DOWNLOAD: (invoiceId) => `/vendors/invoices/download/${invoiceId}`,
  // Customers
  CUSTOMERS: '/vendors/customers',
  CUSTOMER_DETAIL: (id) => `/vendors/customers/${id}`,
  // Settlements
  SETTLEMENTS: '/vendors/settlements',
  SETTLEMENT_DETAIL: (id) => `/vendors/settlements/${id}`,
  // Notifications
  NOTIFICATIONS: '/vendors/notifications',
  NOTIFICATIONS_MARK_READ: '/vendors/notifications/mark-read',
  NOTIFICATIONS_MARK_ALL_READ: '/vendors/notifications/mark-all-read',
  // Support
  SUPPORT_TICKETS: '/vendors/support/tickets',
  SUPPORT_TICKET_CREATE: '/vendors/support/tickets',
  SUPPORT_TICKET_DETAIL: (id) => `/vendors/support/tickets/${id}`,
  SUPPORT_TICKET_REPLY: (id) => `/vendors/support/tickets/${id}/reply`,
  SUPPORT_TICKET_REOPEN: (id) => `/vendors/support/tickets/${id}/reopen`,
  SUPPORT_TICKET_FEEDBACK: (id) => `/vendors/support/tickets/${id}/feedback`,
  // Audit Logs
  AUDIT_LOGS: '/vendors/audit-logs',
};

const REVIEWS = {
  CREATE: '/reviews',
  MY: '/reviews/my',
  PRODUCT: (id) => `/reviews/product/${id}`,
  PRODUCT_STATS: (id) => `/reviews/product/${id}/stats`,
  PRODUCT_MEDIA: (id) => `/reviews/product/${id}/media`,
  DETAIL: (id) => `/reviews/${id}`,
  UPDATE: (id) => `/reviews/${id}`,
  DELETE: (id) => `/reviews/${id}`,
  HELPFUL: (id) => `/reviews/${id}/helpful`,
  REPORT: (id) => `/reviews/${id}/report`,
  // Vendor
  VENDOR_ALL: '/reviews/vendor/all',
  VENDOR_REPLY: (id) => `/reviews/vendor/${id}/reply`,
  VENDOR_REPORT: (id) => `/reviews/vendor/${id}/report`,
  // Admin
  ADMIN_ALL: '/reviews/admin/all',
  ADMIN_APPROVE: (id) => `/reviews/admin/${id}/approve`,
  ADMIN_REJECT: (id) => `/reviews/admin/${id}/reject`,
  ADMIN_HIDE: (id) => `/reviews/admin/${id}/hide`,
  ADMIN_RESTORE: (id) => `/reviews/admin/${id}/restore`,
  ADMIN_RESOLVE_REPORT: (id) => `/reviews/admin/${id}/resolve-report`,
  ADMIN_BAN_REVIEWER: (id) => `/reviews/admin/${id}/ban-reviewer`,
};

const COUPONS = {
  AVAILABLE: '/coupons/available',
};

const SUPPORT = {
  TICKETS: '/support/tickets',
  TICKET: (id) => `/support/tickets/${id}`,
  REPLY: (id) => `/support/tickets/${id}/reply`,
  REOPEN: (id) => `/support/tickets/${id}/reopen`,
  FEEDBACK: (id) => `/support/tickets/${id}/feedback`,
};

const ADMIN_SUPPORT = {
  STATS: '/admin/support/stats',
  TICKETS: '/admin/support/tickets',
  TICKET: (id) => `/admin/support/tickets/${id}`,
  REPLY: (id) => `/admin/support/tickets/${id}/reply`,
  ASSIGN: (id) => `/admin/support/tickets/${id}/assign`,
  STATUS: (id) => `/admin/support/tickets/${id}/status`,
  ESCALATE: (id) => `/admin/support/tickets/${id}/escalate`,
  NOTES: (id) => `/admin/support/tickets/${id}/notes`,
  AGENTS: '/admin/support/agents',
};

const ADMIN = {
  DASHBOARD: '/admin/dashboard',
  USERS: '/admin/users',
  VENDORS: '/admin/vendors',
  VENDOR_APPROVE: (id) => `/admin/vendors/${id}/approve`,
  VENDOR_REJECT: (id) => `/admin/vendors/${id}/reject`,
  PRODUCTS: '/admin/products',
  PRODUCT_APPROVE: (id) => `/admin/products/${id}/approve`,
  PRODUCT_REJECT: (id) => `/admin/products/${id}/reject`,
  PRODUCT_HIDE: (id) => `/admin/products/${id}/hide`,
  PRODUCT_UNHIDE: (id) => `/admin/products/${id}/unhide`,
  PRODUCT_TOGGLE_FEATURED: (id) => `/admin/products/${id}/toggle-featured`,
  PRODUCT_FLASH_SALE: (id) => `/admin/products/${id}/flash-sale`,
  PRODUCT_TOGGLE_RETURNABLE: (id) => `/admin/products/${id}/toggle-returnable`,
  ORDERS: '/admin/orders',
  ORDER_CANCEL: (id) => `/admin/orders/${id}/cancel`,
  CATEGORIES: '/admin/categories',
  CATEGORY: (id) => `/admin/categories/${id}`,
  BRANDS: '/admin/brands',
  BRAND: (id) => `/admin/brands/${id}`,
  COUPONS: '/admin/coupons',
  COUPON: (id) => `/admin/coupons/${id}`,
  COUPON_ANALYTICS: '/admin/coupons/analytics',
  WITHDRAWALS: '/admin/withdrawals',
  WITHDRAWAL_ACTION: (id, action) => `/admin/withdrawals/${id}/${action}`,
  RETURNS: '/admin/returns',
  BANNERS: '/admin/banners',
  CMS: '/admin/cms',
  CMS_CREATE: '/admin/cms',
  CMS_PAGE: (page) => `/admin/cms/${page}`,
  CMS_DELETE: (page) => `/admin/cms/${page}`,
  REPORTS_REVENUE: '/admin/reports/revenue',
  REPORTS_VENDORS: '/admin/reports/vendors',
  REPORTS_PRODUCTS: '/admin/reports/products',
  REPORTS_REFERRALS: '/admin/reports/referrals',
  NOTIFICATIONS: '/admin/notifications',
  NOTIFICATIONS_SEND: '/admin/notifications/send',
  COMMISSION: '/admin/commission',
  SUB_ADMINS: '/admin/sub-admins',
  SUB_ADMIN: (id) => `/admin/sub-admins/${id}`,
  ROLES: '/admin/roles',
  ROLE: (id) => `/admin/roles/${id}`,
  SEO: '/admin/seo',
  AUDIT_LOGS: '/admin/audit-logs',
  SHIPPING: '/admin/shipping',
  // User Management
  USER: (id) => `/admin/users/${id}`,
  USER_TOGGLE_STATUS: (id) => `/admin/users/${id}/toggle-status`,
  USER_BAN: (id) => `/admin/users/${id}/ban`,
  USER_ORDERS: (userId) => `/admin/users/${userId}/orders`,
  USER_RESET_PASSWORD: (id) => `/admin/users/${id}/reset-password`,
  USER_IMPERSONATE: (id) => `/admin/users/${id}/impersonate`,
  USER_WALLET_ADJUST: (userId) => `/admin/users/${userId}/wallet/adjust`,
  // Vendor Management
  VENDOR: (id) => `/admin/vendors/${id}`,
  VENDOR_SUSPEND: (id) => `/admin/vendors/${id}/suspend`,
  VENDOR_BAN: (id) => `/admin/vendors/${id}/ban`,
  VENDOR_UPDATE: (id) => `/admin/vendors/${id}`,
  // Order Management
  ORDER: (id) => `/admin/orders/${id}`,
  ORDER_INVOICE: (id) => `/admin/orders/${id}/invoice`,
  ORDER_FORCE_DELIVER: (id) => `/admin/orders/${id}/force-deliver`,
  ORDER_FORCE_REFUND: (id) => `/admin/orders/${id}/force-refund`,
  ORDER_SETTLE: '/admin/orders/settle',
  SETTLEMENTS: '/admin/settlements',
  SETTLEMENTS_RELEASE: '/admin/settlements/release',
  // Return Management
  RETURN_DETAIL: (id) => `/admin/returns/${id}`,
  RETURN_APPROVE: (id) => `/admin/returns/${id}/approve`,
  RETURN_REJECT: (id) => `/admin/returns/${id}/reject`,
  RETURN_SCHEDULE_PICKUP: (id) => `/admin/returns/${id}/schedule-pickup`,
  RETURN_CONFIRM_PICKUP: (id) => `/admin/returns/${id}/confirm-pickup`,
  RETURN_RECEIVE: (id) => `/admin/returns/${id}/receive`,
  RETURN_QC_PASS: (id) => `/admin/returns/${id}/qc-pass`,
  RETURN_QC_FAIL: (id) => `/admin/returns/${id}/qc-fail`,
  RETURN_REFUND: (id) => `/admin/returns/${id}/refund`,
  RETURN_RESOLVE_DISPUTE: (id) => `/admin/returns/${id}/resolve-dispute`,
  // Banner Management
  BANNER_CREATE: '/admin/banners',
  BANNER_UPDATE: (id) => `/admin/banners/${id}`,
  BANNER_DELETE: (id) => `/admin/banners/${id}`,
  WALLET_TRANSACTIONS: '/admin/wallet-transactions',
  RETURN_SETTINGS: '/admin/return-settings',
  REFERRAL_SETTINGS: '/admin/referral-settings',
  REFERRALS_LIST: '/admin/referrals',
  REFERRAL_FLAG_FRAUD: (id) => `/admin/referrals/${id}/flag-fraud`,
  REFERRAL_REVERSE: (id) => `/admin/referrals/${id}/reverse`,
  INVENTORY: '/admin/inventory',
  REPORTS_ORDERS: '/admin/reports/orders',
};

export const API = {
  AUTH,
  USERS,
  PRODUCTS,
  REVIEWS,
  SEARCH,
  CART,
  COUPONS,
  ORDERS,
  RETURNS,
  WALLET,
  REFERRALS,
  CATEGORIES,
  BRANDS,
  BANNERS,
  UPLOAD,
  CMS,
  FOOTER,
  VENDORS,
  SUPPORT,
  ADMIN_SUPPORT,
  ADMIN,
};