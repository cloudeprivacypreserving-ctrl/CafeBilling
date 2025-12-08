# Bulk Update Menu Images

This guide explains how to quickly update all your menu items with blob storage image URLs.

## Quick Start (3 Steps)

### Step 1: Prepare Your Image Mapping File

Create a JSON file (e.g., `image-urls.json`) with menu item names and their blob URLs:

```json
{
  "Aloo Tikki Burger": "https://backend-files.public.blob.vercel-storage.com/menus/AlooTikkiBurger.png",
  "Pav Bhaji with Hot Coffee": "https://backend-files.public.blob.vercel-storage.com/menus/PavBhaji.png",
  "4 Aloo Tikki Burger + 2 Fries": "https://backend-files.public.blob.vercel-storage.com/menus/ComboFries.png"
}
```

**Tips:**
- Use **exact menu item names** (case-sensitive match)
- Get blob URLs from your Vercel Blob dashboard (click "Copy URL" button)
- You can leave items blank if you don't have images for them yet

### Step 2: Run the Update Script

```bash
cd d:\Projects\CafeBill
node scripts/bulk-update-images.js scripts/image-urls.json
```

Or if you used a different filename:
```bash
node scripts/bulk-update-images.js path/to/your-mapping-file.json
```

### Step 3: Verify

1. Check the console output for success/error messages
2. A results file will be created: `update-results.json`
3. Visit your admin dashboard → Menu Management to verify images appear

---

## Getting Blob URLs from Vercel

1. Go to your Vercel project dashboard
2. Find **Storage** → **Blob Store** 
3. Navigate to `menus/` folder
4. For each image, click the **three dots (...)** menu
5. Select **Copy URL**
6. Paste into your mapping JSON file

---

## Example Workflow

### Before Update
```json
{
  "Aloo Tikki Burger": "https://placehold.co/400x400?text=Coming+Soon",
  "Pav Bhaji": ""
}
```

### After Update
```json
{
  "Aloo Tikki Burger": "https://backend-files.public.blob.vercel-storage.com/menus/AlooTikkiBurger_12345.png",
  "Pav Bhaji": "https://backend-files.public.blob.vercel-storage.com/menus/PavBhaji_67890.png"
}
```

---

## Troubleshooting

### "Menu item not found"
- Check the exact menu name spelling and case
- Look at your database for correct names

### Script doesn't run
- Make sure you're in the project root directory
- Check file path is correct

### Images not showing after update
- Verify blob URLs are accessible (test in browser)
- Check Next.js image config allows the blob domain (already configured ✅)
- Try hard refresh (Ctrl+F5)

---

## Alternative: Manual Update via Admin

If you prefer not to use the script:

1. Go to Dashboard → Menu Management
2. Click the **Edit** button (pencil icon) for each item
3. Paste blob URL in the **"Image URL"** field
4. Click **Update**

This works fine for small catalogs but is slower for many items.

---

## Tips & Best Practices

✅ **Do:**
- Use the script for bulk updates (saves time)
- Test with a few items first
- Keep a backup of your mapping JSON
- Verify blob URLs are public/accessible

❌ **Don't:**
- Use old placeholder URLs
- Mix different blob storage accounts
- Update while customers are browsing (though it's safe)

---

## Need Help?

If you encounter issues:
1. Check the `update-results.json` file for detailed error messages
2. Run the script with a smaller test set first
3. Verify blob URLs are correct by opening them in a browser

Good luck! 🚀
