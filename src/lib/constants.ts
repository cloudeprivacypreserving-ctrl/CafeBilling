export const userRoles = {
  ADMIN: 'ADMIN',
  MANAGER: 'MANAGER',
  CASHIER: 'CASHIER',
} as const

export const orderTypes = {
  DINE_IN: 'DINE_IN',
  TAKEAWAY: 'TAKEAWAY',
} as const

export const paymentMethods = {
  CASH: 'CASH',
  CARD: 'CARD',
  UPI: 'UPI',
} as const

export const auditActions = {
  ORDER_CREATED: 'ORDER_CREATED',
  ORDER_COMPLETED: 'ORDER_COMPLETED',
  ORDER_CANCELLED: 'ORDER_CANCELLED',
  ORDER_REFUNDED: 'ORDER_REFUNDED',
  MENU_ITEM_CREATED: 'MENU_ITEM_CREATED',
  MENU_ITEM_UPDATED: 'MENU_ITEM_UPDATED',
  MENU_ITEM_DELETED: 'MENU_ITEM_DELETED',
  USER_CREATED: 'USER_CREATED',
  USER_UPDATED: 'USER_UPDATED',
  SETTINGS_UPDATED: 'SETTINGS_UPDATED',
} as const

export const menuCategories = {
  TODAYS_EXCLUSIVE: "Today's Exclusive Dishes",
  VALUE_MEALS: "Value Meals",
  COMBOS: "Combos",
  QUICK_BITES: "Quick Bites",
  COSY_SPECIAL_SNACKS: "Cosy Special Snacks",
  BURGERS_PANEER: "Burgers and Sandwiches - Paneer Burgers",
  GRILLED_SANDWICHES: "Burgers and Sandwiches - Grilled Sandwiches",
  BURGERS: "Burgers and Sandwiches - Burgers",
  PIZZA: "Pizza",
  FRIES: "Fries",
  HOT_BREW: "Hot Brew",
  COLD_BREWS: "Drinks (Beverages) - Cold Brews",
  SHAKES: "Drinks (Beverages) - Shakes",
  MOCKTAILS: "Drinks (Beverages) - Mocktails",
  PASTA: "Pasta",
  MAGGI: "Maggi"
} as const

