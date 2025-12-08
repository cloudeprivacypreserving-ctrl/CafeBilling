#!/usr/bin/env node

/**
 * Create complete mapping with smart matching
 */

const fs = require('fs');
const path = require('path');

const menuItems = require('../prisma/menu-items.js').menuItemsData;

// Manual mapping for unmatched files based on filename analysis
const manualMappings = {
  'aloo4_fries2.png': '4 Aloo Tikki Burger + 2 Fries',
  'aloo5.png': 'Aloo Tikki Burger [Pack of 5]',
  'aloo_coffee.png': 'Aloo Tikki Burger with Thick Cold Coffee',
  'aloo_fries.png': 'Aloo Tikki Burger with French Fries',
  'aloo_fries_coffee.png': 'Aloo Tikki Burger with French Fries and Cold Coffee',
  'aloo_giant.png': 'Gaint Aloo Tikki Burger',
  'aloo_single.png': 'Aloo Tikki Burger',
  'aloo_tower.png': 'Veg Aloo Tower Burger',
  'blue_heaven.png': 'Blue Heaven Mocktail',
  'cheese8.png': 'High On Cheese Pizza [8 inches]',
  'cheese_chilli.png': 'Cheese Chilli Grilled Sandwich',
  'cheese_fries_coffee.png': 'Grilled Cheese Sandwich with Cold Coffee',
  'cheese_grill_coffee.png': 'Grilled Cheese Sandwich with Cold Coffee',
  'cheese_pav.png': 'Cheese Masala Pav',
  'cheeseballs6.png': 'Potato Cheese Balls [6 Pieces]',
  'cheesy_pasta.png': 'Cosy Special Cheesy Pasta',
  'coldcoffee.png': 'Cold Coffee',
  'corn_tikki.png': 'Corn Tikki Burger',
  'corn_triangle.png': 'Corn Cheese Triangle',
  'corncap_grill.png': 'Corn Capsicum Cheese Grilled Sandwich',
  'cornpaneer8.png': 'Corn Paneer Pizza [8 inches]',
  'cornveg8.png': 'Corn Veggie Delight [8 inches]',
  'cosy_cheese.png': 'Cafe Cosy Town Special Cheese Sandwich',
  'double_tikki.png': 'Cafe Cosy Town Special Double Tikki Burger',
  'fries_cheese.png': 'Cafe Cosy Town Special Cheese Blast Fries',
  'fries_coffee.png': 'French Fries with Cold Coffee',
  'fries_masala.png': 'Cafe Cosy Town Special Masala Fries',
  'fries_periperi.png': 'Peri Peri Fries',
  'fries_salt.png': 'Salted Fries',
  'garlic_cheese.png': 'Cheesy Garlic Bread',
  'hotchoco.png': 'Hot Chocolate',
  'hotcoffee.png': 'Hot Coffee',
  'jeera_special.png': 'Special Jeera Masala',
  'maggi_masala.png': 'Masala Maggi',
  'maggi_paneer.png': 'Paneer Masala Maggi',
  'maggi_peri.png': 'Peri Peri Maggi',
  'maggi_veg.png': 'Veg Maggi',
  'marg8.png': 'Margherita [8 inches]',
  'marg8_garlic.png': 'Margherita Pizza [8 inches] with Garlic Bread',
  'marg_coffee.png': 'Margherita Pizza with Cold Coffee',
  'mojito.png': 'Virgin Mojito',
  'nuggets6.png': 'Veg Nuggets [6 Pieces]',
  'paneer_masala_grill.png': 'Masala Paneer Grilled Sandwich',
  'paneer_spicy8.png': 'Spicy Paneer Pizza [8 inches]',
  'paneer_tandoori8.png': 'Tandoori Paneer Pizza [8 inches]',
  'paneer_tikki.png': 'Paneer Tikki Burger',
  'pavbhaji2.png': 'Bombay Style Pav Bhaji [2 Pav]',
  'pavbhaji_hotcoffee.png': 'Pav Bhaji with Hot Coffee',
  'peri_maggi.png': 'Peri Peri Maggi',
  'red_pasta.png': 'Red Sauce Pasta',
  'shake_brownie.png': 'Brownie (Thick Shake)',
  'shake_brownie_nutella.png': 'Brownie Nutella Thickshake',
  'shake_choco.png': 'Chocolate (Thick Shake)',
  'shake_kitkat.png': 'Kitkat (Thick Shake)',
  'shake_nutella.png': 'Nutella (Thick Shake)',
  'shake_oreo.png': 'Oreo (Thick Shake)',
  'shake_strawberry.png': 'Strawberry (Milk Shake)',
  'tandoori_burger.png': 'Tandoori Paneer Burger',
  'tea.png': 'Tea',
  'thickcoffee.png': 'Thick Coffee',
  'town_special8.png': 'Towns Special Pizza [8 inches]',
  'veg_grill.png': 'Veg Grilled Sandwich',
  'veg_tikki.png': 'Veg Tikki Burger',
  'vegcheese_grill.png': 'Veg Cheese Grilled Sandwich',
  'white_garlic.png': 'Margherita Pizza [8 inches] with Garlic Bread',
  'white_pasta.png': 'White Sauce Pasta',
};

// Read blob URLs
const urlsContent = fs.readFileSync('blob-urls-list.txt', 'utf-8');
const blobUrls = {};

urlsContent.split('\n').forEach(line => {
  if (!line.trim()) return;
  const [filename, url] = line.split('=');
  blobUrls[filename.trim()] = url.trim();
});

// Create complete mapping
const mapping = {};
const matched = [];
const unmatched = [];

Object.entries(manualMappings).forEach(([filename, menuName]) => {
  const blobKey = `menus/${filename}`;
  if (blobUrls[blobKey]) {
    mapping[menuName] = blobUrls[blobKey];
    matched.push(filename);
  } else {
    unmatched.push(filename);
  }
});

// Save mapping
fs.writeFileSync('image-mapping-complete.json', JSON.stringify(mapping, null, 2));

console.log(`✅ Complete mapping created`);
console.log(`   Total: ${matched.length} files mapped`);
console.log(`   Unmatched: ${unmatched.length}\n`);

if (unmatched.length > 0) {
  console.log('⚠️  Could not map:');
  unmatched.forEach(f => console.log(`   - ${f}`));
  console.log('');
}

console.log('📁 Saved to: image-mapping-complete.json\n');
console.log('📝 Next: node scripts/bulk-update-images.js image-mapping-complete.json\n');
