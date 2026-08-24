const EVENT_TYPES = {
  PRODUCT_VIEW: 'product_view',
  PRODUCT_SEARCH: 'product_search',
  CATEGORY_VIEW: 'category_view',
  SUBCATEGORY_VIEW: 'subcategory_view',
  ADD_TO_CART: 'add_to_cart',
  REMOVE_FROM_CART: 'remove_from_cart',
  PURCHASE: 'purchase'
};

const EVENT_TYPE_VALUES = Object.values(EVENT_TYPES);

module.exports = { EVENT_TYPES, EVENT_TYPE_VALUES };
